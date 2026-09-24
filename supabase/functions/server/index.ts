// @ts-ignore

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()
    // @ts-ignore
    const apiKey = Deno.env.get('AI-PoweredDailyTaskScheduler_API_KEY')

    if (!apiKey) {
      throw new Error("Did not find OpenAI API key");
    }

    // إرسال الطلب إلى OpenAI
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: "json_object" }, 
        messages: [
          {
            role: 'system',
            content: `You are an intelligent task management assistant. Extract task details from the user's input text, which may be in Arabic or English. 
            You must return the result strictly as a JSON object containing 3 keys:
            - title: A brief task title (text, keeping the original language or translating appropriately).
            - estimated_duration: Estimated duration like '30m', '1h', '2h'. (Default to '30m' if not mentioned).
            - priority: Priority as 'low', 'medium', or 'high'. (Infer from context, e.g., words like "عاجل" or "urgent" mean high).`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3
      })
    })

    const data = await response.json()
    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      throw new Error(`OpenAI Error: ${data.error.message}`);
    }
    const parsedContent = JSON.parse(data.choices[0].message.content)

    
    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})