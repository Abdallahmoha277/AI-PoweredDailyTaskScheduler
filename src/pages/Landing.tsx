import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Calendar, Bot, Zap, ArrowRight } from "lucide-react"
import { useLanguage } from "../lib/language"

export default function Landing() {
  const { lang, setLang, t } = useLanguage()
  const isArabic = lang === "ar"

  const features = [
    {
      icon: Bot,
      title: t("feature1Title"),
      desc: t("feature1Desc"),
    },
    {
      icon: Zap,
      title: t("feature2Title"),
      desc: t("feature2Desc"),
    },
    {
      icon: Calendar,
      title: t("feature3Title"),
      desc: t("feature3Desc"),
    },
  ]

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Zap className="w-6 h-6 text-primary" />
            <span>{t("landingProduct")}</span>
          </div>

          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1.5 text-sm">
              <span className="text-muted-foreground">{t("languageLabel")}</span>
              <select
                aria-label={t("languageLabel")}
                value={lang}
                onChange={(e) => setLang(e.target.value as "en" | "ar")}
                className="bg-transparent text-foreground outline-none"
              >
                <option value="en">{t("english")}</option>
                <option value="ar">{t("arabic")}</option>
              </select>
            </label>

            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {t("navLogin")}
            </Link>
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              {t("navGetStarted")}
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-accent font-medium text-sm border border-secondary/30">
            <Bot className="w-4 h-4" />
            <span>{t("heroBadge")}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            {t("heroTitleBefore")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              {t("heroTitleAfter")}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("heroDescription")}
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {t("heroCta")} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32 text-left"
        >
          {features.map((feat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
