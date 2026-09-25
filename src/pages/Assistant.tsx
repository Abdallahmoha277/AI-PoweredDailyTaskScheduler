import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';
import Layout from '../components/Layout';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'success' | 'error';
  text: string;
  timestamp: number;
};

const STORAGE_KEY = 'taskflow-assistant-history';

export default function Assistant() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Message[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState<string>('U');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user avatar
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAvatarUrl(data.user.user_metadata?.avatar_url || null);
        setUserInitial(data.user.email?.charAt(0).toUpperCase() || 'U');
      }
    });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Persist chat history
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  // Prevent the page from scrolling when the keyboard opens
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const lockScroll = () => {
      // If the page somehow scrolled, snap it back to the top of the app shell.
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      if (document.documentElement.scrollTop !== 0) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
      }
    };

    vv.addEventListener('resize', lockScroll);
    vv.addEventListener('scroll', lockScroll);
    window.addEventListener('scroll', lockScroll);

    return () => {
      vv.removeEventListener('resize', lockScroll);
      vv.removeEventListener('scroll', lockScroll);
      window.removeEventListener('scroll', lockScroll);
    };
  }, []);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      },
    ]);
  };

  const clearChat = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    // Prevent the browser from scrolling the entire page on focus.
    // Only the messages container is allowed to scroll.
    requestAnimationFrame(() => {
      // Reset any page-level scroll the browser may have applied.
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Keep the latest message visible.
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    addMessage({ role: 'user', text });
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        addMessage({ role: 'error', text: 'You must be signed in.' });
        setIsLoading(false);
        return;
      }

      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }

      const { data: aiResponse, error: aiError } =
        await supabase.functions.invoke('server', {
          body: { text },
        });

      if (aiError) throw aiError;
      if (!aiResponse || aiResponse.error) {
        throw new Error(aiResponse?.error || 'No response from AI');
      }

      const { title, estimated_duration, priority } = aiResponse;

      const { data: newTask, error: dbError } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: title || text,
            status: 'pending',
            priority: priority || 'medium',
            estimated_duration: estimated_duration || '30m',
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      if (newTask) {
        addMessage({
          role: 'assistant',
          text: `I understood: **${newTask.title}**`,
        });
        addMessage({
          role: 'success',
          text: `${t('assistantSuccess')} — ${newTask.estimated_duration || '30m'}, ${newTask.priority}`,
        });
      }
    } catch (err: any) {
      console.error('Assistant error:', err);
      addMessage({
        role: 'error',
        text: err?.message || t('assistantError'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const useSuggestion = (s: string) => {
    setInput(s);
    handleInputFocus();
    inputRef.current?.focus();
  };

  const headerExtra = messages.length > 0 && (
    <button
      onClick={clearChat}
      className="h-10 px-3 rounded-md flex items-center justify-center gap-2 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
      aria-label={t('assistantClear')}
    >
      <Trash2 className="w-4 h-4 shrink-0" />
      <span className="hidden md:inline text-sm">{t('assistantClear')}</span>
    </button>
  );

  return (
    <Layout title={t('assistantTitle')} headerExtra={headerExtra} noScroll>
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto min-h-0">
        {/* ============ SUBTITLE (fixed at top) ============ */}
        <div className="shrink-0 px-3 md:px-0 pt-3 md:pt-0 pb-2 md:pb-3 flex items-center gap-2 text-muted-foreground text-xs md:text-sm">
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0" />
          <span className="truncate">{t('assistantSubtitle')}</span>
        </div>

        {/* ============ MESSAGES (only scrollable area) ============ */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3 md:space-y-4 px-3 md:px-0 pe-2 md:pe-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-2">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <p className="text-muted-foreground max-w-md text-sm">
                {t('assistantEmpty')}
              </p>
              <div className="space-y-2 w-full max-w-md">
                <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  {t('assistantSuggestions')}
                </p>
                {[t('suggestion1'), t('suggestion2'), t('suggestion3')].map(
                  (s, i) => (
                    <button
                      key={i}
                      onClick={() => useSuggestion(s)}
                      className="w-full text-start px-3 md:px-4 py-2.5 md:py-3 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-foreground"
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  avatarUrl={avatarUrl}
                  userInitial={userInitial}
                />
              ))}
            </AnimatePresence>
          )}

          {/* Thinking indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 md:gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-ts-sm px-3 md:px-4 py-2.5 md:py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {t('assistantThinking')}
                  </span>
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div className="h-1 md:h-2" />
        </div>

        {/* ============ INPUT (pinned, rises with keyboard) ============ */}
        <div className="shrink-0 w-full border-t border-border bg-background">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 max-w-3xl mx-auto"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={handleInputFocus}
              placeholder={t('assistantInputPlaceholder')}
              disabled={isLoading}
              className="flex-1 min-w-0 bg-card border border-border rounded-xl px-3 md:px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60 focus:ring-[3px] focus:ring-primary/15 disabled:opacity-60 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

// =====================================================================
// MessageBubble
// =====================================================================

function MessageBubble({
  message,
  avatarUrl,
  userInitial,
}: {
  message: Message;
  avatarUrl: string | null;
  userInitial: string;
}) {
  const isUser = message.role === 'user';
  const isSuccess = message.role === 'success';
  const isError = message.role === 'error';

  if (isSuccess) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="inline-flex items-center gap-2 bg-success/10 border border-success/30 text-success px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="break-words">{message.text}</span>
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="inline-flex items-center gap-2 bg-danger/10 border border-danger/30 text-danger px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="break-words">{message.text}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2 md:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {isUser ? (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="You"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-foreground">
              {userInitial}
            </span>
          )}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[75%] px-3 md:px-4 py-2.5 md:py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-ts-sm'
            : 'bg-card border border-border text-foreground rounded-ts-sm'
        }`}
      >
        {message.text.split('**').map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-bold">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </div>
    </motion.div>
  );
}