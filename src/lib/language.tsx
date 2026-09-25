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
    // ============ Task Modal ============
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

    // ============ Landing ============
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

    // ============ Auth ============
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

    // ============ Layout / Sidebar ============
    sidebarDashboard: 'Dashboard',
    sidebarCalendar: 'Calendar',
    sidebarAssistant: 'AI Assistant',
    sidebarSettings: 'Settings',
    signOut: 'Sign Out',

    // ============ Dashboard ============
    todaysSchedule: "Today's Schedule",
    generateMyDay: 'Generate My Day',
    timeline: 'Timeline',
    emptyState: 'No tasks yet. Use the AI Assistant to schedule your day!',
    highPriority: 'High Priority',
    aiAssistant: 'AI Assistant',
    aiPlaceholder: 'Tell the AI what you need to do...',
    send: 'Send',

    // ============ Language / Branding ============
    languageLabel: 'Language',
    english: 'English',
    arabic: 'العربية',
    appTitle: 'TaskFlow AI',
    landingProduct: 'TaskFlow AI',
    backToHome: 'Back to home',

    // ============ Calendar ============
    calendarTitle: 'Calendar',
    scheduledTasks: 'Scheduled Tasks',
    unscheduledTasks: 'Unscheduled',
    emptyCalendar: 'No scheduled tasks yet. Add a due date to a task to see it here.',
    loadingTasks: 'Loading tasks...',

    // ============ Task Delete ============
    deleteTask: 'Delete',
    confirmDelete: 'Delete this task?',
    deleteError: 'Failed to delete task',

    // ============ Assistant ============
    assistantTitle: 'AI Assistant',
    assistantSubtitle: 'Tell me what you need to do, I will organize it for you.',
    assistantInputPlaceholder: 'Type a task or a message...',
    assistantThinking: 'Thinking',
    assistantEmpty: 'Start a conversation. Try one of the suggestions below.',
    assistantClear: 'Clear chat',
    assistantSuggestions: 'Try these',
    assistantSuccess: 'Task added successfully',
    assistantError: 'Something went wrong',
    suggestion1: 'Meeting with team tomorrow at 10am',
    suggestion2: 'Urgent: review report for 1 hour',
    suggestion3: 'Lunch break 30 minutes',

    // ============ Settings ============
    settingsTitle: 'Settings',
    settingsAccount: 'Account',
    settingsAccountDesc: 'Your account information',
    settingsEmail: 'Email',
    settingsMemberSince: 'Member since',
    settingsUserId: 'User ID',
    settingsPreferences: 'Preferences',
    settingsPreferencesDesc: 'Customize your experience',
    settingsLanguage: 'Language',
    settingsLanguageDesc: 'Choose your preferred language',
    settingsNotifications: 'Notifications',
    settingsNotificationsDesc: 'Receive reminders for upcoming tasks',
    settingsDangerZone: 'Danger Zone',
    settingsDangerZoneDesc: 'Irreversible actions',
    settingsSignOut: 'Sign out of your account',
    settingsDeleteAccount: 'Delete Account',
    settingsDeleteAccountDesc: 'Permanently delete your account and all data',
    settingsAbout: 'About',
    settingsVersion: 'Version',
    settingsSourceCode: 'Source Code',
    settingsEnabled: 'Enabled',
    settingsDisabled: 'Disabled',
    settingsChangeAvatar: 'Change photo',
    settingsRemoveAvatar: 'Remove photo',
    settingsUploading: 'Uploading...',
    settingsAvatarError: 'Failed to upload photo',
    settingsAvatarSuccess: 'Photo updated',
    settingsAvatarTooLarge: 'Photo is too large (max 2MB)',
    settingsDeleteAccountConfirmTitle: 'Delete your account?',
    settingsDeleteAccountConfirmBody:
      'This will permanently delete your account, all your tasks, and all associated data. This action cannot be undone.',
    settingsDeleteAccountConfirmButton: 'Yes, delete my account',
    settingsDeleteAccountCancel: 'Cancel',
    settingsDeleting: 'Deleting...',
    settingsDeleteError: 'Failed to delete account',
    settingsDeleteSuccess: 'Account deleted. Redirecting...',

    // ============ Task Detail Modal ============
    taskDetailHint: 'Tap any field to edit',
    taskDeleteModalTitle: 'Delete this task?',
    taskDeleteModalBody:
      'This action cannot be undone. The task will be permanently removed.',
    taskDeleteModalConfirm: 'Delete',
    taskDeleteModalCancel: 'Cancel',
    taskSaved: 'Saved',
    taskStatusPending: 'Pending',
    taskStatusInProgress: 'In progress',
    taskStatusDone: 'Done',
    taskNoDate: 'No date',
    taskNoDuration: 'No duration',
    taskStatusLabel: 'Status',
    taskPriorityLabel: 'Priority',
    taskDurationLabel: 'Duration',
    taskDueDateLabel: 'Due date',
    taskDescriptionPlaceholder: 'Add a description...',
  },
  ar: {
    // ============ Task Modal ============
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

    // ============ Landing ============
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
      'يقوم الذكاء الاصطناعي بترتيب المهام تلقائيًا حسب درجة الأهمية باستخدام مصفوفة إيزنهاور.',
    feature3Title: 'جدولة تلقائية',
    feature3Desc:
      "اضغط على 'إنشاء يومي' لبناء جدول مُحسَّن مع فترات تركيز مثالية.",

    // ============ Auth ============
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

    // ============ Layout / Sidebar ============
    sidebarDashboard: 'لوحة التحكم',
    sidebarCalendar: 'التقويم',
    sidebarAssistant: 'المساعد الذكي',
    sidebarSettings: 'الإعدادات',
    signOut: 'تسجيل الخروج',

    // ============ Dashboard ============
    todaysSchedule: 'جدول اليوم',
    generateMyDay: 'إنشاء يومي',
    timeline: 'الجدول الزمني',
    emptyState: 'لا توجد مهام بعد. استخدم المساعد الذكي لجدولة يومك!',
    highPriority: 'أولوية عالية',
    aiAssistant: 'المساعد الذكي',
    aiPlaceholder: 'أخبر الذكاء الاصطناعي بما تريد إنجازه...',
    send: 'إرسال',

    // ============ Language / Branding ============
    languageLabel: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    appTitle: 'TaskFlow AI',
    landingProduct: 'TaskFlow AI',
    backToHome: 'العودة إلى الرئيسية',

    // ============ Calendar ============
    calendarTitle: 'التقويم',
    scheduledTasks: 'المهام المجدولة',
    unscheduledTasks: 'غير مجدولة',
    emptyCalendar:
      'لا توجد مهام مجدولة بعد. أضف تاريخ استحقاق لمهمة لتظهر هنا.',
    loadingTasks: 'جارٍ تحميل المهام...',

    // ============ Task Delete ============
    deleteTask: 'حذف',
    confirmDelete: 'هل تريد حذف هذه المهمة؟',
    deleteError: 'فشل حذف المهمة',

    // ============ Assistant ============
    assistantTitle: 'المساعد الذكي',
    assistantSubtitle: 'أخبرني بما تحتاج إنجازه، وسأنظمه لك.',
    assistantInputPlaceholder: 'اكتب مهمة أو رسالة...',
    assistantThinking: 'يفكر',
    assistantEmpty: 'ابدأ محادثة. جرّب أحد الاقتراحات أدناه.',
    assistantClear: 'مسح المحادثة',
    assistantSuggestions: 'جرّب هذه',
    assistantSuccess: 'تمت إضافة المهمة بنجاح',
    assistantError: 'حدث خطأ ما',
    suggestion1: 'اجتماع مع الفريق غداً الساعة 10 صباحاً',
    suggestion2: 'عاجل: مراجعة التقرير لمدة ساعة',
    suggestion3: 'استراحة غداء لمدة 30 دقيقة',

    // ============ Settings ============
    settingsTitle: 'الإعدادات',
    settingsAccount: 'الحساب',
    settingsAccountDesc: 'معلومات حسابك',
    settingsEmail: 'البريد الإلكتروني',
    settingsMemberSince: 'عضو منذ',
    settingsUserId: 'معرّف المستخدم',
    settingsPreferences: 'التفضيلات',
    settingsPreferencesDesc: 'خصّص تجربتك',
    settingsLanguage: 'اللغة',
    settingsLanguageDesc: 'اختر لغتك المفضلة',
    settingsNotifications: 'الإشعارات',
    settingsNotificationsDesc: 'استقبل تذكيرات بالمهام القادمة',
    settingsDangerZone: 'منطقة الخطر',
    settingsDangerZoneDesc: 'إجراءات لا يمكن التراجع عنها',
    settingsSignOut: 'تسجيل الخروج من حسابك',
    settingsDeleteAccount: 'حذف الحساب',
    settingsDeleteAccountDesc: 'حذف حسابك وكل بياناتك نهائياً',
    settingsAbout: 'حول',
    settingsVersion: 'الإصدار',
    settingsSourceCode: 'الكود المصدري',
    settingsEnabled: 'مُفعّلة',
    settingsDisabled: 'متوقفة',
    settingsChangeAvatar: 'تغيير الصورة',
    settingsRemoveAvatar: 'إزالة الصورة',
    settingsUploading: 'جارٍ الرفع...',
    settingsAvatarError: 'فشل رفع الصورة',
    settingsAvatarSuccess: 'تم تحديث الصورة',
    settingsAvatarTooLarge: 'الصورة كبيرة جداً (2MB كحد أقصى)',
    settingsDeleteAccountConfirmTitle: 'حذف حسابك؟',
    settingsDeleteAccountConfirmBody:
      'سيتم حذف حسابك وجميع مهامك وكل البيانات المرتبطة به نهائياً. لا يمكن التراجع عن هذا الإجراء.',
    settingsDeleteAccountConfirmButton: 'نعم، احذف حسابي',
    settingsDeleteAccountCancel: 'إلغاء',
    settingsDeleting: 'جارٍ الحذف...',
    settingsDeleteError: 'فشل حذف الحساب',
    settingsDeleteSuccess: 'تم حذف الحساب. جارٍ التحويل...',

    // ============ Task Detail Modal ============
    taskDetailHint: 'اضغط على أي حقل للتعديل',
    taskDeleteModalTitle: 'حذف هذه المهمة؟',
    taskDeleteModalBody:
      'لا يمكن التراجع عن هذا الإجراء. سيتم حذف المهمة نهائياً.',
    taskDeleteModalConfirm: 'حذف',
    taskDeleteModalCancel: 'إلغاء',
    taskSaved: 'تم الحفظ',
    taskStatusPending: 'قيد الانتظار',
    taskStatusInProgress: 'قيد التنفيذ',
    taskStatusDone: 'مكتملة',
    taskNoDate: 'بدون تاريخ',
    taskNoDuration: 'بدون مدة',
    taskStatusLabel: 'الحالة',
    taskPriorityLabel: 'الأولوية',
    taskDurationLabel: 'المدة',
    taskDueDateLabel: 'تاريخ الاستحقاق',
    taskDescriptionPlaceholder: 'أضف وصفاً...',
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

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}