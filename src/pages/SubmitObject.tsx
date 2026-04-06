import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Heart, MapPin, Phone, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../api';
import CoverHero from '../components/visual/CoverHero';

const SubmitObject = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteContent, setSiteContent] = useState<any>({});
  const [formData, setFormData] = useState({
    type: 'child' as 'child' | 'elderly',
    age: 10,
    village: '',
    situation: '',
    needs: '',
    contact_name: '',
    contact_phone: ''
  });

  useEffect(() => {
    api.getSiteContent().then(setSiteContent).catch(() => setSiteContent({}));
  }, []);

  const coverSrc = (() => {
    const direct = typeof siteContent?.hero_image === 'string' ? siteContent.hero_image.trim() : '';
    if (direct) return direct;
    const list = siteContent?.hero_images;
    if (Array.isArray(list) && list.length > 0 && typeof list[0] === 'string') return list[0].trim();
    return 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1920&auto=format&fit=crop';
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitObjectRequest({
        type: formData.type,
        age: formData.age,
        village: formData.village,
        situation: formData.situation,
        needs: formData.needs,
        contact_name: formData.contact_name || null,
        contact_phone: formData.contact_phone || null,
      });
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Failed to submit object request:', err);
      alert('提交失败，请检查网络连接后重试');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4 font-sans text-white">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[40px] p-12 text-center shadow-2xl backdrop-blur-md">
          <div className="w-24 h-24 bg-[#D4AF37]/15 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-black/20 border border-white/10">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <h2 className="text-4xl font-bold mb-6">提交成功！</h2>
          <p className="text-white/50 mb-12 leading-relaxed text-lg">
            感谢您提供信息，我们会在后台进行审核，审核通过后将展示到“服务对象”列表。
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/service-objects')}
              className="w-full bg-gradient-to-r from-[#8B0000] to-[#722F37] hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-black/20 text-lg border border-white/10"
            >
              返回服务对象
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white/10 hover:bg-white/20 text-[#F3DDE4] font-bold py-5 rounded-2xl transition-all border border-white/20 text-lg"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-[#8B0000] selection:text-white">
      <Navbar />

      <CoverHero
        src={coverSrc}
        alt="封面图"
        eyebrow="信息提交"
        title="添加需要帮助的人"
        subtitle="如果您是乡政府工作人员或家属，欢迎提交留守儿童/老人信息。所有信息仅用于审核与匹配服务，展示时会做匿名化处理。"
      />

      <div className="pb-32 px-4 md:px-24 -mt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold opacity-40 uppercase tracking-widest px-1">对象类型</label>
                  <select
                    className="w-full bg-[#0A0505]/60 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 transition-all appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="child" className="bg-[#0A0505]">留守儿童</option>
                    <option value="elderly" className="bg-[#0A0505]">留守老人</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold opacity-40 uppercase tracking-widest px-1">年龄</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={149}
                    className="w-full bg-[#0A0505]/60 border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 transition-all"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value || '0', 10) })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold opacity-40 uppercase tracking-widest flex items-center gap-2 px-1">
                  <MapPin className="w-3.5 h-3.5" /> 所在村庄
                </label>
                <input
                  required
                  type="text"
                  placeholder="如：XX镇XX村"
                  className="w-full bg-[#0A0505]/60 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 transition-all"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold opacity-40 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Heart className="w-3.5 h-3.5" /> 基本情况
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="如：父母常年外出务工，由爷爷奶奶照顾..."
                  className="w-full bg-[#0A0505]/60 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 transition-all resize-none"
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold opacity-40 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Heart className="w-3.5 h-3.5" /> 主要需求
                </label>
                <input
                  required
                  type="text"
                  placeholder="如：情感陪伴、学业辅导、数字助老..."
                  className="w-full bg-[#0A0505]/60 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 transition-all"
                  value={formData.needs}
                  onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold opacity-40 uppercase tracking-widest flex items-center gap-2 px-1">
                    <User className="w-3.5 h-3.5" /> 联系人（选填）
                  </label>
                  <input
                    type="text"
                    placeholder="如：家属/村干部姓名"
                    className="w-full bg-[#0A0505]/60 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 transition-all"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold opacity-40 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Phone className="w-3.5 h-3.5" /> 联系电话（选填）
                  </label>
                  <input
                    type="tel"
                    placeholder="用于审核沟通，不公开展示"
                    className="w-full bg-[#0A0505]/60 border border-white/10 rounded-2xl py-5 px-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40 transition-all"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-gradient-to-r from-[#8B0000] to-[#722F37] hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-black/20 text-lg disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
              >
                {loading ? '正在提交...' : '提交审核'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SubmitObject;

