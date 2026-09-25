import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';
import Layout from '../components/Layout';
import TaskDetailModal, { type EditableTask } from '../components/TaskDetailModal';
import QuickAddTaskModal from '../components/QuickAddTaskModal';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  estimated_duration?: string | null;
  due_date: string | null;
};

const WEEKDAYS = {
  ar: ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const MONTHS = {
  ar: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  high: 'bg-danger/15 text-danger border-danger/20',
  medium: 'bg-warning/15 text-warning border-warning/20',
  low: 'bg-success/15 text-success border-success/20',
};

export default function Calendar() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<EditableTask | null>(null);
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null);
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // ============ FETCH TASKS ============
  const fetchTasks = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      navigate('/auth');
      return;
    }

    setUser(authUser);

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', authUser.id)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (data) setTasks(data as Task[]);
  };

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ============ BUILD GRID ============
  const grid = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const lastOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // Arabic week starts Saturday (index 6); English starts Sunday (index 0)
    const weekStart = lang === 'ar' ? 6 : 0;

    const startOffset = (firstOfMonth.getDay() - weekStart + 7) % 7;
    const endOffset = 7 - ((lastOfMonth.getDay() - weekStart + 7) % 7) - 1;

    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - startOffset);

    const endDate = new Date(lastOfMonth);
    endDate.setDate(lastOfMonth.getDate() + endOffset);

    const days: Date[] = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }, [viewYear, viewMonth, lang]);

  // ============ GROUP TASKS BY DATE ============
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
      if (!task.due_date) continue;
      const d = new Date(task.due_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(task);
    }
    return map;
  }, [tasks]);

  const keyOf = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // ============ NAVIGATION ============
  const goPrevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  // ============ MODAL HANDLERS ============
  const handleTaskUpdate = (updated: EditableTask) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updated.id ? { ...task, ...updated } : task)),
    );
    setSelectedTask(updated);
  };

  const handleTaskDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const monthLabel = `${MONTHS[lang][viewMonth]} ${viewYear}`;
  const weekdays = WEEKDAYS[lang];

  // ============ HEADER EXTRA ============
  const headerExtra = (
    <div className="flex items-center gap-1.5 md:gap-2">
      {/* Previous */}
      <button
        onClick={goPrevMonth}
        className="w-9 h-9 md:w-10 md:h-10 rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary/40 active:scale-95 transition-all flex items-center justify-center text-foreground"
        aria-label="Previous month"
      >
        {lang === 'ar' ? (
          <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
        ) : (
          <ChevronLeft className="w-4 h-4" strokeWidth={2.25} />
        )}
      </button>

      {/* Today */}
      <button
        onClick={goToday}
        className="h-9 md:h-10 px-3 md:px-4 rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary/40 active:scale-95 transition-all text-xs md:text-sm font-semibold text-foreground"
      >
        {lang === 'ar' ? 'اليوم' : 'Today'}
      </button>

      {/* Next */}
      <button
        onClick={goNextMonth}
        className="w-9 h-9 md:w-10 md:h-10 rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary/40 active:scale-95 transition-all flex items-center justify-center text-foreground"
        aria-label="Next month"
      >
        {lang === 'ar' ? (
          <ChevronLeft className="w-4 h-4" strokeWidth={2.25} />
        ) : (
          <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
        )}
      </button>
    </div>
  );

  if (loading) {
    return (
      <Layout title={t('calendarTitle')}>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">
            {t('loadingTasks')}
          </span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('calendarTitle')} headerExtra={headerExtra}>
      <div className="max-w-5xl mx-auto">
        {/* Month header */}
        <div className="flex items-center justify-between mb-3 md:mb-4 px-1">
          <h2 className="text-lg md:text-2xl font-bold text-foreground">
            {monthLabel}
          </h2>
          <span className="text-xs md:text-sm text-muted-foreground">
            {tasks.length} {lang === 'ar' ? 'مهمة' : 'tasks'}
          </span>
        </div>

        {/* Calendar shell */}
        <div className="rounded-xl border border-border bg-card/40 p-1.5 md:p-2 shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-1 md:mb-1.5">
            {weekdays.map((day) => (
              <div
                key={day}
                className="h-8 md:h-10 flex items-center justify-center text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {grid.map((date, idx) => {
              const inMonth = date.getMonth() === viewMonth;
              const isToday = isSameDay(date, today);
              const dayTasks = tasksByDate[keyOf(date)] || [];
              const visibleTasks = dayTasks.slice(0, 2);
              const remaining = dayTasks.length - visibleTasks.length;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: idx * 0.002 }}
                  onClick={() => setNewTaskDate(date)}
                  className={`relative min-h-[64px] md:min-h-[110px] rounded-md border p-1 md:p-1.5 transition-all cursor-pointer group ${
                    inMonth
                      ? 'bg-background border-border hover:border-primary/40 hover:bg-primary/[0.03]'
                      : 'bg-muted/30 border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* Day number row */}
                  <div className="flex items-center justify-between mb-0.5 md:mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-xs md:text-sm font-semibold transition-colors ${
                        isToday
                          ? 'bg-danger text-white shadow-sm'
                          : inMonth
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="hidden md:inline text-[9px] font-medium text-muted-foreground">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Hover "+" hint */}
                  <Plus
                    className="absolute top-1 end-1 w-3 h-3 text-primary opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none"
                    strokeWidth={2.5}
                  />

                  {/* Tasks */}
                  <div className="space-y-0.5 md:space-y-1">
                    {visibleTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                        title={task.title}
                        className={`w-full text-start px-1 md:px-1.5 py-0.5 md:py-1 rounded-sm border text-[9px] md:text-[11px] font-medium truncate transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${
                          PRIORITY_STYLES[task.priority]
                        } ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
                      >
                        <span className="hidden md:inline-flex items-center gap-1 w-full">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{task.title}</span>
                        </span>
                        <span className="md:hidden w-full block truncate">
                          {task.title}
                        </span>
                      </button>
                    ))}

                    {remaining > 0 && (
                      <div className="text-[9px] md:text-[10px] font-medium text-muted-foreground px-1">
                        +{remaining}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Empty state hint */}
        {tasks.length === 0 && (
          <div className="mt-4 p-6 md:p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
            <CalendarIcon className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">{t('emptyCalendar')}</p>
          </div>
        )}
      </div>

      {/* ============ TASK DETAIL MODAL ============ */}
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

      {/* ============ QUICK ADD TASK MODAL ============ */}
      <AnimatePresence>
        {newTaskDate && user && (
          <QuickAddTaskModal
            isOpen={true}
            onClose={() => setNewTaskDate(null)}
            userId={user.id}
            defaultDate={newTaskDate}
            onTaskAdded={fetchTasks}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}