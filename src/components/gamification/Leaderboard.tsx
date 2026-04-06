import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Medal, Crown } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

const Leaderboard = () => {
  const users = [
    { name: '刘佳阳', level: 9, points: 2840, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { name: '黄友鑫', level: 8, points: 2150, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria' },
    { name: '李强', level: 7, points: 1980, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
    { name: '王敏', level: 6, points: 1560, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
    { name: '陈晨', level: 5, points: 1240, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo' },
  ];

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Medal className="w-5 h-5 text-orange-400" />;
      default: return <span className="text-xs font-black text-white/20">{index + 1}</span>;
    }
  };

  return (
    <div className="bg-[#2B0B0B]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest text-[#F9D8C6]">志愿者排行榜</h2>
      </div>

      <div className="space-y-4">
        {users.map((user, index) => (
          <motion.div 
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/5 cursor-pointer ${index === 0 ? 'bg-white/10 ring-1 ring-yellow-400/30' : ''}`}
          >
            <div className="w-6 flex justify-center">{getRankIcon(index)}</div>
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/10" />
            <div className="flex-1">
              <div className="text-sm font-bold">{user.name}</div>
              <div className="text-[10px] text-[#F9D8C6] font-black uppercase tracking-widest">LV.{user.level}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-white">{user.points}</div>
              <div className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">总积分</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
