import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, BookOpen, Globe, Smartphone, Phone, Activity, Search, Link as LinkIcon, ClipboardCheck, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../api';
import CoverHero from '../components/visual/CoverHero';

const WhatWeDo = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.getSiteContent();
        setContent(data);
      } catch (err) {
        console.error('Failed to fetch content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const parseJson = (raw: any) => {
    if (typeof raw !== 'string' || !raw.trim()) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const defaultCards = [
    {
      title: '对留守儿童的服务',
      icon: <Heart className="w-8 h-8 text-[#D4AF37]" />,
      items: [
        { label: '情感陪伴', desc: '每周至少一次视频聊天，倾听孩子的心声，给予情感支持', icon: <Phone className="w-5 h-5" /> },
        { label: '学业辅导', desc: '针对数学、英语等薄弱学科进行远程辅导，激发学习兴趣', icon: <BookOpen className="w-5 h-5" /> },
        { label: '视野拓展', desc: '分享大学生活与城市见闻，带孩子看更广阔的世界', icon: <Globe className="w-5 h-5" /> }
      ]
    },
    {
      title: '对留守老人的服务',
      icon: <Activity className="w-8 h-8 text-[#8B0000]" />,
      items: [
        { label: '数字助老', desc: '教老人使用微信、医保查询等数字工具，跨越数字鸿沟', icon: <Smartphone className="w-5 h-5" /> },
        { label: '生活关怀', desc: '定期电话问候，了解生活困难，协助联系当地村委会解决', icon: <Heart className="w-5 h-5" /> },
        { label: '健康提醒', desc: '提醒按时服药、监测血压，科普基础健康常识', icon: <Activity className="w-5 h-5" /> }
      ]
    }
  ];

  const cards = parseJson(content?.what_we_do_cards) || defaultCards;
  const bgImage = content?.what_we_do_bg_image || content?.hero_image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1920&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <CoverHero
        src={bgImage}
        alt="封面图"
        eyebrow="我们的使命"
        title={content?.what_we_do_title || "用青春陪伴温暖乡村"}
        subtitle={content?.what_we_do_subtitle || "通过“线下调研+线上匹配+志愿者陪伴”的模式，为乡村留守群体提供精准、持续的情感支持与生活帮助。"}
      />

      <div className="pb-32 px-4 md:px-24 max-w-7xl mx-auto -mt-20 relative z-20">
        {/* Core Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {cards.map((card: any, idx: number) => (
            <div key={idx} className="bg-white/5 backdrop-blur-[40px] rounded-[40px] p-10 md:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 hover:border-white/20 hover:bg-white/10 hover:scale-[1.01] transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors">
                  {card.icon || <Heart className="w-8 h-8 text-[#D4AF37]" />}
                </div>
                <h3 className="text-3xl font-black text-white">{card.title}</h3>
              </div>
              <div className="space-y-8">
                {card.items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-5">
                    <div className="mt-1 p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-[#D4AF37] group-hover:bg-white/10 transition-all border border-white/10">
                      {item.icon || <Sparkles className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{item.label}</h4>
                      <p className="text-white/50 leading-relaxed text-lg">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <div className="bg-white/5 backdrop-blur-[40px] rounded-[48px] p-12 md:p-20 text-white overflow-hidden relative mb-20 border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B0000]/15 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-black mb-16 text-center">标准化的服务流程</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { label: '调研建档', icon: <Search />, desc: '实地走访，深入了解真实需求' },
                { label: '线上匹配', icon: <LinkIcon />, desc: '根据特长，精准连接志愿者' },
                { label: '志愿者服务', icon: <Heart />, desc: '定期陪伴，建立深度情感纽带' },
                { label: '记录反馈', icon: <ClipboardCheck />, desc: '每回必录，形成可追溯成长档案' },
                { label: '持续优化', icon: <Sparkles />, desc: '数据驱动，不断迭代服务模式' }
              ].map((step, i) => (
                <div key={i} className="text-center space-y-4 relative">
                  {i < 4 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-white/10"></div>
                  )}
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 hover:bg-[#8B0000]/20 transition-all hover:scale-110 border border-white/10">
                    {step.icon}
                  </div>
                  <h4 className="text-xl font-bold">{step.label}</h4>
                  <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing Quote */}
        <div className="text-center max-w-4xl mx-auto space-y-12">
          <div className="inline-block px-8 py-3 bg-white/5 border border-white/10 text-[#D4AF37] rounded-full font-black text-sm uppercase tracking-[0.2em]">
            O2O 公益闭环
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            “乡助桥”不仅仅是一个网站，更是一份承诺——用大学生的青春热情，回应乡村留守群体的真实需求。
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <Link to="/service-objects" className="bg-gradient-to-r from-[#8B0000] to-[#722F37] text-white hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] font-black px-12 py-5 rounded-2xl transition-all inline-flex items-center gap-4 text-xl border border-white/10">
              认领服务对象 <ArrowRight className="w-6 h-6" />
            </Link>
            <Link to="/join-us" className="bg-white/5 text-white hover:bg-white/10 border border-white/10 font-black px-12 py-5 rounded-2xl transition-all inline-flex items-center gap-4 text-xl">
              成为志愿者
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WhatWeDo;
