import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, CheckCircle2, ChevronRight, Heart, X } from 'lucide-react';
import { api } from '../../api';

interface RecommenderProps {
  onClose: () => void;
}

const Recommender = ({ onClose }: RecommenderProps) => {
  const [step, setStep] = useState(1);
  const [preference, setPreference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const steps = [
    {
      id: 1,
      title: '你想帮助谁？',
      options: [
        { id: 'children', label: '留守儿童', icon: '🎒', desc: '陪伴学习与成长' },
        { id: 'elders', label: '留守老人', icon: '👴', desc: '生活关怀与数字助老' },
      ]
    },
    {
      id: 2,
      title: '你擅长什么？',
      options: [
        { id: 'edu', label: '学业辅导', icon: '📚', desc: '语数外等学科帮助' },
        { id: 'tech', label: '数字技术', icon: '📱', desc: '教用手机、电脑' },
        { id: 'art', label: '兴趣拓展', icon: '🎨', desc: '绘画、音乐、摄影' },
        { id: 'talk', label: '情感沟通', icon: '💬', desc: '倾听与心理关怀' },
      ]
    }
  ];

  const handleRecommend = async () => {
    setLoading(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      const objects = await api.getObjects();
      // Filter based on preference
      const filtered = objects.filter((o: any) => 
        preference === 'children' ? o.type === '留守儿童' : o.type === '留守老人'
      );
      // Pick a random one from filtered
      const picked = filtered[Math.floor(Math.random() * filtered.length)];
      setRecommendation(picked);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="absolute top-0 left-0 w-full h-2 bg-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-gradient-to-r from-[#E84C4C] to-[#F9D8C6]"
          />
        </div>

        <AnimatePresence mode="wait">
          {step < 3 ? (
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F9D8C6]/10 rounded-2xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[#F9D8C6]" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{steps[step-1].title}</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {steps[step-1].options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (step === 1) setPreference(opt.id);
                      if (step === 2) handleRecommend();
                      else setStep(step + 1);
                    }}
                    className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#F9D8C6]/30 hover:bg-white/10 transition-all text-left group"
                  >
                    <span className="text-4xl group-hover:scale-125 transition-transform">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="font-black text-lg text-white group-hover:text-[#F9D8C6] transition-colors">{opt.label}</div>
                      <div className="text-sm text-white/40 font-medium">{opt.desc}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-10 text-center"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-[#F9D8C6]/20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-[#F9D8C6] animate-pulse" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">为您推荐的服务对象</h2>
                <p className="text-white/40 font-medium">根据您的兴趣与能力，AI 为您匹配了：</p>
              </div>

              {recommendation && (
                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 space-y-6 text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E84C4C]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F9D8C6]">编号: {recommendation.id}</span>
                    <span className="px-3 py-1 bg-[#E84C4C]/20 text-[#E84C4C] rounded-full text-[10px] font-black uppercase tracking-widest">{recommendation.type}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="text-2xl font-black text-white">{recommendation.village} · {recommendation.age}岁</div>
                    <p className="text-sm text-white/60 leading-relaxed font-medium line-clamp-2">{recommendation.situation}</p>
                    <div className="flex items-center gap-2 text-[#F9D8C6]">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="text-xs font-black uppercase tracking-widest">核心需求: {recommendation.needs}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl bg-white/5 text-white/60 font-black uppercase tracking-widest hover:bg-white/10 transition-all text-sm">重新匹配</button>
                <button onClick={() => window.location.href = `/join-us?object=${recommendation?.id}`} className="flex-[2] py-5 rounded-2xl bg-[#F9D8C6] text-[#2B0B0B] font-black uppercase tracking-widest hover:scale-105 transition-all text-sm shadow-[0_0_30px_rgba(249,216,198,0.2)]">立即认领</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div className="absolute inset-0 bg-[#2B0B0B]/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-[#F9D8C6] border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#F9D8C6] animate-pulse">正在为您进行 AI 匹配分析...</div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Recommender;
