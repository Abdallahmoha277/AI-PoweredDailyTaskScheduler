import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
  userId: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onTaskAdded, userId }) => {
  const { t } = useLanguage(); 

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [estimatedDuration, setEstimatedDuration] = useState('30m');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([
          {
            title,
            description,
            priority,
            estimated_duration: estimatedDuration,
            due_date: dueDate || null,
            user_id: userId,
          }
        ]);

      if (error) throw error;

      setTitle('');
      setDescription('');
      setPriority('medium');
      setEstimatedDuration('30m');
      setDueDate('');
      
      onTaskAdded();
      onClose();
    } catch (error: any) {
      console.error(t('addError'), error.message);
      alert(t('addError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transition-all">
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('modalAddTitle')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors text-2xl leading-none">
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('taskTitleLabel')}</label>
            <input 
              type="text" 
              required 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={t('taskTitlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('taskDescLabel')}</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder={t('taskDescPlaceholder')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('priorityLabel')}</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="low">{t('priorityLow')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="high">{t('priorityHigh')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('durationLabel')}</label>
              <select 
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
                <option value="2h">2h</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dueDateLabel')}</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('savingTask') : t('saveTask')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;