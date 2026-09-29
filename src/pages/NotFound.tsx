import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../lib/language';

export default function NotFound() {
  const { lang, t } = useLanguage();
  const isArabic = lang === 'ar';

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-background text-foreground flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-8xl font-extrabold text-primary/20 leading-none">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {isArabic ? 'الصفحة غير موجودة' : 'Page not found'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isArabic
              ? 'عذراً، الرابط الذي تبحث عنه غير موجود أو تم نقله.'
              : "Sorry, the page you're looking for doesn't exist or has been moved."}
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {isArabic ? 'رجوع' : 'Go back'}
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            {isArabic ? 'الرئيسية' : 'Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
