import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/language';
import { supabase } from '../lib/supabase';
import {
  Calendar,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  headerExtra?: ReactNode;
  noScroll?: boolean;
}

export default function Layout({
  children,
  title,
  headerExtra,
  noScroll = false,
}: LayoutProps) {
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isArabic = lang === 'ar';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('sidebarDashboard') },
    { to: '/calendar', icon: Calendar, label: t('sidebarCalendar') },
    { to: '/assistant', icon: MessageSquare, label: t('sidebarAssistant') },
    { to: '/settings', icon: Settings, label: t('sidebarSettings') },
  ];

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="h-dvh flex bg-background text-foreground overflow-hidden overscroll-none"
    >
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="w-64 border-e border-border bg-card/50 hidden md:flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border gap-2 font-bold text-xl">
          <Zap className="w-5 h-5 text-primary" />
          <span>TaskFlow</span>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <label className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{t('languageLabel')}</span>
            <select
              aria-label={t('languageLabel')}
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'ar')}
              className="bg-transparent text-foreground outline-none cursor-pointer"
            >
              <option value="en">{t('english')}</option>
              <option value="ar">{t('arabic')}</option>
            </select>
          </label>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* ==================== MAIN COLUMN ==================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ============ HEADER — always fixed at top ============ */}
        <header className="h-14 md:h-16 border-b border-border bg-background flex items-center justify-between px-3 md:px-6 shrink-0 gap-2">
          {/* Title side */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Zap className="w-5 h-5 text-primary shrink-0 md:hidden" />
            <h1 className="text-base md:text-xl font-semibold truncate">
              {title}
            </h1>
          </div>

          {/* Actions side */}
          {headerExtra && (
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {headerExtra}
            </div>
          )}
        </header>

        {/* ============ CONTENT — the only scrollable area ============ */}
        {noScroll ? (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col md:p-6">
            {children}
          </div>
        ) : (
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-none p-3 sm:p-4 md:p-6"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {children}
          </div>
        )}

        {/* ============ BOTTOM NAV — locked at bottom on mobile ============ */}
        <nav
          className="md:hidden border-t border-border bg-background shrink-0"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="grid grid-cols-4 h-16">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground active:text-foreground'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`}
                  />
                  <span className="text-[10px] font-medium leading-tight px-1 text-center">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}