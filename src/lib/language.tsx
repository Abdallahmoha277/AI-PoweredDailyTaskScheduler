import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Language = 'en' | 'ar'

const translations = {
  en: {
    modalAddTitle: 'Add New Task',
    taskTitleLabel: 'Task Title *',
    taskTitlePlaceholder: 'What do you want to accomplish?',
    taskDescLabel: 'Description (Optional)',
    taskDescPlaceholder: 'Add extra details...',
    priorityLabel: 'Priority',
    priorityLow: 'Low 🟢',
    priorityMedium: 'Medium 🟡',
    priorityHigh: 'High 🔴',
    durationLabel: 'Estimated Duration',
    dueDateLabel: 'Due Date (Optional)',
    cancel: 'Cancel',
    saveTask: 'Save Task',
    savingTask: 'Saving...',
    addSuccess: 'Task added successfully',
    addError: 'Error adding task',
    navLogin: 'Log in',
    navGetStarted: 'Get Started',
    heroBadge: 'Meet your new AI assistant',
    heroTitleBefore: 'The intelligent way to',
    heroTitleAfter: 'optimize your day.',
    heroDescription:
      "Stop manually scheduling. Just tell our AI what you need to do, and we'll automatically generate the perfect timeline for your productivity.",
    heroCta: 'Start Planning Free',
    feature1Title: 'Natural Language Input',
    feature1Desc:
      'Type "Lunch at 1PM for an hour" and watch it appear on your schedule instantly.',
    feature2Title: 'Smart Prioritization',
    feature2Desc:
      'Our AI automatically ranks tasks by urgency using the Eisenhower Matrix.',
    feature3Title: 'Auto-Scheduling',
    feature3Desc:
      "Click 'Generate My Day' to build an optimized timeline with perfect focus blocks.",
    welcomeBack: 'Welcome back',
    createAccount: 'Create an account',
    signInIntro: 'Enter your details to sign in.',
    signUpIntro: 'Get started with intelligent scheduling.',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    processing: 'Processing...',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    noAccount: "Don't have an account? ",
    hasAccount: 'Already have an account? ',
    signUpLink: 'Sign up',
    signInLink: 'Sign in',
    sidebarDashboard: 'Dashboard',
    sidebarCalendar: 'Calendar',
    sidebarAssistant: 'AI Assistant',
    sidebarSettings: 'Settings',
    signOut: 'Sign Out',
    todaysSchedule: "Today's Schedule",
    generateMyDay: 'Generate My Day',
    timeline: 'Timeline',
    emptyState: 'No tasks yet. Use the AI Assistant to schedule your day!',
    highPriority: 'High Priority',
    aiAssistant: 'AI Assistant',
    aiPlaceholder: 'Tell the AI what you need to do...',
    send: 'Send',
    languageLabel: 'Language',
    english: 'English',
    arabic: 'العربية',
    appTitle: 'TaskFlow AI',
    landingProduct: 'TaskFlow AI',
    backToHome: 'Back to home',
  },
  ar: {
    modalAddTitle: 'إضافة مهمة جديدة',
    taskTitleLabel: 'عنوان المهمة *',
    taskTitlePlaceholder: 'ما الذي تود إنجازه؟',
    taskDescLabel: 'الوصف (اختياري)',
    taskDescPlaceholder: 'أضف تفاصيل إضافية للمهمة...',
    priorityLabel: 'الأولوية',
    priorityLow: 'منخفضة 🟢',
    priorityMedium: 'متوسطة 🟡',
    priorityHigh: 'عالية 🔴',
    durationLabel: 'المدة المتوقعة',
    dueDateLabel: 'تاريخ الاستحقاق (اختياري)',
    cancel: 'إلغاء',
    saveTask: 'حفظ المهمة',
    savingTask: 'جاري الحفظ...',
    addSuccess: 'تمت إضافة المهمة بنجاح',
    addError: 'حدث خطأ أثناء إضافة المهمة',
    navLogin: 'تسجيل الدخول',
    navGetStarted: 'ابدأ الآن',
    heroBadge: 'قابل مساعدك الذكي الجديد',
    heroTitleBefore: 'الطريقة الذكية لـ',
    heroTitleAfter: 'تحسين يومك.',
    heroDescription:
      'توقف عن الجدولة اليدوية. فقط أخبر الذكاء الاصطناعي بما تحتاج إلى القيام به، وسيقوم تلقائيًا بإنشاء جدولك المثالي لزيادة الإنتاجية.',
    heroCta: 'ابدأ التخطيط مجانًا',
    feature1Title: 'إدخال طبيعي',
    feature1Desc:
      'اكتب "غداء في الواحدة بعد الظهر لمدة ساعة" وشاهد ظهوره على جدولك فورًا.',
    feature2Title: 'أولوية ذكية',
    feature2Desc:
      'يقوم الذكاء الاصطناعي بترتيب المهام تلقائيًا حسب درجة urgency باستخدام مصفوفة إيزنهاور.',
    feature3Title: 'جدولة تلقائية',
    feature3Desc:
      "اضغط على 'إنشاء يومي' لبناء جدول مُحسَّن مع فترات تركيز مثالية.",
    welcomeBack: 'مرحبًا بعودتك',
    createAccount: 'إنشاء حساب',
    signInIntro: 'أدخل بياناتك لتسجيل الدخول.',
    signUpIntro: 'ابدأ مع الجدولة الذكية.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    processing: 'جارٍ المعالجة...',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟ ',
    hasAccount: 'هل لديك حساب؟ ',
    signUpLink: 'إنشاء حساب',
    signInLink: 'تسجيل الدخول',
    sidebarDashboard: 'لوحة التحكم',
    sidebarCalendar: 'التقويم',
    sidebarAssistant: 'المساعد الذكي',
    sidebarSettings: 'الإعدادات',
    signOut: 'تسجيل الخروج',
    todaysSchedule: 'جدول اليوم',
    generateMyDay: 'إنشاء يومي',
    timeline: 'الجدول الزمني',
    emptyState: 'لا توجد مهام بعد. استخدم المساعد الذكي لجدولة يومك!',
    highPriority: 'أولوية عالية',
    aiAssistant: 'المساعد الذكي',
    aiPlaceholder: 'أخبر الذكاء الاصطناعي بما تريد إنجازه...',
    send: 'إرسال',
    languageLabel: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    appTitle: 'TaskFlow AI',
    landingProduct: 'TaskFlow AI',
    backToHome: 'العودة إلى الرئيسية',
  },
} as const

export type TranslationKey = keyof (typeof translations)['en']

const LanguageContext = createContext<{
  lang: Language
  setLang: (next: Language) => void
  t: (key: TranslationKey) => string
} | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en'
    const saved = window.localStorage.getItem('taskflow-lang')
    if (saved === 'ar' || saved === 'en') return saved
    return window.navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en'
  })

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    window.localStorage.setItem('taskflow-lang', lang)
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang: (next: Language) => setLangState(next),
      t: (key: TranslationKey) => translations[lang][key],
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}
