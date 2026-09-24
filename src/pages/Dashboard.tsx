import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';
import AddTaskModal from '../components/AddTaskModal';
import {
  Calendar, CheckCircle2, Circle, LayoutDashboard,
  MessageSquare, Settings, Sparkles, Send, Zap, LogOut, Bot
} from 'lucide-react';

type Task = {
  id: string;
  title: string;
  duration?: string;
  time?: string;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
};

export default function Dashboard() {
  const { lang, setLang, t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const navigate = useNavigate();
  const isArabic = lang === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async (userIdParam?: string) => {
    const targetUserId = userIdParam || user?.id;
    if (!targetUserId) return;

    const { data: tasksData, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (!error && tasksData) {
      const mappedTasks = tasksData.map((task) => ({
        id: task.id,
        title: task.title,
        duration: task.estimated_duration || '30m',
        time: task.due_date 
          ? new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : 'Unscheduled',
        status: task.status,
        priority: task.priority,
      }));
      setTasks(mappedTasks);
    }
  };

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate('/auth');
        return;
      }
      
      setUser(authUser);
      await fetchTasks(authUser.id);
      setLoading(false);
    };

    fetchUserAndTasks();
  }, [navigate]);

  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';

    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, status: newStatus } : task
    ));

    if (user) {
      await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id);
    }
  };

  const handleAiSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || !user || isAiLoading) return;

    const userInput = aiInput;
    setAiInput('');
    setIsAiLoading(true);

    try {
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('server', {
        body: { text: userInput }
      });

      if (aiError) {
        throw new Error("Failed to connect to AI server");
      }

      const { title, estimated_duration, priority } = aiResponse;

      const { data: newTaskData, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: title || userInput,
            status: 'pending',
            priority: priority || 'medium',
            estimated_duration: estimated_duration || '30m',
          },
        ])
        .select()
        .single();

      if (!error && newTaskData) {
        const uiTask: Task = {
          id: newTaskData.id,
          title: newTaskData.title,
          duration: newTaskData.estimated_duration || '30m',
          time: 'Unscheduled',
          status: newTaskData.status,
          priority: newTaskData.priority,
        };
        setTasks([uiTask, ...tasks]);
      }
    } catch (error) {
      console.error("AI parsing error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 border-r border-border/50 bg-card/50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border/50 gap-2 font-bold text-xl">
          <Zap className="w-5 h-5 text-primary" />
          <span>TaskFlow</span>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <NavItem to="/dashboard" icon={LayoutDashboard} label={t('sidebarDashboard')} active />
          <NavItem to="/calendar" icon={Calendar} label={t('sidebarCalendar')} />
          <NavItem to="/assistant" icon={MessageSquare} label={t('sidebarAssistant')} />
          <NavItem to="/settings" icon={Settings} label={t('sidebarSettings')} />
        </nav>

        <div className="p-4 border-t border-border/50">
          <button 
            onClick={handleSignOut} 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur flex items-center justify-between px-6 shrink-0">
          <h1 className="text-xl font-semibold">{t('todaysSchedule')}</h1>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + {t('modalAddTitle')}
            </button>

            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Sparkles className="w-4 h-4" />
              {t('generateMyDay')}
            </button>

            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex gap-6 flex-col lg:flex-row">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-muted-foreground">{t('timeline')}</h2>
              <span className="text-sm bg-border/50 px-3 py-1 rounded-full text-muted-foreground">
                {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {tasks.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                    {t('emptyState')}
                  </div>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                        task.status === 'done'
                          ? 'bg-card/30 border-border/30 opacity-60'
                          : 'bg-card border-border hover:border-primary/30 shadow-sm'
                      }`}
                    >
                      <div className="flex-shrink-0 pt-1 flex flex-col items-center gap-1 w-16 text-center">
                        <span className="text-xs font-semibold text-muted-foreground">{task.time}</span>
                        <span className="text-[10px] text-muted-foreground/70">{task.duration}</span>
                      </div>

                      <div className="h-full w-px bg-border mx-2 relative mt-2">
                        <div className={`absolute -left-[5px] -top-1 w-3 h-3 rounded-full border-2 bg-background ${
                          task.status === 'done' ? 'border-primary' : 'border-border'
                        }`} />
                      </div>

                      <div className="flex-1 flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${
                            task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}>
                            {task.title}
                          </h3>
                          {task.priority === 'high' && (
                            <span className="inline-block mt-2 text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-sm">
                              {t('highPriority')}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleTask(task.id, task.status)}
                          className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                        >
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full lg:w-[400px] shrink-0 space-y-6">
            <div className="bg-gradient-to-b from-card to-background border border-border/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              <h2 className="text-sm font-semibold text-primary flex items-center gap-2 mb-4">
                <Bot className="w-4 h-4" /> {t('aiAssistant')}
              </h2>
              <form onSubmit={handleAiSubmit} className="relative">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={t('aiPlaceholder')}
                  className="w-full bg-background/50 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl py-3 pl-4 pr-12 text-sm transition-all text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {user && (
          <AddTaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onTaskAdded={() => fetchTasks()}
            userId={user.id}
          />
        )}
      </main>
    </div>
  );
}

function NavItem({ to, icon: Icon, label, active = false }: { to: string, icon: any, label: string, active?: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-card'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}