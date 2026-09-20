import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Calendar, Bot, Zap, ArrowRight, CheckCircle2 } from "lucide-react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Zap className="w-6 h-6 text-primary" />
            <span>TaskFlow AI</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-accent font-medium text-sm border border-secondary/30">
            <Bot className="w-4 h-4" />
            <span>Meet your new AI assistant</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            The intelligent way to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              optimize your day.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop manually scheduling. Just tell our AI what you need to do, and
            we'll automatically generate the perfect timeline for your
            productivity.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Start Planning Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32 text-left"
        >
          {[
            {
              icon: Bot,
              title: "Natural Language Input",
              desc: 'Type "Lunch at 1PM for an hour" and watch it appear on your schedule instantly.',
            },
            {
              icon: Zap,
              title: "Smart Prioritization",
              desc: "Our AI automatically ranks tasks by urgency using the Eisenhower Matrix.",
            },
            {
              icon: Calendar,
              title: "Auto-Scheduling",
              desc: "Click 'Generate My Day' to build an optimized timeline with perfect focus blocks.",
            },
          ].map((feat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
