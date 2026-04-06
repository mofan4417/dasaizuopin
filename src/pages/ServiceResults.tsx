import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  MapPinned,
  Quote,
  Sparkles,
  TimerReset,
  Users,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import { api } from '../api';
import { useGameStore } from '../store/useGameStore';

type ServiceCase = {
  title: string;
  type: string;
  before: string;
  after: string;
  image: string;
};

type Testimonial = {
  name: string;
  major: string;
  content: string;
};

type SiteContent = {
  hero_image?: string;
  hero_images?: string[];
  service_cases?: string;
  volunteer_testimonials?: string;
  home_photos?: string;
};

const resultStats = [
  { label: '持续陪伴计划', value: '156', hint: '覆盖儿童与老人双线服务', icon: Heart },
  { label: '深度服务时长', value: '2,340h', hint: '每一次连接都可被追踪', icon: TimerReset },
  { label: '联动村落', value: '12', hint: '服务网络已形成片区联动', icon: MapPinned },
  { label: '参与志愿者', value: '480+', hint: '稳定活跃的青年陪伴力量', icon: Users },
];

const defaultCases: ServiceCase[] = [
  {
    title: '从安静到发光，小宇重新愿意开口说话',
    type: '儿童陪伴',
    before: '长期独处让他在课堂上逐渐沉默，作业拖延、社交退缩，和外界的连接变得越来越弱。',
    after: '连续 10 周的课后陪伴后，他重新愿意表达自己，也开始主动分享学校里的小事。',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: '一通视频通话，让奶奶重新和家人站在同一个餐桌前',
    type: '老人关怀',
    before: '不会使用智能手机，平时只能等孩子偶尔来电，更多时候是漫长的等待和沉默。',
    after: '在志愿者耐心教学后，她开始主动视频通话，也重新找回了“被看见”的日常感受。',
    image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: '阅读角亮灯后，村里的夜晚不再只是写完作业就睡',
    type: '成长支持',
    before: '放学后的时间大多被空耗，孩子们缺少稳定的阅读空间，也缺少能一起学习的人。',
    after: '陪伴式阅读角建成后，孩子们开始留下来共读、讨论、做手工，村里的夜晚有了新的温度。',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop',
  },
];

const defaultTestimonials: Testimonial[] = [
  {
    name: '张同学',
    major: '教育学专业',
    content: '真正打动我的不是数字，而是一个孩子开始主动说“我今天想继续来”。',
  },
  {
    name: '李同学',
    major: '社会工作专业',
    content: '服务成果不只是帮到了别人，也让我第一次真实感受到设计和行动是可以连在一起的。',
  },
  {
    name: '周同学',
    major: '视觉传达专业',
    content: '我以前总觉得公益离我很远，后来发现一张海报、一次陪伴、一次记录，都能成为改变的一部分。',
  },
];

const defaultPhotos = [
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513467655676-561b7d489a88?q=80&w=2070&auto=format&fit=crop',
];

const methodSteps = [
  ['01', '看见需求', '从碎片化个案中梳理真正紧迫的问题，让设计先回应“谁最需要帮助”。'],
  ['02', '建立陪伴', '把服务从一次性活动变成连续性的关系，让温暖有持续的长度。'],
  ['03', '记录变化', '用故事、影像和路径回看，把抽象的公益转译为可以被感受的成果。'],
] as const;

const impactSignals = [
  { label: '连续陪伴周期', value: '10 周+', note: '从单次到持续关系' },
  { label: '回访记录留存', value: '86%', note: '可追踪、可复盘' },
] as const;

const pageShell =
  'relative rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] backdrop-blur-[24px] shadow-[0_22px_60px_rgba(0,0,0,0.24)]';

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed || fallback;
  } catch {
    return fallback;
  }
}

export default function ServiceResults() {
  const { addPoints, unlockAchievement, completeMission } = useGameStore();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [cases, setCases] = useState<ServiceCase[]>(defaultCases);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [photos, setPhotos] = useState<string[]>(defaultPhotos);
  const [currentPage, setCurrentPage] = useState(0);

  useLayoutEffect(() => {
    const resetPageState = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    resetPageState();
    requestAnimationFrame(() => {
      resetPageState();
      requestAnimationFrame(resetPageState);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setCurrentPage((prev) => Math.min(prev + 1, 2));
      if (event.key === 'ArrowLeft') setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    addPoints(15);
    unlockAchievement('reader');
    completeMission('read_results');
  }, [addPoints, completeMission, unlockAchievement]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        await api.getStats().catch(() => null);
        const contentData = (await api.getSiteContent().catch(() => ({}))) as SiteContent;
        setContent(contentData);

        const parsedCases = parseJson<ServiceCase[]>(contentData?.service_cases, defaultCases)
          .filter((item) => item && item.title && item.image)
          .slice(0, 3);
        if (parsedCases.length) setCases(parsedCases);

        const parsedTestimonials = parseJson<Testimonial[]>(contentData?.volunteer_testimonials, defaultTestimonials)
          .filter((item) => item && item.name && item.content)
          .slice(0, 3);
        if (parsedTestimonials.length) setTestimonials(parsedTestimonials);

        const parsedPhotos = parseJson<string[]>(contentData?.home_photos, defaultPhotos).filter(Boolean).slice(0, 4);
        if (parsedPhotos.length) setPhotos(parsedPhotos);
      } catch (error) {
        console.error('Failed to fetch service results content', error);
      }
    };

    void fetchContent();
  }, []);

  const heroImage = useMemo(() => {
    const direct = typeof content?.hero_image === 'string' ? content.hero_image.trim() : '';
    if (direct) return direct;
    if (Array.isArray(content?.hero_images) && content?.hero_images.length > 0) {
      return content.hero_images[0]?.trim() || defaultCases[0].image;
    }
    return cases[0]?.image || defaultCases[0].image;
  }, [cases, content]);

  return (
    <div className="h-screen overflow-hidden bg-[#120505] text-white">
      <Navbar />

      <div className="relative z-10 mx-auto h-full w-full max-w-[1920px] px-8 pb-7 pt-[118px] xl:px-12">
        <div
          className="mx-auto w-full"
          style={{ maxWidth: 'min(1720px, calc((100vh - 168px) * 1.7778))' }}
        >
          <div
            className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,6,6,0.84),rgba(10,4,4,0.94))] shadow-[0_40px_120px_rgba(0,0,0,0.36)]"
            style={{ height: 'min(1080px, calc(100vh - 168px))' }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(212,175,55,0.08),transparent_28%),radial-gradient(circle_at_76%_30%,rgba(139,0,0,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_22%)]" />

            <div className="relative z-10 flex h-[72px] items-center justify-between px-6 xl:px-8">
              <div className="flex items-center gap-3">
                {[0, 1, 2].map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentPage === page ? 'w-16 bg-[#D4AF37]' : 'w-8 bg-white/16 hover:bg-white/28'
                    }`}
                    aria-label={`前往第 ${page + 1} 页`}
                  />
                ))}
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/55">
                {String(currentPage + 1).padStart(2, '0')} / 03
              </div>
            </div>

            <div className="relative z-10 h-[calc(100%-72px)] overflow-hidden px-4 pb-4 xl:px-5 xl:pb-5">
              <motion.div
                className="flex h-full"
                animate={{ x: `${-currentPage * 100}%` }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <section className="h-full w-full min-w-full flex-none overflow-hidden p-3 xl:p-4">
                  <div className="grid h-full min-h-0 gap-5 xl:grid-cols-[1.14fr_0.86fr]">
                    <div
                      className={`${pageShell} relative overflow-hidden p-6 xl:p-7`}
                      style={{
                        backgroundImage: `linear-gradient(90deg, rgba(10,5,5,0.86) 0%, rgba(10,5,5,0.58) 46%, rgba(10,5,5,0.82) 100%), url(${heroImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(212,175,55,0.16),transparent_24%),linear-gradient(180deg,rgba(18,5,5,0.16),rgba(18,5,5,0.74))]" />
                      <div className="relative z-10 flex h-full flex-col justify-between">
                        <div className="max-w-[620px]">
                          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#F0D27B]">
                            <Sparkles className="h-4 w-4" />
                            服务成果
                          </div>
                          <h1 className="mt-6 text-[clamp(2.7rem,4.7vw,5.8rem)] font-black leading-[0.95] tracking-tight text-white">
                            把陪伴
                            <span className="block text-[#F0D27B]">做成看得见的结果</span>
                          </h1>
                          <p className="mt-6 max-w-[560px] text-base leading-8 text-white/72 xl:text-lg">
                            这一页用更具叙事感的大屏排版，展示乡助桥如何把连接、陪伴与改变，沉淀成可被感知的服务成果。
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-[28px]">
                            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/38">年度印象</div>
                            <div className="mt-3 text-[2.6rem] font-black text-white">12+</div>
                            <div className="mt-2 text-sm leading-5 text-white/62">形成稳定陪伴网络的重点村落，正在从点状援助转向片区联动。</div>
                          </div>

                          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(139,0,0,0.28),rgba(255,255,255,0.04))] p-4 backdrop-blur-[28px]">
                            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/38">体验关键词</div>
                            <div className="mt-3 text-[1.45rem] font-black text-[#F5D98F]">陪伴 / 回应 / 生长</div>
                            <div className="mt-2 text-sm leading-5 text-white/64">让服务成果不仅能被记录，更能在视觉与情绪上被记住。</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid h-full min-h-0 gap-5 xl:grid-rows-[0.56fr_0.44fr]">
                      <div className={`${pageShell} min-h-0 overflow-hidden p-5 xl:p-5`}>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">成果总览</div>
                        <div className="panel-scrollbar panel-scroll-fade mt-3 grid max-h-[300px] gap-2.5 overflow-y-auto pr-1">
                          {resultStats.map((item) => {
                            const Icon = item.icon;
                            return (
                              <div key={item.label} className="rounded-[20px] border border-white/8 bg-white/[0.03] p-3.5">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#D4AF37]">
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">{item.label}</div>
                                    <div className="mt-1 text-[1.45rem] font-black text-white">{item.value}</div>
                                    <div className="text-xs leading-5 text-white/52">{item.hint}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`${pageShell} min-h-0 overflow-hidden p-5 xl:p-5`}>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">成果方法</div>
                        <div className="panel-scrollbar panel-scroll-fade mt-3 max-h-[240px] space-y-2.5 overflow-y-auto pr-1">
                          {methodSteps.map(([num, title, desc]) => (
                            <div key={num} className="grid grid-cols-[34px_1fr] gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] p-3">
                              <div className="text-[1.1rem] font-black text-[#D4AF37]">{num}</div>
                              <div>
                                <div className="text-[15px] font-black text-white">{title}</div>
                                <div className="mt-1 text-sm leading-5 text-white/60">{desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="h-full w-full min-w-full flex-none overflow-hidden p-3 xl:p-4">
                  <div className="grid h-full min-h-0 gap-5 xl:grid-cols-[1.02fr_1.02fr_0.96fr]">
                    {cases.slice(0, 2).map((item, index) => (
                      <article
                        key={`${item.title}-${index}`}
                        className={`${pageShell} flex min-h-0 flex-col overflow-hidden p-4 xl:p-5`}
                      >
                        <div className="overflow-hidden rounded-[24px]">
                          <img src={item.image} alt={item.title} className="h-[180px] w-full object-cover xl:h-[210px]" />
                        </div>

                        <div className="mt-4 flex min-h-0 flex-1 flex-col justify-between gap-4">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#F4DFA2]">
                              {item.type}
                            </div>
                            <h2 className="mt-3 text-[1.45rem] font-black leading-tight text-white xl:text-[1.65rem]">{item.title}</h2>
                          </div>

                          <div className="grid gap-3">
                            <div className="rounded-[20px] border border-white/10 bg-black/12 p-3.5">
                              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">服务前</div>
                              <div className="mt-2 text-sm leading-6 text-white/62">{item.before}</div>
                            </div>
                            <div className="rounded-[20px] border border-[#D4AF37]/12 bg-[linear-gradient(180deg,rgba(139,0,0,0.18),rgba(255,255,255,0.03))] p-3.5">
                              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">服务后</div>
                              <div className="mt-2 text-sm leading-6 text-[#F3DE9F]/92">{item.after}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm font-bold text-white/72">
                            <span>继续查看下一段成果故事</span>
                            <ArrowUpRight className="h-4 w-4 text-[#D4AF37]" />
                          </div>
                        </div>
                      </article>
                    ))}

                    <div className="grid h-full min-h-0 gap-4 xl:grid-rows-[0.58fr_0.42fr]">
                      <article className={`${pageShell} flex min-h-0 flex-col overflow-hidden p-4 xl:p-4.5`}>
                        <div className="overflow-hidden rounded-[24px]">
                          <img src={cases[2]?.image || defaultCases[2].image} alt={cases[2]?.title || defaultCases[2].title} className="h-[145px] w-full object-cover xl:h-[165px]" />
                        </div>

                        <div className="mt-3 flex min-h-0 flex-1 flex-col justify-between gap-3">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#F4DFA2]">
                              {cases[2]?.type || defaultCases[2].type}
                            </div>
                            <h2 className="mt-2.5 text-[1.2rem] font-black leading-tight text-white xl:text-[1.35rem]">
                              {cases[2]?.title || defaultCases[2].title}
                            </h2>
                          </div>

                          <div className="rounded-[20px] border border-[#D4AF37]/12 bg-[linear-gradient(180deg,rgba(139,0,0,0.18),rgba(255,255,255,0.03))] p-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">关键变化</div>
                            <div className="mt-1.5 text-sm leading-5 text-[#F3DE9F]/92">
                              {cases[2]?.after || defaultCases[2].after}
                            </div>
                          </div>
                        </div>
                      </article>

                      <div className={`${pageShell} min-h-0 overflow-hidden p-4 xl:p-5`}>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">成果信号</div>
                        <div className="mt-3 grid max-h-[220px] gap-2.5 overflow-y-auto pr-1 xl:max-h-[250px]">
                          {impactSignals.map((item) => (
                            <div key={item.label} className="rounded-[18px] border border-white/8 bg-white/[0.03] p-3">
                              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{item.label}</div>
                              <div className="mt-1.5 text-[1.28rem] font-black text-[#F0D27B] xl:text-[1.4rem]">{item.value}</div>
                              <div className="mt-1 text-[11px] leading-4 text-white/56">{item.note}</div>
                            </div>
                          ))}
                          <div className="rounded-[18px] border border-[#D4AF37]/12 bg-[linear-gradient(135deg,rgba(139,0,0,0.18),rgba(255,255,255,0.03))] p-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">阶段判断</div>
                            <div className="mt-1.5 text-sm leading-5 text-white/68">
                              当前成果更偏向“稳定连接已经建立”，下一阶段重点是把更多个案沉淀成可复用的方法。
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="h-full w-full min-w-full flex-none overflow-hidden p-3 xl:p-4">
                  <div className="grid h-full min-h-0 gap-5 xl:grid-cols-[1.06fr_0.94fr]">
                    <div className={`${pageShell} min-h-0 overflow-hidden p-5 xl:p-5`}>
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">服务影像</div>
                      <div className="mt-3 grid h-[calc(100%-26px)] grid-cols-2 gap-3">
                        <div className="col-span-2 overflow-hidden rounded-[28px]">
                          <img src={photos[0]} alt="服务影像 1" className="h-full max-h-[190px] w-full object-cover xl:max-h-[215px]" />
                        </div>
                        <div className="overflow-hidden rounded-[24px]">
                          <img src={photos[1]} alt="服务影像 2" className="h-[130px] w-full object-cover xl:h-[145px]" />
                        </div>
                        <div className="overflow-hidden rounded-[24px]">
                          <img src={photos[2]} alt="服务影像 3" className="h-[130px] w-full object-cover xl:h-[145px]" />
                        </div>
                        <div className="col-span-2 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(139,0,0,0.22),rgba(255,255,255,0.03))] p-3.5">
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">服务现场</div>
                          <div className="mt-2 max-w-[640px] text-sm leading-6 text-white/74">
                            这些画面对应的是我们真正关心的服务场景：有人陪孩子阅读、辅导作业，也有人走进村落探访老人、建立稳定联系。服务成果的意义，不是停留在数字上，而是让原本孤单的人重新感受到回应、陪伴和持续被看见。
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid h-full min-h-0 gap-4 xl:grid-rows-[0.64fr_0.36fr]">
                      <div className={`${pageShell} min-h-0 overflow-hidden p-5 xl:p-5`}>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">志愿者感言</div>
                        <div className="panel-scrollbar panel-scroll-fade mt-3 grid max-h-[360px] gap-3 overflow-y-auto pr-1">
                          {testimonials.map((item, index) => (
                            <div key={`${item.name}-${index}`} className="rounded-[20px] border border-white/10 bg-black/12 p-3.5">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="text-base font-black text-white">{item.name}</div>
                                  <div className="mt-1 text-xs text-white/45">{item.major}</div>
                                </div>
                                <Quote className="h-7 w-7 text-[#D4AF37]/35" />
                              </div>
                              <div className="mt-2.5 text-sm leading-6 text-white/76">“{item.content}”</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`${pageShell} flex min-h-0 flex-col justify-between p-5 xl:p-5`}>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">成果结论</div>
                          <h3 className="mt-3 text-[1.45rem] font-black leading-tight text-white xl:text-[1.6rem]">
                            把一次次连接
                            <span className="block text-[#F0D27B]">沉淀成可信的长期改变</span>
                          </h3>
                        </div>
                        <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-3.5 text-sm leading-5 text-white/62">
                          服务成果不是“做了多少”，而是“关系是否持续”“变化是否真实发生”“是否值得被更多人继续投入”。
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-3 z-20 flex items-center">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#1a0707]/80 text-white backdrop-blur-xl transition hover:border-[#D4AF37]/40 hover:text-[#F2D98B] disabled:opacity-35"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="pointer-events-none absolute inset-y-0 right-3 z-20 flex items-center">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, 2))}
                disabled={currentPage === 2}
                className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#1a0707]/80 text-white backdrop-blur-xl transition hover:border-[#D4AF37]/40 hover:text-[#F2D98B] disabled:opacity-35"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
