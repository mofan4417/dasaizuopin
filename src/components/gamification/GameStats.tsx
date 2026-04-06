import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { Trophy, Star, Zap, ChevronRight, Layout, Menu, X } from 'lucide-react';

import { LEVEL_HIERARCHY } from '../../store/useGameStore';

const GameStats = () => {
  const location = useLocation();
  const { points, level, xp, xpToNextLevel, achievements, missions } = useGameStore();
  const [isOpen, setIsOpen] = useState(true);
  const currentLevelInfo = LEVEL_HIERARCHY[level] || LEVEL_HIERARCHY[1];
  const progress = (xp / xpToNextLevel) * 100;
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const shouldHide = location.pathname === '/data-dashboard';

  return (
    <>
      {!shouldHide && (
        <>
      {/* Floating Toggle Button for Mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ 
          scale: isOpen ? 0 : 1,
          opacity: isOpen ? 0 : 1
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-32 right-8 z-[60] lg:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#722F37] text-white flex items-center justify-center shadow-[0_0_20px_rgba(139,0,0,0.55)] border border-white/20"
      >
        <Layout className="w-6 h-6" />
      </motion.button>

      {/* 隐藏/显示控制按钮 - 仅在大屏幕显示 */}
      <motion.button
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/3 -translate-y-1/2 right-3 z-[61] w-10 h-10 rounded-l-full bg-gradient-to-r from-[#8B0000] to-[#722F37] flex items-center justify-center shadow-lg hidden lg:block"
      >
        <motion.svg 
          className="w-5 h-5 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </motion.svg>
      </motion.button>

      <motion.div 
        className="fixed top-24 right-4 z-[60] flex flex-col gap-4"
        initial={{ x: 0, opacity: 1 }}
        animate={{ 
          x: isOpen ? 0 : 400,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* XP & Level Card */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="group relative bg-[#1A0707]/60 backdrop-blur-[40px] border border-white/10 rounded-[32px] p-7 shadow-[0_32px_64px_rgba(0,0,0,0.5)] w-[320px] overflow-hidden"
        >
          {/* 关闭按钮 */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-4 h-4 text-white" />
          </motion.button>
          {/* Shimmering Border */}
          <div className="absolute inset-0 border border-white/5 rounded-[32px] pointer-events-none" />
          <div className="absolute -inset-[2px] bg-gradient-to-r from-transparent via-[#8B0000]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-shimmer" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  animate={currentLevelInfo.effect ? { 
                    scale: [1, 1.1, 1],
                    boxShadow: ["0 0 10px rgba(139,0,0,0.3)", "0 0 30px rgba(139,0,0,0.6)", "0 0 10px rgba(139,0,0,0.3)"]
                  } : {}}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className={`w-14 h-14 bg-gradient-to-br ${currentLevelInfo.color} text-[#1A0707] rounded-2xl flex items-center justify-center font-black text-3xl shadow-2xl relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                  <span className="relative z-10">{currentLevelInfo.badge}</span>
                </motion.div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-1">Level {level}</div>
                  <div className={`text-lg font-black bg-gradient-to-r ${currentLevelInfo.color} bg-clip-text text-transparent`}>
                    {currentLevelInfo.title}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-1">Points</div>
                <div className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{points}</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] text-white/40">
                <span>Experience (XP)</span>
                <span className="text-[#D4AF37]">{Math.floor(xp)} <span className="text-white/20">/</span> {xpToNextLevel}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#722F37] rounded-full shadow-[0_0_15px_rgba(139,0,0,0.5)] relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors group/item">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[10px] font-black text-white/40 uppercase">Badges</span>
                </div>
                <div className="text-sm font-black text-white">{unlockedCount} <span className="text-[10px] text-white/20 font-medium">Earned</span></div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 hover:bg-white/10 transition-colors group/item">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[10px] font-black text-white/40 uppercase">Rank</span>
                </div>
                <div className="text-sm font-black text-white">#128 <span className="text-[10px] text-white/20 font-medium">Global</span></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Challenges Card */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A0707]/40 backdrop-blur-[30px] border border-white/10 rounded-[28px] p-6 shadow-2xl w-[320px]"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Daily Missions</h3>
            </div>
            <div className="px-2 py-1 rounded-md bg-[#8B0000]/15 border border-white/10 text-[9px] font-black text-[#D4AF37] uppercase tracking-wider">
              {missions.filter(m => m.completed).length}/{missions.length}
            </div>
          </div>
          
          <div className="space-y-3">
            {missions.slice(0, 3).map((mission) => (
              <div key={mission.id} className="flex items-center justify-between group/mission cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${mission.completed ? 'bg-[#D4AF37]' : 'bg-white/10'}`} />
                  <span className={`text-xs font-bold transition-colors ${mission.completed ? 'text-white/40 line-through' : 'text-white/80 group-hover/mission:text-white'}`}>
                    {mission.title}
                  </span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black border transition-all ${
                  mission.completed 
                    ? 'bg-[#8B0000]/15 border-white/10 text-[#D4AF37]' 
                    : 'bg-white/5 border-white/10 text-white/40 group-hover/mission:border-white/20 group-hover/mission:text-[#D4AF37]'
                }`}>
                  +{mission.points} XP
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
        </>
      )}
    </>
  );
};

export default GameStats;
