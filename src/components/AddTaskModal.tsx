import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
  userId: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskAdded,
  userId,
}) => {
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [estimatedDuration, setEstimatedDuration] = useState('30m');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setEstimatedDuration('30m');
    setDueDate('');
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!userId) {
      setError('You must be signed in to add a task.');
      return;
    }

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('tasks').insert([
        {
          title: title.trim(),
          description: description.trim() || null,
          priority,
          estimated_duration: estimatedDuration,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          user_id: userId,
        },
      ]);

      if (insertError) throw insertError;

      resetForm();
      onTaskAdded();
      onClose();
    } catch (err: any) {
      console.error('Add task error:', err);
      setError(err?.message || t('addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">
            {t('modalAddTitle')}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-danger transition-colors text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('taskTitleLabel')}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
              placeholder={t('taskTitlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('taskDescLabel')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all resize-none disabled:opacity-60"
              placeholder={t('taskDescPlaceholder')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('priorityLabel')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
              >
                <option value="low">{t('priorityLow')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="high">{t('priorityHigh')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('durationLabel')}
              </label>
              <select
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60"
              >
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
                <option value="2h">2h</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('dueDateLabel')}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-60 [color-scheme:dark]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-muted-foreground bg-muted hover:bg-border/50 rounded-lg transition-colors disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {t('savingTask')}
                </>
              ) : (
                t('saveTask')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;