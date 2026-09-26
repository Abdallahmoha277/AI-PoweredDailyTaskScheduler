import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';
import {
  User as UserIcon,
  Mail,
  Calendar as CalendarIcon,
  Fingerprint,
  Globe,
  Bell,
  LogOut,
  Trash2,
  Info,
  Code,
  Check,
  Camera,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';
import Layout from '../components/Layout';

const NOTIFICATIONS_KEY = 'taskflow-notifications-enabled';
const GITHUB_URL = 'https://github.com/Abdallahmoha277/AI-PoweredDailyTaskScheduler';

type Notice = { type: 'success' | 'error'; text: string } | null;

export default function Settings() {
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [appVersion, setAppVersion] = useState<string>('...');
  const [notifications, setNotifications] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = window.localStorage.getItem(NOTIFICATIONS_KEY);
    return saved === null ? true : saved === 'true';
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState<Notice>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/auth');
        return;
      }
      setUser(data.user);
      const existingAvatar = data.user.user_metadata?.avatar_url;
      if (existingAvatar) setAvatarUrl(existingAvatar);
    });
  }, [navigate]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(NOTIFICATIONS_KEY, String(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    const fetchAppVersion = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const info = await CapacitorUpdater.current();
          setAppVersion(info.bundle.version);
        } catch (err) {
          console.error('Failed to get app version:', err);
          setAppVersion('unknown');
        }
      } else {
        setAppVersion('web');
      }
    };

    fetchAppVersion();
  }, []);

  const showAvatarNotice = (type: 'success' | 'error', text: string) => {
    setAvatarNotice({ type, text });
    setTimeout(() => setAvatarNotice(null), 3500);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      showAvatarNotice('error', t('settingsAvatarTooLarge'));
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const publicUrl = publicData.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      showAvatarNotice('success', t('settingsAvatarSuccess'));
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      showAvatarNotice('error', err.message || t('settingsAvatarError'));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    if (!user || !avatarUrl) return;
    setIsUploading(true);

    try {
      const path = avatarUrl.split('/avatars/')[1];
      if (path) {
        await supabase.storage.from('avatars').remove([path]);
      }

      await supabase.auth.updateUser({ data: { avatar_url: null } });
      setAvatarUrl(null);
      showAvatarNotice('success', t('settingsAvatarSuccess'));
    } catch (err: any) {
      console.error('Avatar remove error:', err);
      showAvatarNotice('error', err.message || t('settingsAvatarError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { error } = await supabase.functions.invoke('server/delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err: any) {
      console.error('Delete account error:', err);
      setDeleteError(err.message || t('settingsDeleteError'));
      setIsDeletingAccount(false);
    }
  };

  const closeDeleteModal = () => {
    if (isDeletingAccount) return;
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    setDeleteError(null);
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(
        lang === 'ar' ? 'ar-EG' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' },
      )
    : '—';

  const shortId = user?.id ? `${user.id.slice(0, 8)}...` : '—';

  return (
    <Layout title={t('settingsTitle')}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Section
          icon={<UserIcon className="w-5 h-5" />}
          title={t('settingsAccount')}
          description={t('settingsAccountDesc')}
        >
          <div className="flex items-center gap-5 mb-6">
            <div className="relative group">
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 border-2 border-border flex items-center justify-center text-primary text-2xl font-bold transition-all hover:border-primary disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.email?.charAt(0).toUpperCase() || '?'
                )}
              </button>

              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card pointer-events-none">
                <Camera className="w-3.5 h-3.5" />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-sm text-muted-foreground mb-2 truncate">
                {user?.email || '—'}
              </p>

              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {isUploading ? t('settingsUploading') : t('settingsChangeAvatar')}
                </button>

                {avatarUrl && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <button
                      type="button"
                      onClick={handleAvatarRemove}
                      disabled={isUploading}
                      className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
                    >
                      {t('settingsRemoveAvatar')}
                    </button>
                  </>
                )}
              </div>

              {avatarNotice && (
                <p
                  className={`text-xs mt-2 ${
                    avatarNotice.type === 'success' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {avatarNotice.text}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <InfoRow
              icon={<Mail className="w-4 h-4" />}
              label={t('settingsEmail')}
              value={user?.email || '—'}
            />
            <InfoRow
              icon={<CalendarIcon className="w-4 h-4" />}
              label={t('settingsMemberSince')}
              value={memberSince}
            />
            <InfoRow
              icon={<Fingerprint className="w-4 h-4" />}
              label={t('settingsUserId')}
              value={shortId}
            />
          </div>
        </Section>

        <Section
          icon={<Globe className="w-5 h-5" />}
          title={t('settingsPreferences')}
          description={t('settingsPreferencesDesc')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium text-foreground">
                    {t('settingsLanguage')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('settingsLanguageDesc')}
                  </p>
                </div>
              </div>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as 'en' | 'ar')}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="en">{t('english')}</option>
                <option value="ar">{t('arabic')}</option>
              </select>
            </div>

            <div className="border-t border-border" />

            <div className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-start gap-3">
                <Bell className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium text-foreground">
                    {t('settingsNotifications')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('settingsNotificationsDesc')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  notifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                    notifications
                      ? 'translate-x-5 rtl:-translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Section>

        <div className="bg-card border border-danger/30 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-danger/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-danger">
                {t('settingsDangerZone')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('settingsDangerZoneDesc')}
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <LogOut className="w-4 h-4 text-muted-foreground mt-1" />
                <p className="text-sm text-foreground">{t('settingsSignOut')}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {t('signOut')}
              </button>
            </div>

            <div className="border-t border-border" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-4 h-4 text-danger mt-1" />
                <div>
                  <p className="text-sm font-medium text-danger">
                    {t('settingsDeleteAccount')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('settingsDeleteAccountDesc')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeletingAccount}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
              >
                {isDeletingAccount
                  ? t('settingsDeleting')
                  : t('settingsDeleteAccount')}
              </button>
            </div>
          </div>
        </div>

        <Section
          icon={<Info className="w-5 h-5" />}
          title={t('settingsAbout')}
          description=""
        >
          <div className="space-y-3">
            <InfoRow
              icon={<Check className="w-4 h-4" />}
              label={t('settingsVersion')}
              value={appVersion}
            />
            <InfoRow
              icon={<Code className="w-4 h-4" />}
              label={t('settingsSourceCode')}
              value={
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub
                </a>
              }
            />
          </div>
        </Section>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-danger/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 pb-4 text-center border-b border-border">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-danger" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('settingsDeleteAccountConfirmTitle')}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('settingsDeleteAccountConfirmBody')}
              </p>
            </div>

            <div className="p-5 bg-danger/5 border-b border-border">
              <p className="text-xs uppercase font-bold text-danger mb-3 tracking-wider">
                This will permanently delete:
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  Your account and login credentials
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  All your tasks and their history
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                  Your profile picture and settings
                </li>
              </ul>
            </div>

            <div className="p-5">
              <label className="block text-sm font-medium text-foreground mb-2">
                Type{' '}
                <span className="font-mono font-bold text-danger">DELETE</span> to
                confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeletingAccount}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-danger focus:ring-2 focus:ring-danger/20 transition-all font-mono tracking-wider disabled:opacity-50"
                autoComplete="off"
                autoFocus
              />

              {deleteError && (
                <p className="mt-3 text-sm text-danger">{deleteError}</p>
              )}
            </div>

            <div className="p-4 border-t border-border flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeletingAccount}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-card border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                {t('settingsDeleteAccountCancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('settingsDeleting')}
                  </>
                ) : (
                  t('settingsDeleteAccountConfirmButton')
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-3 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground truncate max-w-[60%] text-right">
        {value}
      </span>
    </div>
  );
}