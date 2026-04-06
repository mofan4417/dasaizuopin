import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Phone,
  School,
  Send,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { useGameStore } from '../store/useGameStore';

const requirementCards = [
  {
    icon: Heart,
    title: '有爱心、有耐心',
    desc: '愿意稳定倾听与陪伴，能真诚回应服务对象的情绪和需要。',
  },
  {
    icon: Clock,
    title: '稳定的服务时间',
    desc: '每周至少抽出 1 小时，保持持续性的线上或线下参与。',
  },
];

const JoinUs = () => {
  const { addPoints, unlockAchievement } = useGameStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteContent, setSiteContent] = useState<any>({});
  const [formData, setFormData] = useState({
    name: '',
    college_major: '',
    phone: '',
    available_time: '周末',
    object_code: '',
    reason: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const objectCode = params.get('object');
    if (objectCode) {
      setFormData((prev) => ({ ...prev, object_code: objectCode }));
    }
  }, [location]);

  useEffect(() => {
    api.getSiteContent().then(setSiteContent).catch(() => setSiteContent({}));
  }, []);

  const coverSrc = (() => {
    const direct = typeof siteContent?.hero_image === 'string' ? siteContent.hero_image.trim() : '';
    if (direct) return direct;
    const list = siteContent?.hero_images;
    if (Array.isArray(list) && list.length > 0 && typeof list[0] === 'string') return list[0].trim();
    return 'https://images.unsplash.com/photo-1508847154043-be13a0a245d2?q=80&w=1920&auto=format&fit=crop';
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('volunteer_applications').insert([
        {
          name: formData.name,
          college_major: formData.college_major,
          phone: formData.phone,
          available_time: formData.available_time,
          object_code: formData.object_code,
          reason: formData.reason,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      addPoints(100);
      unlockAchievement('helper');
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Failed to submit application:', err);
      alert('提交失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090404] px-4 text-white">
        <div className="w-full max-w-[560px] rounded-[40px] border border-white/10 bg-white/5 p-12 text-center shadow-2xl backdrop-blur-md">
          <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-[#D4AF37]/15 text-[#D4AF37]">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <h2 className="mb-6 text-4xl font-black">报名提交成功</h2>
          <p className="mb-12 text-lg leading-relaxed text-white/55">
            我们已经收到你的报名信息。接下来会根据你填写的方向与可服务时间，尽快与你联系。
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-[#8B0000] to-[#722F37] py-5 text-lg font-black text-white transition-all hover:shadow-[0_0_30px_rgba(139,0,0,0.5)]"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#090404] text-white selection:bg-[#8B0000] selection:text-white">
      <Navbar />

      <div className="absolute inset-0 pointer-events-none">
        <img src={coverSrc} alt="报名背景" className="h-full w-full object-cover opacity-18" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,5,5,0.88)_0%,rgba(10,5,5,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_28%,rgba(212,175,55,0.12),transparent_22%),radial-gradient(circle_at_72%_24%,rgba(139,0,0,0.24),transparent_28%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(185,28,28,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <main className="relative z-10 h-screen px-6 pb-6 pt-28 lg:px-8">
        <div className="mx-auto flex h-full max-w-[1920px] items-center">
          <div className="grid h-[calc(100vh-150px)] min-h-[820px] w-full grid-cols-[1.08fr_0.92fr] gap-8 rounded-[34px] border border-white/8 bg-[rgba(18,7,7,0.62)] p-8 shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <section className="relative flex min-h-0 flex-col justify-between overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(35,12,12,0.5),rgba(14,7,7,0.16))] px-10 py-10">
              <div className="pointer-events-none absolute inset-x-0 top-10 z-20 grid grid-cols-2 gap-5">
                {requirementCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-7 backdrop-blur-[22px]"
                    >
                      <div className="flex items-start gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#D4AF37]/16 bg-[#D4AF37]/8">
                          <Icon className="h-8 w-8 text-[#D4AF37]" />
                        </div>
                        <div className="pt-1">
                          <div className="text-3xl font-black text-white">{card.title}</div>
                          <p className="mt-3 max-w-[360px] text-base leading-7 text-white/45">{card.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="relative flex h-full flex-col justify-center pt-44">
                <div className="mb-5 inline-flex w-fit items-center gap-3 rounded-full border border-[#D4AF37]/18 bg-[#D4AF37]/8 px-6 py-3 text-[11px] font-black uppercase tracking-[0.3em] text-[#F6D365]">
                  <span className="h-2 w-2 rounded-full bg-[#F6D365]" />
                  加入我们
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[160px] font-black leading-none text-white/[0.05]">
                    JOIN
                  </div>
                  <h1 className="relative z-10 max-w-[720px] text-[82px] font-black leading-[0.95] tracking-tight text-white">
                    加入我们
                  </h1>
                </div>

                <p className="mt-6 max-w-[620px] text-xl leading-9 text-white/52">
                  成为志愿者，为乡村留守老人和儿童带去稳定陪伴。页面只保留最重要的要求与报名入口，让第一眼就能理解如何加入。
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-white/42">
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">稳定服务时间</div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">真诚陪伴</div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3">线上 / 线下参与</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-black text-white/72 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </button>
            </section>

            <section className="flex min-h-0 flex-col rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(28,10,10,0.92),rgba(18,8,8,0.95))] px-10 py-10 shadow-[0_24px_90px_rgba(0,0,0,0.22)]">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#D4AF37] text-[#0A0505]">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">报名表单</div>
                  <div className="mt-1 text-sm text-white/40">填写基础信息后即可提交报名。</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-6">
                <div className="grid grid-cols-2 gap-5">
                  <Field
                    label="姓名"
                    icon={User}
                    placeholder="您的真实姓名"
                    value={formData.name}
                    onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
                  />
                  <Field
                    label="学院 / 专业"
                    icon={School}
                    placeholder="如：人工智能"
                    value={formData.college_major}
                    onChange={(value) => setFormData((prev) => ({ ...prev, college_major: value }))}
                  />
                </div>

                <Field
                  label="联系电话"
                  icon={Phone}
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                />

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-widest text-white/40">
                      <Clock className="h-3.5 w-3.5" /> 可服务时间
                    </label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-[#0A0505]/60 px-6 py-5 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40"
                      value={formData.available_time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, available_time: e.target.value }))}
                    >
                      <option value="周末" className="bg-[#0A0505]">周末</option>
                      <option value="工作日晚间" className="bg-[#0A0505]">工作日晚间</option>
                      <option value="周一至周五" className="bg-[#0A0505]">周一至周五</option>
                      <option value="全天候" className="bg-[#0A0505]">全天候</option>
                    </select>
                  </div>
                  <Field
                    label="认领对象编号"
                    icon={FileText}
                    placeholder="选填，如 S001"
                    value={formData.object_code}
                    onChange={(value) => setFormData((prev) => ({ ...prev, object_code: value }))}
                  />
                </div>

                <div className="flex min-h-0 flex-1 flex-col space-y-3">
                  <label className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-widest text-white/40">
                    <Heart className="h-3.5 w-3.5" /> 申请初心
                  </label>
                  <textarea
                    rows={6}
                    placeholder="简单描述你为什么想加入乡助桥..."
                    className="min-h-[180px] flex-1 resize-none rounded-2xl border border-white/10 bg-[#0A0505]/60 px-6 py-5 text-sm leading-relaxed text-white transition-all placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40"
                    value={formData.reason}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="mt-2 flex w-full items-center justify-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#8B0000] to-[#722F37] py-6 text-lg font-black text-white transition-all hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? '正在提交...' : '确认提交报名'}
                  <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const Field = ({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  icon: typeof User;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-3">
    <label className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-widest text-white/40">
      <Icon className="h-3.5 w-3.5" /> {label}
    </label>
    <input
      required={label !== '认领对象编号'}
      type="text"
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-[#0A0505]/60 px-6 py-5 text-sm text-white transition-all placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default JoinUs;
