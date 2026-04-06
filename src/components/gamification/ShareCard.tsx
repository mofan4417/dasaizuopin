import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, Heart, Award, ShieldCheck, X } from 'lucide-react';

interface ShareCardProps {
  onClose: () => void;
  userData: {
    name: string;
    level: number;
    points: number;
    unlockedCount: number;
  };
}

const ShareCard = ({ onClose, userData }: ShareCardProps) => {
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
        className="relative bg-white border border-white/10 rounded-[40px] p-1 w-full max-w-sm overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[#E84C4C] to-[#2B0B0B] p-12 space-y-12 relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F9D8C6]/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2">
              <Heart className="text-[#E84C4C] fill-current" />
            </div>
            <span className="font-black text-white uppercase tracking-widest text-lg">乡助桥</span>
          </div>

          <div className="space-y-6">
            <div className="text-sm font-black text-white/40 uppercase tracking-[0.3em]">志愿者荣誉证书</div>
            <h2 className="text-4xl font-black text-white uppercase leading-tight">
              {userData.name}<br />
              <span className="text-[#F9D8C6]">正式成为</span><br />
              一束光
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">当前等级</div>
              <div className="text-2xl font-black text-[#F9D8C6]">LV.{userData.level}</div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">累计贡献积分</div>
              <div className="text-2xl font-black text-[#F9D8C6]">{userData.points}</div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#F9D8C6]" />
            </div>
            <div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">已解锁成就</div>
              <div className="text-sm font-black text-white">{userData.unlockedCount} 项核心成就</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-white/20 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">由 乡助桥 官方认证</span>
            </div>
            <div className="text-[8px] font-black uppercase tracking-widest">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="p-8 flex gap-4">
          <button className="flex-1 py-4 rounded-2xl bg-[#2B0B0B] text-white font-black uppercase tracking-widest hover:bg-black transition-all text-xs flex items-center justify-center gap-2 group">
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> 保存图片
          </button>
          <button className="flex-1 py-4 rounded-2xl bg-[#F9D8C6] text-[#2B0B0B] font-black uppercase tracking-widest hover:scale-105 transition-all text-xs flex items-center justify-center gap-2 group">
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> 立即分享
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareCard;
