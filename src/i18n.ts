import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  zh: {
    translation: {
      "welcome": "乡助桥",
      "slogan": "让爱无界",
      "hero_desc": "连接 128,000+ 志愿者，为偏远地区提供 4K 级沉浸式情感陪伴与数字化精准帮扶。",
      "join_now": "一键开启志愿之旅",
      "ai_match": "AI 智能匹配分析",
      "online_volunteers": "在线志愿者",
      "total_hours": "累计陪伴时长",
      "ongoing_tasks": "正在进行的任务",
      "real_time_data": "实时数据"
    }
  },
  en: {
    translation: {
      "welcome": "XiangZhuQiao",
      "slogan": "Bridge of Love",
      "hero_desc": "Connecting 128,000+ volunteers to provide 4K immersive emotional support and digital precision aid for remote areas.",
      "join_now": "Join as Volunteer",
      "ai_match": "AI Intelligent Match",
      "online_volunteers": "Online Volunteers",
      "total_hours": "Total Hours",
      "ongoing_tasks": "Ongoing Tasks",
      "real_time_data": "Real-time Data"
    }
  },
  ar: {
    translation: {
      "welcome": "XiangZhuQiao",
      "slogan": "جسر الحب",
      "hero_desc": "ربط أكثر من 128,000 متطوع لتقديم دعم عاطفي غامر بدقة 4K ومساعدة رقمية دقيقة للمناطق النائية.",
      "join_now": "انضم كمتطوع",
      "ai_match": "مطابقة الذكاء الاصطناعي الذكية",
      "online_volunteers": "المتطوعون عبر الإنترنت",
      "total_hours": "إجمالي الساعات",
      "ongoing_tasks": "المهام الجارية",
      "real_time_data": "بيانات فورية"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;