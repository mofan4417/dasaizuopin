import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Users, Zap } from 'lucide-react';

interface FeedItem {
  id: string;
  name: string;
  action: string;
  time: string;
  avatar: string;
}

const ActivityWall = () => {
  const [activities, setActivities] = useState<FeedItem[]>([
    { id: '1', name: '李明', action: '成功认领了留守儿童 S001', time: '2分钟前', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: '2', name: '张华', action: '完成了今日调研任务', time: '5分钟前', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria' },
    { id: '3', name: '王芳', action: '分享了志愿服务心得', time: '10分钟前', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
  ]);

  // In a real app, use supabase realtime subscription here
  /*
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'volunteer_activities' }, payload => {
        setActivities(prev => [payload.new as FeedItem, ...prev.slice(0, 4)]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); }
  }, []);
  */

  return (
    <div className="bg-[#2B0B0B]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E84C4C]/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-[#E84C4C]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-[#F9D8C6]">实时协作动态</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">128 位志愿者在线</span>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {activities.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full border border-white/10 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-bold text-[#F9D8C6]">{item.name}</span>
                  <span className="text-white/60 ml-2">{item.action}</span>
                </div>
                <div className="text-[10px] text-white/20 mt-1 uppercase font-bold">{item.time}</div>
              </div>
              <motion.div 
                whileHover={{ scale: 1.2 }}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Zap className="w-4 h-4 text-[#F9D8C6]" />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button className="w-full mt-8 py-4 border border-white/5 bg-white/5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#F9D8C6] hover:text-[#2B0B0B] transition-all flex items-center justify-center gap-2 group">
        <MessageSquare className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        发布我的动态
      </button>
    </div>
  );
};

export default ActivityWall;
