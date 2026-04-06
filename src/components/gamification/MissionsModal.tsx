import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Star, Clock, X, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface MissionsModalProps {
  onClose: () => void;
}

const MissionsModal = ({ onClose }: MissionsModalProps) => {
  const { missions, completeMission, addPoints } = useGameStore();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#2B0B0B]/90 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative bg-[#2B0B0B] border border-white/10 rounded-[40px] p-12 max-w-xl w-full shadow-[0_0_100px_rgba(232,76,76,0.1)] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-[#F9D8C6]/20 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#F9D8C6]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">每日挑战任务</h2>
            <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">完成任务即可获得积分与经验值奖励</p>
          </div>
        </div>

        <div className="space-y-4">
          {missions.map((mission) => (
            <div 
              key={mission.id}
              className={`group flex items-center gap-6 p-6 rounded-[32px] border transition-all ${
                mission.completed 
                  ? 'bg-white/5 border-white/5 opacity-50' 
                  : 'bg-white/10 border-white/10 hover:border-[#F9D8C6]/30 hover:bg-white/15 cursor-pointer'
              }`}
              onClick={() => !mission.completed && completeMission(mission.id)}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                mission.completed ? 'bg-green-500/20 text-green-500' : 'bg-[#F9D8C6]/10 text-[#F9D8C6]'
              }`}>
                {mission.completed ? <CheckCircle2 className="w-6 h-6" /> : <Star className="w-6 h-6" />}
              </div>
              
              <div className="flex-1">
                <div className="font-black text-lg text-white mb-1">{mission.title}</div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F9D8C6]">奖励: {mission.points} XP</span>
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">每日重置</span>
                </div>
              </div>

              {!mission.completed && (
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#F9D8C6] group-hover:text-[#2B0B0B] transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 text-white/20">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">距离下次任务重置还有 12:45:30</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MissionsModal;
