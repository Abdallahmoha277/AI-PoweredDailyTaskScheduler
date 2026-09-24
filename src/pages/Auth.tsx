import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';

export default function Auth() {
  const { lang, setLang, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isArabic = lang === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-background flex items-center justify-center p-4">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 font-bold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity">
        <Zap className="w-6 h-6 text-primary" />
        <span>{t('appTitle')}</span>
      </Link>

      <div className="absolute top-6 right-6">
        <label className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1.5 text-sm">
          <span className="text-muted-foreground">{t('languageLabel')}</span>
          <select
            aria-label={t('languageLabel')}
            value={lang}
            onChange={(e) => setLang(e.target.value as 'en' | 'ar')}
            className="bg-transparent text-foreground outline-none"
          >
            <option value="en">{t('english')}</option>
            <option value="ar">{t('arabic')}</option>
          </select>
        </label>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold">{isLogin ? t('welcomeBack') : t('createAccount')}</h2>
          <p className="text-muted-foreground mt-2">
            {isLogin ? t('signInIntro') : t('signUpIntro')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">{t('email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground block">{t('password')}</label>
              {isLogin && <a href="#" className="text-xs text-accent hover:underline">{t('forgotPassword')}</a>}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-6 disabled:opacity-50"
          >
            {loading ? t('processing') : (isLogin ? t('signIn') : t('signUp'))}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? t('noAccount') : t('hasAccount')}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? t('signUpLink') : t('signInLink')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}