import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, Zap, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/language';

// =====================================================================
// 🔒 SECURITY CONSTANTS
// =====================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const RATE_LIMIT_WINDOW_MS = 10_000;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const LOCKOUT_DURATION_MS = 60_000;

const GENERIC_AUTH_ERROR =
  'Invalid email or password. Please try again.';
const GENERIC_SIGNUP_ERROR =
  'Could not create account. Please check your details and try again.';

// =====================================================================
// 🔒 SECURITY HELPERS
// =====================================================================

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return { valid: false, message: 'Password is too long.' };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasLower || !hasUpper || !hasDigit) {
    return {
      valid: false,
      message:
        'Password must contain uppercase, lowercase, and a number.',
    };
  }

  return { valid: true };
}

function sanitizeInput(input: string, maxLength = 254): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

// =====================================================================
// 🔒 RATE LIMITER
// =====================================================================
interface RateLimitState {
  attempts: number[];
  lockedUntil: number | null;
}

function useRateLimiter() {
  const stateRef = useRef<RateLimitState>({
    attempts: [],
    lockedUntil: null,
  });

  const checkRateLimit = useCallback((): {
    allowed: boolean;
    retryAfterMs?: number;
  } => {
    const now = Date.now();
    const state = stateRef.current;

    if (state.lockedUntil && now < state.lockedUntil) {
      return {
        allowed: false,
        retryAfterMs: state.lockedUntil - now,
      };
    }

    state.attempts = state.attempts.filter(
      (t) => now - t < RATE_LIMIT_WINDOW_MS,
    );

    if (state.attempts.length >= MAX_ATTEMPTS_PER_WINDOW) {
      state.lockedUntil = now + LOCKOUT_DURATION_MS;
      return {
        allowed: false,
        retryAfterMs: LOCKOUT_DURATION_MS,
      };
    }

    return { allowed: true };
  }, []);

  const recordAttempt = useCallback(() => {
    stateRef.current.attempts.push(Date.now());
  }, []);

  const resetRateLimit = useCallback(() => {
    stateRef.current = { attempts: [], lockedUntil: null };
  }, []);

  return { checkRateLimit, recordAttempt, resetRateLimit };
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function Auth() {
  const { lang, setLang, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(
    null,
  );
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const isArabic = lang === 'ar';
  const { checkRateLimit, recordAttempt, resetRateLimit } =
    useRateLimiter();

  // =====================================================================
  // 🔒 REDIRECT AUTHENTICATED USERS TO DASHBOARD
  // Guard: do NOT redirect while the signup success screen is visible.
  // =====================================================================
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && isMounted && !signupSuccess) {
        navigate('/dashboard', { replace: true });
      }
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, signupSuccess]);

  // =====================================================================
  // 🔒 CLEAR ERROR ON INPUT CHANGE
  // Note: `signupSuccess` is intentionally NOT cleared here — it should
  // persist until the user explicitly dismisses it (clicks "Sign In Now").
  // =====================================================================
  useEffect(() => {
    if (error) setError(null);
    if (rateLimitMessage) setRateLimitMessage(null);
  }, [email, password, confirmPassword, isLogin]);

  // =====================================================================
  // 🔒 CLIENT-SIDE VALIDATION
  // =====================================================================
  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    const sanitizedEmail = sanitizeInput(email);

    if (!sanitizedEmail) {
      errors.email = isArabic
        ? 'البريد الإلكتروني مطلوب.'
        : 'Email is required.';
    } else if (!isValidEmail(sanitizedEmail)) {
      errors.email = isArabic
        ? 'صيغة البريد الإلكتروني غير صحيحة.'
        : 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = isArabic
        ? 'كلمة المرور مطلوبة.'
        : 'Password is required.';
    } else if (!isLogin) {
      const strength = validatePasswordStrength(password);
      if (!strength.valid) {
        errors.password = strength.message;
      }
    }

    if (!isLogin) {
      if (!confirmPassword) {
        errors.confirmPassword = isArabic
          ? 'يرجى تأكيد كلمة المرور.'
          : 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = isArabic
          ? 'كلمتا المرور غير متطابقتين.'
          : 'Passwords do not match.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // =====================================================================
  // 🔒 SUBMIT HANDLER
  // =====================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      const seconds = Math.ceil((rateCheck.retryAfterMs ?? 0) / 1000);
      setRateLimitMessage(
        isArabic
          ? `محاولات كثيرة. يرجى المحاولة بعد ${seconds} ثانية.`
          : `Too many attempts. Please wait ${seconds} seconds.`,
      );
      return;
    }

    if (!validateForm()) return;

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPassword = password;

    setLoading(true);
    setError(null);
    recordAttempt();

    try {
      if (isLogin) {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({
            email: sanitizedEmail,
            password: sanitizedPassword,
          });

        if (signInError) {
          const errorCode = signInError.message?.toLowerCase() ?? '';

          if (errorCode.includes('rate limit')) {
            setError(
              isArabic
                ? 'محاولات كثيرة. يرجى الانتظار دقيقة.'
                : 'Too many attempts. Please wait a minute.',
            );
          } else if (errorCode.includes('email not confirmed')) {
            setError(
              isArabic
                ? 'لم يتم تأكيد بريدك الإلكتروني بعد. يرجى تفقد بريدك والضغط على رابط التأكيد.'
                : 'Your email is not confirmed yet. Please check your inbox and click the confirmation link.',
            );
          } else {
            setError(GENERIC_AUTH_ERROR);
          }
          return;
        }

        resetRateLimit();
        setPassword('');
        setConfirmPassword('');
        navigate('/dashboard', { replace: true });
      } else {
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: sanitizedEmail,
            password: sanitizedPassword,
          });

        if (signUpError) {
          const errorCode = signUpError.message?.toLowerCase() ?? '';

          if (errorCode.includes('already registered')) {
            setError(
              isArabic
                ? 'تعذر إنشاء الحساب. حاول تسجيل الدخول أو استخدم بريداً آخر.'
                : 'Could not create account. Try signing in or use a different email.',
            );
          } else if (errorCode.includes('password')) {
            setError(signUpError.message);
          } else {
            setError(GENERIC_SIGNUP_ERROR);
          }
          return;
        }

        resetRateLimit();
        setPassword('');
        setConfirmPassword('');

        // =============================================================
        // ALWAYS show the success screen after a successful signup.
        // This is the single source of truth — regardless of whether
        // Supabase returned a user, a session, or neither.
        // =============================================================
        const hasSession = !!signUpData?.session;

        setSignupSuccess(sanitizedEmail);

        if (hasSession) {
          // Email confirmation not required → go to dashboard after delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2500);
        } else {
          // Email confirmation required → switch to login mode after delay
          // (the success screen stays visible until user clicks the button)
          setTimeout(() => {
            setIsLogin(true);
          }, 2000);
        }

        return;
      }
    } catch {
      setError(
        isArabic
          ? 'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.'
          : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 font-bold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity"
      >
        <Zap className="w-6 h-6 text-primary" />
        <span>{t('appTitle')}</span>
      </Link>

      <div className="absolute top-6 right-6">
        <label className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1.5 text-sm">
          <span className="text-muted-foreground">
            {t('languageLabel')}
          </span>
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
        {/* ============ SIGNUP SUCCESS SCREEN ============ */}
        {signupSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-5"
          >
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {isArabic ? 'تم إنشاء حسابك بنجاح' : 'Account created'}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isArabic
                  ? 'أرسلنا رسالة تأكيد إلى بريدك الإلكتروني. يرجى تفقد بريدك والضغط على رابط التأكيد لتنشيط حسابك.'
                  : "We've sent a confirmation email. Please check your inbox and click the confirmation link to activate your account."}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                {isArabic ? 'البريد المستخدم:' : 'Email:'}
              </p>
              <p className="text-sm font-medium text-foreground break-all">
                {signupSuccess}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSignupSuccess(null);
                  setIsLogin(true);
                }}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                {isArabic ? 'سجّل الدخول الآن' : 'Sign In Now'}
              </button>

              <p className="text-xs text-muted-foreground">
                {isArabic
                  ? 'بعد تأكيد بريدك، عد إلى هنا لتسجيل الدخول.'
                  : 'After confirming your email, come back here to sign in.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ============ HEADER ============ */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold">
                {isLogin ? t('welcomeBack') : t('createAccount')}
              </h2>
              <p className="text-muted-foreground mt-2">
                {isLogin ? t('signInIntro') : t('signUpIntro')}
              </p>
            </div>

            {/* Global error */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center"
              >
                {error}
              </div>
            )}

            {/* Rate limit message */}
            {rateLimitMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-sm text-center"
              >
                <ShieldCheck className="w-4 h-4 inline-block me-1" />
                {rateLimitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* EMAIL */}
              <div className="space-y-2">
                <label
                  htmlFor="auth-email"
                  className="text-sm font-medium text-foreground block"
                >
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    id="auth-email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={
                      fieldErrors.email ? 'email-error' : undefined
                    }
                    className={`w-full bg-background border rounded-lg py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      fieldErrors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-border focus:border-primary'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p
                    id="email-error"
                    className="text-xs text-red-400 mt-1"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="text-sm font-medium text-foreground block"
                  >
                    {t('password')}
                  </label>
                  {isLogin && (
                    <a
                      href="#"
                      className="text-xs text-accent hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      {t('forgotPassword')}
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete={
                      isLogin ? 'current-password' : 'new-password'
                    }
                    maxLength={PASSWORD_MAX_LENGTH}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={
                      fieldErrors.password
                        ? 'password-error'
                        : 'password-hint'
                    }
                    className={`w-full bg-background border rounded-lg py-2.5 pl-10 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      fieldErrors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-border focus:border-primary'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p
                    id="password-error"
                    className="text-xs text-red-400 mt-1"
                  >
                    {fieldErrors.password}
                  </p>
                ) : (
                  !isLogin && (
                    <p
                      id="password-hint"
                      className="text-xs text-muted-foreground mt-1"
                    >
                      {isArabic
                        ? '8 أحرف على الأقل، تتضمن حرفاً كبيراً وحرفاً صغيراً ورقماً.'
                        : 'At least 8 characters, with uppercase, lowercase, and a number.'}
                    </p>
                  )
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              {!isLogin && (
                <div className="space-y-2">
                  <label
                    htmlFor="auth-confirm-password"
                    className="text-sm font-medium text-foreground block"
                  >
                    {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                      id="auth-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      name="confirm-password"
                      autoComplete="new-password"
                      maxLength={PASSWORD_MAX_LENGTH}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      aria-invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={
                        fieldErrors.confirmPassword
                          ? 'confirm-password-error'
                          : undefined
                      }
                      className={`w-full bg-background border rounded-lg py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                        fieldErrors.confirmPassword
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-border focus:border-primary'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p
                      id="confirm-password-error"
                      className="text-xs text-red-400 mt-1"
                    >
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t('processing')
                  : isLogin
                    ? t('signIn')
                    : t('signUp')}
              </button>
            </form>

            {/* Toggle login/signup */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? t('noAccount') : t('hasAccount')}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setFieldErrors({});
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? t('signUpLink') : t('signInLink')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}