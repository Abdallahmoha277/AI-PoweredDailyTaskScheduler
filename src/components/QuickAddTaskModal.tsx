import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Calendar as CalendarIcon,
  Flag,
  Clock,
  Circle,
  Loader2,
  Plus,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  defaultDate: Date | null;
  onTaskAdded: () => void;
}

const PRIORITY_STYLES = {
  low: 'bg-success/15 text-success border-success/30',
  medium: 'bg-warning/15 text-warning border-warning/30',
  high: 'bg-danger/15 text-danger border-danger/30',
};

const DURATION_OPTIONS = ['15m', '30m', '45m', '1h', '2h', '3h', '4h'];

export default function QuickAddTaskModal({
  isOpen,
  onClose,
  userId,
  defaultDate,
  onTaskAdded,
}: Props) {
  const { lang, t } = useLanguage();
  const titleRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [duration, setDuration] = useState('30m');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when modal opens; autofocus title
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDuration('30m');
      setError(null);
      setTimeout(() => titleRef.current?.focus(), 150);
    }
  }, [isOpen, defaultDate]);

  if (!isOpen || !defaultDate) return null;

  const formatDateLong = (d: Date) =>
    d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    // Set due date to 9 AM of the selected day
    const dueDate = new Date(
      defaultDate.getFullYear(),
      defaultDate.getMonth(),
      defaultDate.getDate(),
      9,
      0,
      0,
    );

    try {
      const { error: insertError } = await supabase.from('tasks').insert([
        {
          user_id: userId,
          title: trimmed,
          description: description.trim() || null,
          status: 'pending',
          priority,
          estimated_duration: duration,
          due_date: dueDate.toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      onTaskAdded();
      onClose();
    } catch (err: any) {
      console.error('Quick add error:', err);
      setError(err?.message || t('addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 60 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320, mass: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-[1] bg-card/95 backdrop-blur border-b border-border px-4 md:px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold text-foreground truncate">
              {t('modalAddTitle')}
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg hover:bg-muted active:scale-95 transition-all flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-5">
          {/* Date banner */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {formatDateLong(defaultDate)}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">
              {t('taskTitleLabel')}
            </label>
            <input
              ref={titleRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              placeholder={t('taskTitlePlaceholder')}
              className="w-full bg-background border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2">
              {t('taskDescLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder={t('taskDescPlaceholder')}
              rows={2}
              className="w-full bg-background border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none transition-all disabled:opacity-60"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Fields */}
          <div className="space-y-1">
            {/* Priority */}
            <div className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Flag className="w-4 h-4" />
                <span className="text-sm">{t('priorityLabel')}</span>
              </div>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as 'low' | 'medium' | 'high')
                }
                disabled={isSubmitting}
                className={`appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 ${PRIORITY_STYLES[priority]}`}
              >
                <option value="low">{t('priorityLow')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="high">{t('priorityHigh')}</option>
              </select>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{t('durationLabel')}</span>
              </div>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isSubmitting}
                className="appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-semibold bg-muted text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-card border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(245,166,35,0.20)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('savingTask')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  {t('saveTask')}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}