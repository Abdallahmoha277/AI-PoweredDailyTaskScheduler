// @ts-ignore

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');

  // =====================================================================
  // Delete Account endpoint
  // =====================================================================
  if (path.endsWith('/delete-account')) {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Missing authorization header' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const token = authHeader.replace('Bearer ', '');

      // @ts-ignore
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      // @ts-ignore
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      // @ts-ignore
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

      if (!supabaseUrl || !serviceRoleKey || !anonKey) {
        return new Response(
          JSON.stringify({ error: 'Server misconfigured' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify the user's token
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: anonKey,
        },
      });

      if (!userRes.ok) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userData = await userRes.json();
      const userId = userData.id;

      if (!userId) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Delete the user using the admin API
      const deleteRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (!deleteRes.ok) {
        const errorText = await deleteRes.text();
        console.error('Failed to delete user:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to delete account' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      console.error('Delete account error:', err);
      return new Response(
        JSON.stringify({ error: err.message || 'Unknown error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // =====================================================================
  // AI Task Parser (existing functionality)
  // =====================================================================
  try {
    const { text } = await req.json();
    // @ts-ignore
    const apiKey = Deno.env.get('AI-PoweredDailyTaskScheduler_API_KEY');

    if (!apiKey) {
      throw new Error('Did not find OpenAI API key');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are an intelligent task management assistant. Extract task details from the user's input text, which may be in Arabic or English. 
            You must return the result strictly as a JSON object containing 3 keys:
            - title: A brief task title (text, keeping the original language or translating appropriately).
            - estimated_duration: Estimated duration like '30m', '1h', '2h'. (Default to '30m' if not mentioned).
            - priority: Priority as 'low', 'medium', or 'high'. (Infer from context, e.g., words like "عاجل" or "urgent" mean high).`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      throw new Error(`OpenAI Error: ${data.error.message}`);
    }
    const parsedContent = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});