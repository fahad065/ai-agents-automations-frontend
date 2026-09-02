export type Lang = "en" | "ar";

const t = {
  // Nav / global
  industries: { en: "Industries", ar: "القطاعات" },
  agents: { en: "Agents", ar: "الوكلاء" },
  automations: { en: "Automations", ar: "الأتمتة" },
  viewDetails: { en: "View details", ar: "عرض التفاصيل" },
  getBundle: { en: "Get this bundle", ar: "احصل على الحزمة" },
  viewBundle: { en: "View bundle", ar: "عرض الحزمة" },
  learnMore: { en: "Learn more", ar: "اعرف أكثر" },
  browseOther: { en: "Browse other industries", ar: "تصفح قطاعات أخرى" },
  comingSoon: { en: "Coming soon", ar: "قريباً" },
  tryAgain: { en: "Try again", ar: "حاول مجدداً" },
  failedToLoad: { en: "Failed to load. Please try again.", ar: "فشل التحميل. يرجى المحاولة مجدداً." },
  loading: { en: "Loading", ar: "جاري التحميل" },
  fromPerMonth: { en: "from", ar: "من" },
  perMonth: { en: "/mo", ar: "/شهر" },

  // Section labels
  completeBundle: { en: "Complete Bundle", ar: "الحزمة الكاملة" },
  whatsIncluded: { en: "What's included", ar: "ما يشمله" },
  capabilities: { en: "Capabilities", ar: "الإمكانيات" },
  fullBundle: { en: "Full Bundle", ar: "الحزمة الكاملة" },
  active: { en: "Active", ar: "نشط" },

  // Industries list page
  industriesHero: {
    en: "AI built for your industry.\nNot just for tech.",
    ar: "ذكاء اصطناعي مصمم لقطاعك.\nليس للتقنية فحسب.",
  },
  industriesSubtitle: {
    en: "Every industry has a bundle of pre-built AI agents and automations. Pick yours and go live in minutes.",
    ar: "لكل قطاع حزمة من وكلاء الذكاء الاصطناعي والأتمتة الجاهزة. اختر قطاعك وابدأ خلال دقائق.",
  },

  // Hero section
  heroHeading: {
    en: "AI Agents & Automations\nfor every business.",
    ar: "وكلاء ذكاء اصطناعي وأتمتة\nلكل عمل تجاري.",
  },
  heroSub: {
    en: "Deploy pre-built AI agents for your industry. From real estate to content creation, go live in minutes.",
    ar: "انشر وكلاء ذكاء اصطناعي جاهزين لقطاعك. من العقارات إلى إنشاء المحتوى، ابدأ خلال دقائق.",
  },
  heroCta: { en: "Browse industries", ar: "تصفح القطاعات" },
  heroCtaSec: { en: "View agents", ar: "عرض الوكلاء" },

  // Niches section
  nichesSectionTitle: {
    en: "Built for your industry.",
    ar: "مصمم لقطاعك.",
  },
  nichesSectionSub: {
    en: "Pick your industry. Get a full stack of AI agents and automations, ready to deploy.",
    ar: "اختر قطاعك. احصل على مجموعة كاملة من وكلاء الذكاء الاصطناعي والأتمتة، جاهزة للنشر.",
  },
  exploreAll: { en: "Explore all industries", ar: "استكشف كل القطاعات" },

  // Agents section
  agentsSectionTitle: { en: "Ready-to-deploy AI agents.", ar: "وكلاء ذكاء اصطناعي جاهزون للنشر." },
  agentsSectionSub: {
    en: "Each agent is built for a specific task. Connect your accounts and let them run.",
    ar: "كل وكيل مصمم لمهمة محددة. وصّل حساباتك ودعه يعمل.",
  },
  viewAllAgents: { en: "View all agents", ar: "عرض كل الوكلاء" },

  // Stats section
  builtForResults: { en: "Built for results", ar: "مبنية للنتائج" },

  // CTA section
  ctaBadge: { en: "Deploy your first agent today", ar: "انشر وكيلك الأول اليوم" },
  ctaHeadingLine1: { en: "Your competitors are already", ar: "منافسوك يعملون بالأتمتة" },
  ctaHeadingLine2: { en: "automating. Are you?", ar: "بالفعل. وأنت؟" },
  ctaSub: {
    en: "Join businesses in the UAE and Kenya deploying AI agents, automations and chatbots that handle content, sales, support and marketing 24 hours a day.",
    ar: "انضم إلى الشركات في الإمارات وكينيا التي تنشر وكلاء ذكاء اصطناعي وأتمتة وشات بوتات تتولى المحتوى والمبيعات والدعم والتسويق على مدار 24 ساعة.",
  },
  ctaPrimary: { en: "Get started free", ar: "ابدأ مجاناً" },
  ctaSecondaryIndustries: { en: "Browse industries", ar: "تصفح القطاعات" },
  trustNoCard: { en: "No credit card required", ar: "لا حاجة لبطاقة ائتمان" },
  trust30Day: { en: "30-day free trial", ar: "30 يوم تجريب مجاني" },
  trustCancel: { en: "Cancel anytime", ar: "إلغاء في أي وقت" },
  trustOwnKeys: { en: "Own your API keys", ar: "مفاتيح API الخاصة بك" },

  // Features / How it works section
  howItWorks: { en: "How it works", ar: "كيف يعمل" },
  fromZeroToAutomated: { en: "From zero to automated\nin 4 steps", ar: "من الصفر إلى الأتمتة\nفي 4 خطوات" },
  featuresSubtitle: {
    en: "No technical skills needed. Your first agent is live in under 10 minutes.",
    ar: "لا تحتاج مهارات تقنية. وكيلك الأول يعمل خلال أقل من 10 دقائق.",
  },
  step: { en: "Step", ar: "خطوة" },
  step1Title: { en: "Browse the marketplace", ar: "تصفح السوق" },
  step1Desc: {
    en: "Choose from 20+ pre-built agents, automations and chatbots across 12 industries. Each one is production-ready with no configuration required.",
    ar: "اختر من بين أكثر من 20 وكيلاً وأتمتة وشات بوت جاهزة عبر 12 قطاعاً. كل واحد جاهز للإنتاج دون الحاجة لأي إعداد.",
  },
  step2Title: { en: "Pick your country & niche", ar: "اختر بلدك وتخصصك" },
  step2Desc: {
    en: "Select your market (UAE or Kenya) and your industry niche. The agent adapts its content, language and strategy to your context.",
    ar: "اختر سوقك (الإمارات أو كينيا) وتخصصك في القطاع. يكيّف الوكيل محتواه ولغته واستراتيجيته حسب سياقك.",
  },
  step3Title: { en: "Deploy and let it run", ar: "انشر ودعه يعمل" },
  step3Desc: {
    en: "Press activate. Your agent starts immediately — generating content, engaging leads, posting to platforms and logging every action.",
    ar: "اضغط تفعيل. يبدأ وكيلك فوراً — بإنشاء المحتوى وإشراك العملاء والنشر على المنصات وتسجيل كل إجراء.",
  },
  step4Title: { en: "Track from one dashboard", ar: "تتبع من لوحة تحكم واحدة" },
  step4Desc: {
    en: "Monitor all your agents in real time. Pipeline logs show every step — costs, outputs, failures and next scheduled runs.",
    ar: "راقب جميع وكلائك في الوقت الفعلي. تُظهر سجلات المسار كل خطوة — التكاليف والمخرجات والأخطاء والتشغيلات القادمة.",
  },

  // Footer
  footerDesc: {
    en: "The AI automation platform for GCC businesses. Deploy agents, not employees.",
    ar: "منصة الأتمتة بالذكاء الاصطناعي لشركات دول مجلس التعاون الخليجي. انشر وكلاء، لا موظفين.",
  },
  footerProduct: { en: "Product", ar: "المنتج" },
  footerCompany: { en: "Company", ar: "الشركة" },
  footerLegal: { en: "Legal", ar: "القانوني" },
  footerAllRightsReserved: { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },

  // Navbar
  navSignIn: { en: "Sign in", ar: "تسجيل الدخول" },
  navGetStarted: { en: "Get started", ar: "ابدأ الآن" },
  navPricing: { en: "Pricing", ar: "الأسعار" },
  navAbout: { en: "About", ar: "عن الشركة" },

  // Detail pages
  aiAgents: { en: "AI Agents", ar: "وكلاء الذكاء الاصطناعي" },
  automationsLabel: { en: "Automations", ar: "الأتمتة" },
  agent: { en: "agent", ar: "وكيل" },
  automation: { en: "automation", ar: "أتمتة" },
  agents2: { en: "agents", ar: "وكيل" },
  automations2: { en: "automations", ar: "أتمتة" },

  // Industry names (used in list page when DB data not available)
  industries_content_social: { en: "Content & Social", ar: "المحتوى والتواصل الاجتماعي" },
  industries_real_estate: { en: "Real Estate", ar: "العقارات" },
  industries_marketing: { en: "Marketing", ar: "التسويق" },
  industries_ecommerce_retail: { en: "E-commerce", ar: "التجارة الإلكترونية" },
  industries_healthcare: { en: "Healthcare", ar: "الرعاية الصحية" },
  industries_hr_recruitment: { en: "HR & Recruitment", ar: "الموارد البشرية والتوظيف" },
  industries_hospitality: { en: "Hospitality", ar: "الضيافة" },
  industries_education: { en: "Education", ar: "التعليم" },
  industries_logistics: { en: "Logistics", ar: "اللوجستيات" },
  industries_agriculture: { en: "Agriculture", ar: "الزراعة" },
  industries_finance: { en: "Finance", ar: "المالية" },
  industries_internal_copilot: { en: "Internal Tools", ar: "الأدوات الداخلية" },

  // Industry descriptions
  desc_content_social: {
    en: "Post to every platform, every day, in any language — without lifting a finger.",
    ar: "انشر على كل منصة، كل يوم، بأي لغة — دون أن ترفع إصبعاً.",
  },
  desc_real_estate: {
    en: "Qualify leads on WhatsApp and follow up 24/7 across UAE and Kenyan markets.",
    ar: "أهّل العملاء المحتملين عبر واتساب وتابعهم على مدار الساعة في أسواق الإمارات وكينيا.",
  },
  desc_marketing: {
    en: "Build automated funnels that generate, nurture and convert leads at scale.",
    ar: "ابنِ مسارات تلقائية تولّد العملاء وترعاهم وتحوّلهم على نطاق واسع.",
  },
  desc_ecommerce_retail: {
    en: "Automate product listings, customer reviews and social selling.",
    ar: "أتمتة قوائم المنتجات ومراجعات العملاء والبيع عبر وسائل التواصل.",
  },
  desc_healthcare: {
    en: "HIPAA-aware agents for patient outreach and healthcare content.",
    ar: "وكلاء مدركون لمتطلبات HIPAA لتواصل المرضى ومحتوى الرعاية الصحية.",
  },
  desc_hr_recruitment: {
    en: "Post jobs, screen CVs and onboard new hires — all automated.",
    ar: "انشر الوظائف، فلتر السير الذاتية، وأدمج الموظفين الجدد — كل شيء تلقائي.",
  },
  desc_hospitality: {
    en: "Delight guests before, during and after their stay.",
    ar: "أسعد ضيوفك قبل الإقامة وخلالها وبعدها.",
  },
  desc_education: {
    en: "Grow enrollments and keep students engaged with AI-driven content.",
    ar: "انمِّ التسجيلات وحافظ على تفاعل الطلاب بمحتوى مدعوم بالذكاء الاصطناعي.",
  },
  desc_logistics: {
    en: "Keep clients informed and operations moving without manual updates.",
    ar: "أبقِ العملاء على اطلاع والعمليات سائرة دون تحديثات يدوية.",
  },
  desc_agriculture: {
    en: "Reach rural markets with localised, actionable agricultural intelligence.",
    ar: "تواصل مع الأسواق الريفية بمعلومات زراعية محلية وقابلة للتنفيذ.",
  },
  desc_finance: {
    en: "Automated market insights, reports and compliant financial content.",
    ar: "رؤى سوقية تلقائية وتقارير ومحتوى مالي متوافق.",
  },
  desc_internal_copilot: {
    en: "AI copilots that support your internal teams and customer service.",
    ar: "مساعدون ذكاء اصطناعي يدعمون فرقك الداخلية وخدمة العملاء.",
  },
} as const;

export function tr(key: keyof typeof t, lang: Lang): string {
  const entry = t[key];
  return (entry as Record<Lang, string>)[lang] ?? (entry as Record<Lang, string>).en;
}

export function industryName(slug: string, lang: Lang): string {
  const key = `industries_${slug}` as keyof typeof t;
  if (key in t) return tr(key, lang);
  return slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function industryDesc(slug: string, lang: Lang): string {
  const key = `desc_${slug}` as keyof typeof t;
  if (key in t) return tr(key, lang);
  return "";
}
