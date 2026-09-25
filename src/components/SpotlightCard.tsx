import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lightbulb,
  Bell,
  Megaphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../lib/language';

type SpotlightType = 'tip' | 'reminder' | 'announcement' | 'ad';

type SpotlightItem = {
  id: string;
  type: SpotlightType;
  title: string;
  description: string;
  actionText?: string;
  actionUrl?: string;
};

// =====================================================================
// 🔢 CONTENT VERSION
// غيّر هذا الرقم عندما تُحدِّث البطاقات (إضافة/تعديل/حذف)
// سيؤدي ذلك إلى إعادة عرض كل البطاقات للمستخدمين الذين أغلقوها سابقاً
// =====================================================================
const CONTENT_VERSION = '2';

const STORAGE_KEY = `taskflow-dismissed-spotlights-v${CONTENT_VERSION}`;

// =====================================================================
// ✏️ ADMIN CONTENT — عدّل هذه القائمة بحرية
// معرّف كل بطاقة (id) يجب أن يكون فريداً
// =====================================================================
const SPOTLIGHT_ITEMS: SpotlightItem[] = [
  {
    id: 'tip-1',
    type: 'tip',
    title: 'Pro tip',
    description:
      'Use the AI Assistant to add tasks in seconds. Just type what you need in plain language.',
  },
  {
    id: 'reminder-1',
    type: 'reminder',
    title: 'Stay focused',
    description:
      'You have tasks pending today. Try completing the highest priority one first.',
  },
  
  {
    id: 'announcement-1',
    type: 'announcement',
    title: 'New feature',
    description:
      'Task detail modal now supports inline editing — click any field to edit.',
  },
  {
    id: 'ad-1',
    type: 'ad',
    title: 'Upgrade to Pro',
    description: 'Unlock unlimited tasks and advanced analytics.',
    actionText: 'Learn more',
    actionUrl: '#',
  },

    {
    id: 'motivation-1',
    type: 'tip',
    title: 'همسة اليوم',
    description: 'كل خطوة صغيرة تقربك من هدفك. لا تستصغر إنجازاتك، فالعظماء بدأوا من حيث أنت الآن.',
  },
    // ==================== بطاقات تحفيزية ====================
  {
    id: 'motivation-1',
    type: 'tip',
    title: 'همسة اليوم',
    description:
      'كل خطوة صغيرة تقربك من هدفك. لا تستصغر إنجازاتك، فالعظماء بدأوا من حيث أنت الآن.',
  },
  {
    id: 'motivation-2',
    type: 'reminder',
    title: 'تذكّر دائماً',
    description:
      'النجاح ليس وصولاً، بل رحلة. استمتع بكل لحظة في الطريق، فالوصول بلا استمتاع لا قيمة له.',
  },
  {
    id: 'motivation-3',
    type: 'announcement',
    title: 'قوّتك الحقيقية',
    description:
      'لا تقارن بدايتك بنهايات الآخرين. أنت في طريقك الخاص، وسرعتك لا تهم — المهم ألا تتوقف.',
  },
  {
    id: 'motivation-4',
    type: 'tip',
    title: 'حكمة اليوم',
    description:
      'الأهداف الكبيرة لا تتحقق بالقفزات، بل بخطوات صغيرة يومية لا تتوقف.',
  },
  {
    id: 'motivation-5',
    type: 'ad',
    title: 'أنت تستحق الأفضل',
    description:
      'كل جهد تبذله اليوم سيعود إليك أضعافاً مضاعفة غداً. لا تبخل على نفسك بالاجتهاد.',
  },
  {
    id: 'motivation-6',
    type: 'reminder',
    title: 'لا تتوقف الآن',
    description:
      'أنت أقرب إلى هدفك مما تظن. التعب الذي تشعر به اليوم هو راحة الغد.',
  },
  {
    id: 'motivation-7',
    type: 'tip',
    title: 'ثقة بالنفس',
    description:
      'آمن بنفسك، فأنت قادر على أكثر مما تتخيل. الشك يقتل الأحلام قبل أن تبدأ.',
  },
  {
    id: 'motivation-8',
    type: 'announcement',
    title: 'ابدأ الآن',
    description:
      'لا تؤجل أحلامك للغد. أفضل وقت للبدء هو اللحظة التي تقرأ فيها هذه الكلمات.',
  },
  {
    id: 'motivation-9',
    type: 'reminder',
    title: 'خُذ نفساً',
    description:
      'أحياناً أفضل ما تفعله هو أن تتوقف قليلاً، تلتقط أنفاسك، ثم تكمل أقوى من قبل.',
  },
  {
    id: 'motivation-10',
    type: 'tip',
    title: 'الإصرار',
    description:
      'الفرق بين الناجح والذي فشل ليس القدرة ولا الذكاء، بل الإصرار على الاستمرار.',
  },
  {
    id: 'motivation-11',
    type: 'ad',
    title: 'فرصة اليوم',
    description:
      'اليوم الذي تعيشه الآن هو الغد الذي كنت تتمناه أمس. عِشه بامتنان واجتهاد.',
  },
  {
    id: 'motivation-12',
    type: 'announcement',
    title: 'أثرك',
    description:
      'اترك أثراً طيباً أينما ذهبت. الكلمات الطيبة تُنسى، لكن الأثر يبقى للأبد.',
  },
  {
    id: 'motivation-13',
    type: 'tip',
    title: 'الوقت',
    description:
      'الوقت هو رأس مالك الحقيقي. استثمره في ما ينفعك، ولا تدع لحظة تمر دون فائدة.',
  },
  {
    id: 'motivation-14',
    type: 'reminder',
    title: 'الصبر',
    description:
      'الصبر ليس انتظاراً سلبياً، بل جهد مستمر مع ثقة بأن الثمرة قادمة في وقتها.',
  },
  {
    id: 'motivation-15',
    type: 'ad',
    title: 'الفشل صديقك',
    description:
      'كل تجربة فاشلة هي درس نجاح. لا تخف من السقوط، بل تعلم كيف تقف أقوى.',
  },
  {
    id: 'motivation-16',
    type: 'tip',
    title: 'الشكر',
    description:
      'اشكر الله على ما لديك، وستجد المزيد. الامتنان يفتح أبواب البركة.',
  },
  {
    id: 'motivation-17',
    type: 'announcement',
    title: 'طموحك',
    description:
      'لا تجعل صوت الآخرين يخفت صوت طموحك. حلمك يخصك أنت، لا أحد غيرك.',
  },
  {
    id: 'motivation-18',
    type: 'reminder',
    title: 'اليوم فرصة',
    description:
      'كل صباح هو صفحة بيضاء. اكتب فيها ما تفتخر به غداً.',
  },
  {
    id: 'motivation-19',
    type: 'tip',
    title: 'الصحة',
    description:
      'صحتك تاج على رأسك. حافظ عليها قبل أن تبحث عنها، فهي أساس كل إنجاز.',
  },
  {
    id: 'motivation-20',
    type: 'ad',
    title: 'أنت مبدع',
    description:
      'داخل كل واحد منا إبداع ينتظر الفرصة. لا تكتمه، أطلقه اليوم.',
  },
];


const TYPE_STYLES: Record<
  SpotlightType,
  {
    icon: typeof Lightbulb;
    border: string;
    bg: string;
    text: string;
    iconBg: string;
  }
> = {
  tip: {
    icon: Lightbulb,
    border: 'border-primary/25',
    bg: 'from-primary/[0.06] to-transparent',
    text: 'text-primary',
    iconBg: 'bg-primary/15',
  },
  reminder: {
    icon: Bell,
    border: 'border-warning/25',
    bg: 'from-warning/[0.06] to-transparent',
    text: 'text-warning',
    iconBg: 'bg-warning/15',
  },
  announcement: {
    icon: Megaphone,
    border: 'border-accent/25',
    bg: 'from-accent/[0.06] to-transparent',
    text: 'text-accent',
    iconBg: 'bg-accent/15',
  },
  ad: {
    icon: Sparkles,
    border: 'border-success/25',
    bg: 'from-success/[0.06] to-transparent',
    text: 'text-success',
    iconBg: 'bg-success/15',
  },
};

export default function SpotlightCard() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  // Filter out already-dismissed cards
  // Any NEW card (with a new id NOT in `dismissed`) will show automatically
  const visibleItems = SPOTLIGHT_ITEMS.filter(
    (item) => !dismissed.includes(item.id),
  );

  const handleDismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {visibleItems.map((item) => {
          const style = TYPE_STYLES[item.type];
          const Icon = style.icon;

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 320,
                mass: 0.7,
              }}
              className={`relative rounded-2xl border bg-gradient-to-b ${style.border} ${style.bg} p-4 overflow-hidden`}
            >
              <button
                onClick={() => handleDismiss(item.id)}
                className="absolute top-2 end-2 w-6 h-6 rounded-md hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-7 h-7 rounded-lg ${style.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${style.text}`} />
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${style.text}`}
                >
                  {item.title}
                </span>
              </div>

              <p className="text-sm text-foreground leading-relaxed pe-6">
                {item.description}
              </p>

              {item.actionText && item.actionUrl && (
                <a
                  href={item.actionUrl}
                  className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold ${style.text} hover:gap-2.5 transition-all`}
                >
                  {item.actionText}
                  <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}