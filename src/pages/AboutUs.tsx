import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, GraduationCap, Heart, ShieldCheck, User } from 'lucide-react';
import { api } from '../api';
import CoverHero from '../components/visual/CoverHero';

const AboutUs = () => {
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

  const defaultTeam = [
    {
      name: '刘佳阳',
      role: '项目负责人 / 技术负责人',
      desc: '宜宾学院人工智能大一学生，负责平台整体规划、系统开发与技术架构。',
      image: ''
    },
    {
      name: '黄友鑫',
      role: '运营负责人',
      desc: '宜宾学院人工智能大一学生，富有爱心，负责志愿者招募与社区运营。',
      image: ''
    },
    {
      name: '许涧',
      role: '指导老师',
      desc: '宜宾学院人工智能与大数据学部创新创业教研室主任，提供专业指导。',
      image: ''
    }
  ];

  const team = parseJson(content?.team_members) || defaultTeam;
  const coverSrc = (() => {
    const direct = typeof content?.hero_image === 'string' ? content.hero_image.trim() : '';
    if (direct) return direct;
    const list = content?.hero_images;
    if (Array.isArray(list) && list.length > 0 && typeof list[0] === 'string') return list[0].trim();
    return 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1920&auto=format&fit=crop';
  })();

  return (
    <div className="min-h-screen bg-transparent text-white font-sans">
      <Navbar />
      
      <CoverHero
        src={coverSrc}
        alt="封面图"
        eyebrow="关于我们"
        title={content?.team_intro_title || "关于我们"}
        subtitle={content?.team_intro_subtitle || "来自宜宾学院的青年力量，用技术温暖乡村"}
      />
      
      <div className="pb-32 px-4 md:px-24 max-w-7xl mx-auto -mt-20 relative z-10">

        {/* Team Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {team.map((member: any, index: number) => (
            <div key={index} className="bg-white/5 backdrop-blur-[40px] rounded-[40px] p-12 text-center space-y-6 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 group shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform overflow-hidden">
                {member.image ? (
                  <img src={member.image} alt={member.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[#D4AF37]">
                    {member.role.includes('老师') ? <ShieldCheck className="w-10 h-10" /> : <User className="w-10 h-10" />}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{member.name}</h3>
                <p className="text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.2em]">{member.role}</p>
              </div>
              <p className="text-lg text-white/50 leading-relaxed">
                {member.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-white/5 backdrop-blur-[40px] text-white rounded-[48px] p-12 md:p-20 shadow-[0_32px_64px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B0000]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-4xl font-bold leading-tight">联系我们，<br />开启一段温暖的旅程</h3>
              <p className="text-xl text-white/50 font-medium">
                无论您是想加入我们成为志愿者，还是有需要帮助的信息，欢迎通过以下方式与我们取得联系。
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#8B0000]/20 group-hover:border-white/20 transition-all">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">电子邮箱</p>
                  <p className="text-xl font-bold">2339832360@qq.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#8B0000]/20 group-hover:border-white/20 transition-all">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">联系电话</p>
                  <p className="text-xl font-bold">15228883259</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#8B0000]/20 group-hover:border-white/20 transition-all">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-1">联系地址</p>
                  <p className="text-xl font-bold">宜宾学院临港校区</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
