import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Calendar, Bot, Zap, ArrowRight, Sparkles } from "lucide-react"
import { useLanguage } from "../lib/language"

export default function Landing() {
  const { lang, setLang, t } = useLanguage()
  const isArabic = lang === "ar"

  const features = [
    {
      icon: Bot,
      title: t("feature1Title"),
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Zap,
      title: t("feature2Title"),
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: Calendar,
      title: t("feature3Title"),
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ]

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="h-[100dvh] overflow-hidden bg-background text-foreground flex flex-col"
    >
      {/* ==================== NAVBAR ==================== */}
      <header className="shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="px-4 h-12 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-1.5 font-bold text-base shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="tracking-tight">{t("landingProduct")}</span>
          </div>

          {/* Language + Login */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              aria-label={t("languageLabel")}
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "ar")}
              className="bg-transparent text-foreground outline-none cursor-pointer text-xs border-0 p-0 m-0 focus:outline-none focus:ring-0 font-medium"
            >
              <option value="en">EN</option>
              <option value="ar">ع</option>
            </select>

            <Link
              to="/auth"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("navLogin")}
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== MAIN ==================== */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Hero — fills most of the screen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-6 gap-4"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-[11px] font-semibold text-primary">
            <Sparkles className="w-3 h-3" strokeWidth={2.5} />
            <span>{t("heroBadge")}</span>
          </div>

          {/* Title */}
          <h1
            className={`font-extrabold leading-[1.15] w-full max-w-full break-words ${
              isArabic ? "" : "tracking-tight"
            }`}
          >
            <span className="block text-[26px] xs:text-[30px] text-foreground">
              {t("heroTitleBefore")}
            </span>
            <span className="block text-[26px] xs:text-[30px] text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary pb-1">
              {t("heroTitleAfter")}
            </span>
          </h1>

          {/* Description */}
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[340px]">
            {t("heroDescription")}
          </p>

          {/* CTA */}
          <Link
            to="/auth"
            className="mt-1 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(245,166,35,0.28)] w-full max-w-[280px]"
          >
            {t("heroCta")} <ArrowRight className="w-4 h-4 shrink-0 rtl:rotate-180" strokeWidth={2.5} />
          </Link>

          {/* Small "no account" hint */}
          <p className="text-[11px] text-muted-foreground/70">
            {isArabic ? 'لا تحتاج بطاقة ائتمانية' : 'No credit card required'}
          </p>
        </motion.div>

        {/* ==================== FEATURE PILLS (horizontal) ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="shrink-0 px-4 pb-5 pt-2"
        >
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            {features.map((feat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-card border border-border/60"
              >
                <div className={`w-8 h-8 rounded-lg ${feat.bg} flex items-center justify-center`}>
                  <feat.icon className={`w-4 h-4 ${feat.color}`} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-semibold text-center leading-tight text-foreground/80 line-clamp-2">
                  {feat.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}