import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  Flag,
  Pencil,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';

export type EditableTask = {
  id: string;
  title: string;
  description?: string | null;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  estimated_duration?: string | null;
  due_date: string | null;
};

interface Props {
  task: EditableTask;
  userId: string;
  onClose: () => void;
  onUpdate: (task: EditableTask) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_STYLES = {
  low: 'bg-success/15 text-success border-success/30',
  medium: 'bg-warning/15 text-warning border-warning/30',
  high: 'bg-danger/15 text-danger border-danger/30',
};

const STATUS_STYLES = {
  pending: 'bg-warning/15 text-warning',
  in_progress: 'bg-primary/15 text-primary',
  done: 'bg-success/15 text-success',
};

const DURATION_OPTIONS = ['15m', '30m', '45m', '1h', '2h', '3h', '4h'];

export default function TaskDetailModal({
  task,
  userId,
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const { lang, t } = useLanguage();

  const [titleDraft, setTitleDraft] = useState(task.title);
  const [descDraft, setDescDraft] = useState(task.description || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setTitleDraft(task.title);
    setDescDraft(task.description || '');
  }, [task.id, task.title, task.description]);

  const showSavedIndicator = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1200);
  };

  const saveField = async (updates: Partial<EditableTask>) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', task.id)
      .eq('user_id', userId);

    if (!error) {
      onUpdate({ ...task, ...updates });
      showSavedIndicator();
    }
  };

  const saveTitle = () => {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === task.title) {
      setTitleDraft(task.title);
      return;
    }
    saveField({ title: trimmed });
  };

  const saveDescription = () => {
    setEditingDesc(false);
    const trimmed = descDraft.trim();
    if (trimmed === (task.description || '')) return;
    saveField({ description: trimmed || null });
  };

  const toggleStatus = () => {
    const cycle = {
      pending: 'in_progress',
      in_progress: 'done',
      done: 'pending',
    } as const;
    saveField({ status: cycle[task.status] });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id)
      .eq('user_id', userId);

    if (!error) {
      onDelete(task.id);
      onClose();
    }
    setIsDeleting(false);
  };

  const dateValueForInput = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <>
      {/* ============ MAIN MODAL ============ */}
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
          onClick={onClose}
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
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground truncate">
              {t('taskDetailHint')}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              {/* Saved indicator — inline next to close button */}
              <AnimatePresence>
                {showSaved && (
                  <motion.div
                    initial={{ opacity: 0, x: 12, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 12, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex items-center gap-1.5 text-success text-xs font-medium whitespace-nowrap"
                  >
                    <span className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-2 w-2 rounded-full bg-success/40 animate-ping" />
                      <CheckCircle2 className="w-3.5 h-3.5 relative" />
                    </span>
                    <span>{t('taskSaved')}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-muted active:scale-95 transition-all flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 md:p-5 space-y-5">
            {/* Title + Status toggle */}
            <div className="flex items-start gap-3">
              <button
                onClick={toggleStatus}
                className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                  task.status === 'done'
                    ? 'bg-success text-white'
                    : task.status === 'in_progress'
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'border-2 border-border hover:border-primary'
                }`}
                aria-label="Toggle status"
              >
                {task.status === 'done' && <CheckCircle2 className="w-4 h-4" />}
                {task.status === 'in_progress' && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                      if (e.key === 'Escape') {
                        setTitleDraft(task.title);
                        setEditingTitle(false);
                      }
                    }}
                    placeholder={t('taskTitlePlaceholder')}
                    className="w-full bg-transparent border-0 border-b-2 border-primary/40 focus:border-primary outline-none text-lg font-bold text-foreground pb-1 transition-colors"
                  />
                ) : (
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="group w-full text-start flex items-center gap-2"
                  >
                    <h2
                      className={`text-lg font-bold transition-all ${
                        task.status === 'done'
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </h2>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              {editingDesc ? (
                <textarea
                  autoFocus
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={saveDescription}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setDescDraft(task.description || '');
                      setEditingDesc(false);
                    }
                  }}
                  placeholder={t('taskDescriptionPlaceholder')}
                  rows={3}
                  className="w-full bg-background border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15 rounded-lg px-3 py-2 text-sm outline-none resize-none transition-all"
                />
              ) : (
                <button
                  onClick={() => setEditingDesc(true)}
                  className="group w-full text-start flex items-start gap-2 rounded-lg -mx-2 px-2 py-1.5 hover:bg-muted/50 transition-colors"
                >
                  <p
                    className={`flex-1 text-sm leading-relaxed ${
                      task.description
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50 italic'
                    }`}
                  >
                    {task.description || t('taskDescriptionPlaceholder')}
                  </p>
                  <Pencil className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Fields */}
            <div className="space-y-1">
              {/* Status */}
              <FieldRow
                icon={<Circle className="w-4 h-4" />}
                label={t('taskStatusLabel')}
              >
                <select
                  value={task.status}
                  onChange={(e) =>
                    saveField({
                      status: e.target.value as EditableTask['status'],
                    })
                  }
                  className={`appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border-0 outline-none focus:ring-2 focus:ring-primary/30 ${STATUS_STYLES[task.status]}`}
                >
                  <option value="pending">{t('taskStatusPending')}</option>
                  <option value="in_progress">
                    {t('taskStatusInProgress')}
                  </option>
                  <option value="done">{t('taskStatusDone')}</option>
                </select>
              </FieldRow>

              {/* Priority */}
              <FieldRow
                icon={<Flag className="w-4 h-4" />}
                label={t('taskPriorityLabel')}
              >
                <select
                  value={task.priority}
                  onChange={(e) =>
                    saveField({
                      priority: e.target.value as EditableTask['priority'],
                    })
                  }
                  className={`appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border outline-none focus:ring-2 focus:ring-primary/30 ${PRIORITY_STYLES[task.priority]}`}
                >
                  <option value="low">{t('priorityLow')}</option>
                  <option value="medium">{t('priorityMedium')}</option>
                  <option value="high">{t('priorityHigh')}</option>
                </select>
              </FieldRow>

              {/* Duration */}
              <FieldRow
                icon={<Clock className="w-4 h-4" />}
                label={t('taskDurationLabel')}
              >
                <select
                  value={task.estimated_duration || '30m'}
                  onChange={(e) =>
                    saveField({ estimated_duration: e.target.value })
                  }
                  className="appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-semibold bg-muted text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </FieldRow>

              {/* Due Date */}
              <FieldRow
                icon={<CalendarIcon className="w-4 h-4" />}
                label={t('taskDueDateLabel')}
              >
                <input
                  type="datetime-local"
                  value={dateValueForInput(task.due_date)}
                  onChange={(e) => {
                    const v = e.target.value;
                    saveField({
                      due_date: v ? new Date(v).toISOString() : null,
                    });
                  }}
                  className="appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-semibold bg-muted text-foreground border-0 outline-none focus:ring-2 focus:ring-primary/30 [color-scheme:dark]"
                />
              </FieldRow>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t('taskDeleteModalConfirm')}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-danger" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('taskDeleteModalTitle')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('taskDeleteModalBody')}
                </p>
              </div>

              <div className="p-4 border-t border-border flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-card border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {t('taskDeleteModalCancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {t('taskDeleteModalConfirm')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// =====================================================================
// Field row helper
// =====================================================================

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2.5 text-muted-foreground shrink-0">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center">{children}</div>
    </div>
  );
}