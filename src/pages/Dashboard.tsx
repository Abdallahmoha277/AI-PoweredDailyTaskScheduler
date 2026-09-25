import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';
import AddTaskModal from '../components/AddTaskModal';
import Layout from '../components/Layout';
import SpotlightCard from '../components/SpotlightCard';
import TaskDetailModal, { type EditableTask } from '../components/TaskDetailModal';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Send,
  Bot,
  Trash2,
  Plus,
} from 'lucide-react';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  duration?: string;
  time?: string;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  estimated_duration?: string | null;
  due_date: string | null;
};

type Notice = { type: 'success' | 'error'; text: string } | null;

export default function Dashboard() {
  const { lang, t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<EditableTask | null>(null);
  const navigate = useNavigate();

  const showNotice = (n: Notice) => {
    setNotice(n);
    if (n) setTimeout(() => setNotice(null), 4000);
  };

  // ============ FETCH — FILTERED: today + unscheduled only ============
  const fetchTasks = async (userIdParam?: string) => {
    const targetUserId = userIdParam || user?.id;
    if (!targetUserId) return;

    const { data: tasksData, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      showNotice({ type: 'error', text: 'Failed to load tasks' });
      return;
    }

    if (tasksData) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const filtered = tasksData.filter((task) => {
        if (!task.due_date) return true;
        const d = new Date(task.due_date);
        return d >= todayStart && d <= todayEnd;
      });

      setTasks(
        filtered.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          duration: task.estimated_duration || '30m',
          estimated_duration: task.estimated_duration,
          time: task.due_date
            ? new Date(task.due_date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Unscheduled',
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
        })),
      );
    }
  };

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        navigate('/auth');
        return;
      }

      setUser(authUser);
      setAvatarUrl(authUser.user_metadata?.avatar_url || null);
      await fetchTasks(authUser.id);
      setLoading(false);
    };

    fetchUserAndTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ============ TASK ACTIONS ============
  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';

    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task,
      ),
    );

    if (user) {
      await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id);
    }
  };

  const handleTaskUpdate = (updated: EditableTask) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === updated.id ? { ...task, ...updated } : task,
      ),
    );
    setSelectedTask(updated);
  };

  const handleTaskDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleAiSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || !user || isAiLoading) return;

    const userInput = aiInput;
    setAiInput('');
    setIsAiLoading(true);

    try {
      const { data: aiResponse, error: aiError } =
        await supabase.functions.invoke('server', {
          body: { text: userInput },
        });

      if (aiError) throw aiError;
      if (!aiResponse || aiResponse.error) {
        throw new Error(aiResponse?.error || 'AI returned no data');
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

      if (error) throw error;

      if (newTaskData) {
        const uiTask: Task = {
          id: newTaskData.id,
          title: newTaskData.title,
          description: newTaskData.description,
          duration: newTaskData.estimated_duration || '30m',
          estimated_duration: newTaskData.estimated_duration,
          time: 'Unscheduled',
          status: newTaskData.status,
          priority: newTaskData.priority,
          due_date: newTaskData.due_date,
        };
        setTasks([uiTask, ...tasks]);
        showNotice({ type: 'success', text: `Added: "${uiTask.title}"` });
      }
    } catch (error: any) {
      console.error('AI submit error:', error);
      showNotice({
        type: 'error',
        text: error?.message || 'Failed to add task via AI',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title={t('todaysSchedule')}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={t('todaysSchedule')}
      headerExtra={
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-9 md:h-10 px-2.5 md:px-4 bg-primary text-primary-foreground rounded-md flex items-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all shadow-sm font-semibold text-sm shrink-0"
            aria-label={t('modalAddTitle')}
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.75} />
            <span className="leading-none">Add</span>
          </button>

          <button
            className="hidden md:flex h-10 px-4 bg-card border border-border rounded-md items-center gap-2 hover:border-primary/40 active:scale-95 transition-all shrink-0"
            aria-label={t('generateMyDay')}
          >
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium">{t('generateMyDay')}</span>
          </button>

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm overflow-hidden shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="You"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.email?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
        </div>
      }
    >
      {notice && (
        <div
          className={`mb-4 md:mb-6 p-3 rounded-md text-sm font-medium border ${
            notice.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 space-y-4 md:space-y-6 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base md:text-lg font-medium text-muted-foreground">
              {t('timeline')}
            </h2>
            <span className="text-xs md:text-sm bg-muted px-2.5 md:px-3 py-1 rounded-full text-muted-foreground whitespace-nowrap">
              {new Date().toLocaleDateString(
                lang === 'ar' ? 'ar-EG' : 'en-US',
                { weekday: 'short', month: 'short', day: 'numeric' },
              )}
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {tasks.length === 0 ? (
                <div className="p-6 md:p-8 text-center border border-dashed border-border rounded-md text-muted-foreground text-sm">
                  {t('emptyState')}
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout="position"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      type: 'spring',
                      damping: 30,
                      stiffness: 380,
                      mass: 0.6,
                      opacity: { duration: 0.18 },
                    }}
                    onClick={() => setSelectedTask(task)}
                    className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-md border transition-colors cursor-pointer ${
                      task.status === 'done'
                        ? 'bg-card/30 border-border/30 opacity-60'
                        : 'bg-card border-border hover:border-primary/40'
                    }`}
                  >
                    {/* Time column — desktop only */}
                    <div className="hidden md:flex flex-shrink-0 pt-1 flex-col items-center gap-1 w-16 text-center">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {task.time}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {task.duration}
                      </span>
                    </div>

                    <div className="hidden md:block h-full w-px bg-border mx-2 relative mt-2">
                      <div
                        className={`absolute -left-[5px] -top-1 w-3 h-3 rounded-full border-2 bg-background ${
                          task.status === 'done'
                            ? 'border-primary'
                            : 'border-border'
                        }`}
                      />
                    </div>

                    <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`font-medium break-words text-sm md:text-base ${
                            task.status === 'done'
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </h3>

                        <div className="md:hidden flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <span>{task.time}</span>
                          <span>·</span>
                          <span>{task.duration}</span>
                        </div>

                        {task.priority === 'high' && (
                          <span className="inline-block mt-1.5 md:mt-2 text-[10px] uppercase font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-sm">
                            {t('highPriority')}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 md:gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id, task.status);
                          }}
                          className="text-muted-foreground hover:text-primary transition-colors p-1"
                          aria-label="Toggle task"
                        >
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 md:w-6 md:h-6" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskDelete(task.id);
                            if (user) {
                              supabase
                                .from('tasks')
                                .delete()
                                .eq('id', task.id)
                                .eq('user_id', user.id);
                            }
                          }}
                          className="text-muted-foreground hover:text-danger transition-colors p-1"
                          title={t('deleteTask')}
                          aria-label={t('deleteTask')}
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column — AI + Spotlight */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-4">
          <div className="bg-gradient-to-b from-card to-background border border-border rounded-md p-4 md:p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
            <h2 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3 md:mb-4">
              <Bot className="w-4 h-4" /> {t('aiAssistant')}
            </h2>
            <form onSubmit={handleAiSubmit} className="relative">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={t('aiPlaceholder')}
                disabled={isAiLoading}
                className="w-full bg-background border border-border focus:border-primary/60 focus:ring-[3px] focus:ring-primary/15 rounded-md py-3 pl-4 pr-12 text-sm transition-all text-foreground placeholder:text-muted-foreground disabled:opacity-60 outline-none"
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                aria-label="Send"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>

          <SpotlightCard />
        </div>
      </div>

      {user && (
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTaskAdded={() => fetchTasks(user.id)}
          userId={user.id}
        />
      )}

      {/* ============ TASK DETAIL MODAL (reused from Calendar) ============ */}
      <AnimatePresence>
        {selectedTask && user && (
          <TaskDetailModal
            task={selectedTask}
            userId={user.id}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}