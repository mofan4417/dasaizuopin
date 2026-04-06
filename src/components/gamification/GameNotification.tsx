import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { Star, Trophy, Zap } from 'lucide-react';

const GameNotification = () => {
  const location = useLocation();
  const { points, level, achievements } = useGameStore();
  const [notif, setNotif] = React.useState<{ id: string, type: 'points' | 'achievement' | 'level', text: string } | null>(null);
  const shouldHide = location.pathname === '/data-dashboard';

  // Monitor points change
  useEffect(() => {
    if (points > 0) {
      setNotif({ id: Math.random().toString(), type: 'points', text: `+${points} 积分` });
      const timer = setTimeout(() => setNotif(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [points]);

  // Monitor level change
  useEffect(() => {
    if (level > 1) {
      setNotif({ id: Math.random().toString(), type: 'level', text: `恭喜升级到 LV.${level}` });
      const timer = setTimeout(() => setNotif(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  // Monitor achievements
  useEffect(() => {
    const unlocked = achievements.filter(a => a.unlocked);
    if (unlocked.length > 0) {
      const lastUnlocked = unlocked[unlocked.length - 1];
      setNotif({ id: Math.random().toString(), type: 'achievement', text: `解锁成就：${lastUnlocked.title}` });
      const timer = setTimeout(() => setNotif(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [achievements]);

  return (
    <AnimatePresence>
      {!shouldHide && notif && (
        <motion.div
          key={notif.id}
          initial={{ y: -100, opacity: 0, x: '-50%', scale: 0.8 }}
          animate={{ y: 50, opacity: 1, x: '-50%', scale: 1 }}
          exit={{ y: -100, opacity: 0, x: '-50%', scale: 0.8 }}
          className="fixed top-0 left-1/2 z-[200] bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#722F37] p-[2px] rounded-full shadow-[0_20px_50px_rgba(139,0,0,0.45)] group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          <div className="relative bg-[#1A0707]/90 backdrop-blur-3xl px-10 py-4 rounded-full flex items-center gap-6 border border-white/5">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8B0000] to-[#722F37] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform border border-white/10">
              {notif.type === 'points' && <Star className="w-5 h-5 text-[#D4AF37]" />}
              {notif.type === 'level' && <Zap className="w-5 h-5 text-[#D4AF37]" />}
              {notif.type === 'achievement' && <Trophy className="w-5 h-5 text-[#D4AF37]" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{notif.type === 'level' ? 'System Evolution' : 'Quest Reward'}</span>
              <span className="font-black text-base tracking-tighter text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{notif.text}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameNotification;
