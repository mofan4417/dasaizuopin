import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake } from 'lucide-react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import VoiceSearch from '../components/visual/VoiceSearch';
import RuralBridgeScene from '../components/visual/RuralBridgeScene';
import { useGameStore } from '../store/useGameStore';

const Home = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<any>({});
  const [stats, setStats] = useState<any>({ total_served: 0, total_hours: 0, total_villages: 0, page_views: 0 });
  const { completeMission, unlockAchievement } = useGameStore();

  useEffect(() => {
    unlockAchievement('first_visit');
    completeMission('daily_login');
  }, [completeMission, unlockAchievement]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    const initHome = async () => {
      try {
        await api.incrementView().catch(() => null);
        const [contentData, statsData] = await Promise.all([
          api.getSiteContent().catch(() => ({})),
          api.getStats().catch(() => ({ total_served: 156, total_hours: 2340, total_villages: 12, page_views: 0 })),
        ]);
        setContent(contentData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to init home:', error);
      }
    };

    initHome();
  }, []);

  const heroCopy = useMemo(
    () => ({
      eyebrow: typeof content.hero_badge === 'string' && content.hero_badge.trim() ? content.hero_badge.trim() : '乡村公益连接网络',
      title: typeof content.hero_title === 'string' && content.hero_title.trim() ? content.hero_title.trim() : '把温暖送进山路另一端',
      subtitle:
        typeof content.hero_subtitle === 'string' && content.hero_subtitle.trim()
          ? content.hero_subtitle.trim()
          : '让大学生、村落与服务对象形成真正可达的连接，把认领、陪伴与长期支持做成一座看得见、记得住的桥。',
    }),
    [content]
  );

  const metrics = [
    { label: '累计服务对象', value: Number(stats.total_served || 156).toLocaleString('zh-CN') },
    { label: '志愿服务时长', value: `${Number(stats.total_hours || 2340).toLocaleString('zh-CN')}h` },
    { label: '覆盖村落', value: `${Number(stats.total_villages || 12).toLocaleString('zh-CN')}+` },
  ];

  const handleVoiceResult = (text: string) => {
    navigate(`/service-objects?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0F0405] text-white selection:bg-[#8B0000] selection:text-white">
      <VoiceSearch onResult={handleVoiceResult} />
      <Navbar />

      <main className="relative h-screen overflow-hidden">
        <section className="relative h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.14),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(139,0,0,0.26),transparent_35%),linear-gradient(180deg,#130405_0%,#0F0405_100%)]" />
          <div className="absolute right-0 top-0 h-full w-full lg:w-[64%]">
            <RuralBridgeScene />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,4,5,0.98)_0%,rgba(15,4,5,0.9)_36%,rgba(15,4,5,0.32)_60%,rgba(15,4,5,0.1)_100%)]" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] items-center px-5 pt-24 md:px-10 lg:px-16">
            <div className="max-w-[630px]">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-xl"
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#D4AF37]" />
                <span className="text-[11px] font-black uppercase tracking-[0.32em] text-[#EFD89A]">{heroCopy.eyebrow}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mt-8 text-5xl font-black leading-[0.92] tracking-tight text-white md:text-7xl xl:text-[6.4rem]"
              >
                乡助桥
                <span className="mt-3 block bg-gradient-to-r from-[#FFFFFF] via-[#F3DFA0] to-[#C75B63] bg-clip-text text-transparent">
                  {heroCopy.title}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-8 max-w-[560px] text-base leading-8 text-white/68 md:text-xl"
              >
                {heroCopy.subtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.3 }}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <button
                  onClick={() => navigate('/service-objects')}
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-[#D4AF37]/30 bg-gradient-to-r from-[#8B0000] to-[#722F37] px-8 py-4 text-base font-black text-white shadow-[0_20px_60px_rgba(139,0,0,0.35)] transition-all hover:scale-[1.02]"
                >
                  认领服务对象
                  <ArrowRight className="h-5 w-5 text-[#F1DA9A]" />
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-black text-white backdrop-blur-xl transition-all hover:bg-white/10"
                >
                  <HeartHandshake className="h-5 w-5 text-[#D4AF37]" />
                  成为志愿者
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.4 }}
                className="mt-12 grid max-w-[560px] grid-cols-1 gap-4 sm:grid-cols-3"
              >
                {metrics.map((item) => (
                  <div key={item.label} className="border-l border-white/10 pl-4">
                    <div className="text-2xl font-black text-white md:text-3xl">{item.value}</div>
                    <div className="mt-1 text-xs font-black uppercase tracking-[0.22em] text-white/35">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0F0405] to-transparent" />
        </section>
      </main>

    </div>
  );
};

export default Home;
