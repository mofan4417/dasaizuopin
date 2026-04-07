import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  LogOut,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { api } from '../api';

type AdminTab = 'live' | 'volunteers' | 'objects';

type VolunteerItem = {
  id: string;
  name: string;
  school: string;
  focus: string;
  city: string;
  time: string;
  status: string;
};

type ObjectItem = {
  id: string;
  type: string;
  village: string;
  need: string;
  contact: string;
  submittedAt: string;
  level: string;
};

const tabMeta = {
  live: {
    label: '实时在线志愿者',
    title: '实时在线志愿者',
    subtitle: '用动态数字和实时播报呈现当前志愿服务活跃度。',
    icon: Activity,
  },
  volunteers: {
    label: '志愿者审批',
    title: '志愿者审批',
    subtitle: '集中处理新申请志愿者，界面只保留最明确的审批动作。',
    icon: UserCheck,
  },
  objects: {
    label: '老人儿童审批',
    title: '留守老人与儿童审批',
    subtitle: '统一审核待接入对象，优先显示高优先样本。',
    icon: HeartHandshake,
  },
} satisfies Record<AdminTab, { label: string; title: string; subtitle: string; icon: any }>;

const liveSeries = [218, 223, 229, 236, 241, 247, 252, 258];
const provinceSeries = [
  { name: '四川', count: 46, bar: 'from-[#F6D365] to-[#F59E0B]' },
  { name: '云南', count: 38, bar: 'from-[#FB7185] to-[#EF4444]' },
  { name: '贵州', count: 31, bar: 'from-[#FDE68A] to-[#F97316]' },
  { name: '河南', count: 27, bar: 'from-[#FCD34D] to-[#FB7185]' },
];
const liveFeed = [
  '四川·凉山新增 12 名陪伴志愿者进入晚间值守',
  '云南·怒江 8 条老人探访路线完成分发',
  '贵州·毕节 16 名大学生志愿者完成签到',
  '河南·周口 6 份儿童辅导需求已锁定',
];

const volunteerSeed: VolunteerItem[] = [
  { id: 'V-2041', name: '林栀', school: '华南师大 / 心理学', focus: '儿童陪伴、情绪支持', city: '广州', time: '3 分钟前', status: '建议优先' },
  { id: 'V-2042', name: '陈野', school: '西南民族大学 / 社会工作', focus: '老人探访、活动组织', city: '成都', time: '8 分钟前', status: '待审批' },
  { id: 'V-2043', name: '梁夏', school: '暨南大学 / 汉语言文学', focus: '作业辅导、阅读陪伴', city: '深圳', time: '15 分钟前', status: '待审批' },
  { id: 'V-2044', name: '赵一诺', school: '中南大学 / 公共管理', focus: '乡村联络、老人关怀', city: '长沙', time: '22 分钟前', status: '建议优先' },
];

const objectSeed: ObjectItem[] = [
  { id: 'R-901', type: '留守儿童', village: '云南·怒江 / 拉甲村', need: '课业辅导 + 周末连线陪伴', contact: '李老师', submittedAt: '刚刚提交', level: '高优先' },
  { id: 'R-902', type: '留守老人', village: '四川·凉山 / 石桥村', need: '生活照料 + 定期探访', contact: '村医王叔', submittedAt: '12 分钟前', level: '高优先' },
  { id: 'R-903', type: '留守儿童', village: '贵州·毕节 / 河湾村', need: '心理陪伴 + 阅读支持', contact: '驻村干部陈姐', submittedAt: '26 分钟前', level: '正常审核' },
  { id: 'R-904', type: '留守老人', village: '河南·周口 / 南李庄', need: '健康探访 + 药品代购', contact: '刘站长', submittedAt: '41 分钟前', level: '正常审核' },
];

const panelMotion = {
  initial: { opacity: 0, x: 22 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -22 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('live');
  const [liveIndex, setLiveIndex] = useState(0);
  const [volunteers, setVolunteers] = useState(volunteerSeed);
  const [objects, setObjects] = useState(objectSeed);

  useEffect(() => {
    const guard = async () => {
      try {
        if (localStorage.getItem('admin_bypass') === 'true') return;
        const session = await api.getSession();
        if (!session) return navigate('/admin/login');
        const role = await api.getMyRole();
        if (role !== 'admin' && role !== 'reviewer') navigate('/');
      } catch {
        navigate('/admin/login');
      }
    };
    void guard();
  }, [navigate]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveIndex((value) => (value + 1) % liveSeries.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  const currentLive = liveSeries[liveIndex];
  const previousLive = liveSeries[(liveIndex - 1 + liveSeries.length) % liveSeries.length];
  const delta = currentLive - previousLive;

  const handleLogout = async () => {
    localStorage.removeItem('admin_bypass');
    await api.logout();
    navigate('/admin/login');
  };

  const StatCard = ({ label, value, desc }: { label: string; value: string | number; desc: string }) => (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5">
      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
      <div className="mt-2 text-sm text-white/42">{desc}</div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#090404] text-[#F5EDE8]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(212,175,55,0.12),transparent_26%),radial-gradient(circle_at_76%_22%,rgba(139,0,0,0.18),transparent_26%),linear-gradient(180deg,#130707_0%,#060202_100%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(185,28,28,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <div className="relative min-h-screen p-4 lg:p-8">
        <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-6 rounded-[34px] border border-white/8 bg-[rgba(18,7,7,0.82)] p-5 shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:flex-row">
          <aside className="flex w-full shrink-0 flex-col rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(41,13,13,0.95)_0%,rgba(16,7,7,0.92)_100%)] p-6 lg:w-[30%] lg:max-h-[80vh] lg:max-w-[360px] lg:overflow-y-auto xl:w-[320px]">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#B91C1C] to-[#7F1D1D] text-lg font-black text-white">XZQ</div>
              <div>
                <div className="text-xl font-black tracking-tight">乡助桥后台</div>
                <div className="text-sm text-white/40">Admin Control Center</div>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/8 p-4 text-sm leading-6 text-[#F4D8A8]">
              这页按比赛展示做了更强的视觉版式，数据使用演示样本，重点看界面与交互。
            </div>

            <div className="flex flex-1 flex-col gap-4">
              {(Object.keys(tabMeta) as AdminTab[]).map((tab) => {
                const meta = tabMeta[tab];
                const Icon = meta.icon;
                const active = tab === activeTab;
                return (
                  <motion.button
                    key={tab}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab)}
                    className={`relative overflow-hidden rounded-[24px] border px-5 py-5 text-left transition-all ${
                      active
                        ? 'border-[#D4AF37]/35 bg-[linear-gradient(135deg,rgba(139,0,0,0.52),rgba(212,175,55,0.16))]'
                        : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className={`absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-[#F6D365] to-[#F97316] ${active ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${active ? 'border-[#F6D365]/30 bg-[#D4AF37]/12' : 'border-white/10 bg-white/[0.03]'}`}>
                        <Icon className={`h-5 w-5 ${active ? 'text-[#F6D365]' : 'text-white/65'}`} />
                      </div>
                      <div>
                        <div className="text-base font-black">{meta.label}</div>
                        <div className="mt-1 text-xs text-white/40">
                          {tab === 'live' && '动态监测 / 即时变化'}
                          {tab === 'volunteers' && '名单审批 / 快速处理'}
                          {tab === 'objects' && '对象审核 / 优先排序'}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={() => navigate('/')} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm font-bold text-white/70 hover:bg-white/[0.05] hover:text-white">
                <ArrowLeft className="h-4 w-4" /> 返回首页
              </button>
              <button onClick={() => void handleLogout()} className="flex items-center gap-3 rounded-2xl border border-[#B91C1C]/20 bg-[#B91C1C]/10 px-4 py-4 text-sm font-bold text-[#FCA5A5] hover:bg-[#B91C1C]/16">
                <LogOut className="h-4 w-4" /> 退出后台
              </button>
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,11,11,0.9)_0%,rgba(12,6,6,0.95)_100%)] p-6">
            <header className="mb-6 flex items-start justify-between gap-6">
              <div className="max-w-[760px]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/18 bg-[#D4AF37]/8 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#F6D365]">
                  <ShieldCheck className="h-3.5 w-3.5" /> 管理者功能模块
                </div>
                <h1 className="text-[40px] font-black leading-none tracking-tight text-white">{tabMeta[activeTab].title}</h1>
                <p className="mt-3 text-base leading-7 text-white/48">{tabMeta[activeTab].subtitle}</p>
              </div>
              <div className="grid w-full shrink-0 gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                <StatCard label="Live" value={currentLive} desc="当前在线人数" />
                <StatCard label="待审批" value={volunteers.length} desc="志愿者申请" />
                <StatCard label="对象审核" value={objects.length} desc="老人儿童样本" />
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(139,0,0,0.2),transparent_40%),rgba(255,255,255,0.02)] p-5">
              <AnimatePresence mode="wait">
                {activeTab === 'live' && (
                  <motion.div key="live" {...panelMotion} className="grid h-full grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="grid grid-rows-[0.86fr_0.14fr] gap-5">
                      <div className="grid grid-cols-[0.94fr_1.06fr] gap-5">
                        <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(55,16,16,0.9),rgba(23,8,8,0.92))] p-8">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(246,211,101,0.16),transparent_26%),radial-gradient(circle_at_70%_70%,rgba(239,68,68,0.22),transparent_32%)]" />
                          <div className="relative z-10">
                            <div className="mb-4 flex items-center justify-between">
                              <div>
                                <div className="text-[11px] font-black uppercase tracking-[0.26em] text-white/35">实时在线志愿者</div>
                                <div className="mt-3 text-[88px] font-black leading-none text-white">{currentLive}</div>
                              </div>
                              <motion.div key={delta} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-full border border-[#D4AF37]/24 bg-[#D4AF37]/10 px-4 py-2 text-sm font-black text-[#F6D365]">
                                {delta >= 0 ? `+${delta}` : delta} / 2秒
                              </motion.div>
                            </div>
                            <div className="mt-8 grid h-[310px] grid-cols-8 items-end gap-3">
                              {liveSeries.map((value, index) => (
                                <div key={`${value}-${index}`} className="flex h-full flex-col justify-end gap-3">
                                  <motion.div
                                    animate={{ height: `${Math.max(28, (value / 260) * 100)}%`, opacity: index === liveIndex ? 1 : 0.55, scaleY: index === liveIndex ? 1.04 : 1 }}
                                    transition={{ duration: 0.45, ease: 'easeOut' }}
                                    className={index === liveIndex ? 'rounded-t-[18px] bg-[linear-gradient(180deg,#F6D365_0%,#F97316_100%)] shadow-[0_0_24px_rgba(246,211,101,0.22)]' : 'rounded-t-[18px] bg-[linear-gradient(180deg,rgba(246,211,101,0.55)_0%,rgba(185,28,28,0.48)_100%)]'}
                                  />
                                  <div className="text-center text-xs font-bold text-white/35">{index + 1}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-rows-2 gap-5">
                          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-7">
                            <div className="mb-5 flex items-center gap-3">
                              <Users className="h-5 w-5 text-[#F6D365]" />
                              <div className="text-sm font-black tracking-wide text-white">活跃省份分布</div>
                            </div>
                            <div className="space-y-4">
                              {provinceSeries.map((item) => (
                                <div key={item.name} className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-white/80">{item.name}</span>
                                    <span className="font-black text-[#F6D365]">{item.count}</span>
                                  </div>
                                  <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.count / 46) * 100}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} className={`h-full rounded-full bg-gradient-to-r ${item.bar}`} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-7">
                            <div className="mb-5 text-sm font-black tracking-wide text-white">最新动态播报</div>
                            <div className="space-y-4">
                              {liveFeed.map((item, index) => (
                                <motion.div key={item} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="flex gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-4">
                                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#F6D365] shadow-[0_0_16px_rgba(246,211,101,0.35)]" />
                                  <div className="text-sm leading-6 text-white/72">{item}</div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-5">
                        <StatCard label="活跃率" value="89%" desc="较上一时段上升 4%" />
                        <StatCard label="待分发任务" value="36" desc="今晚 20:00 前完成分配" />
                        <StatCard label="重点陪伴线" value="18" desc="儿童学业线最活跃" />
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(27,10,10,0.95),rgba(16,7,7,0.92))] p-7">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.26em] text-white/35">实时监测说明</div>
                          <div className="mt-2 text-2xl font-black text-white">在线状态总览</div>
                        </div>
                        <div className="rounded-full border border-[#D4AF37]/18 bg-[#D4AF37]/10 px-3 py-2 text-xs font-black text-[#F6D365]">LIVE</div>
                      </div>
                      <div className="grid gap-4">
                        {[
                          { title: '晚间值守', desc: '18:00 - 22:00 的陪伴线路热度最高' },
                          { title: '探访派发', desc: '老人探访任务主要集中在四川、云南' },
                          { title: '辅导连线', desc: '儿童作业辅导目前正在快速补位' },
                        ].map((item) => (
                          <div key={item.title} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-5">
                            <div className="font-black text-white">{item.title}</div>
                            <div className="mt-2 text-sm text-white/42">{item.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'volunteers' && (
                  <motion.div key="volunteers" {...panelMotion} className="grid h-full grid-cols-1 gap-5 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(48,14,14,0.92),rgba(19,8,8,0.92))] p-7">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="text-3xl font-black text-white">待处理志愿者</div>
                        <div className="rounded-full border border-[#D4AF37]/18 bg-[#D4AF37]/10 px-3 py-2 text-xs font-black text-[#F6D365]">{volunteers.length} 人</div>
                      </div>
                      <div className="grid gap-4">
                        <StatCard label="建议优先" value={volunteers.filter((item) => item.status === '建议优先').length} desc="适合先处理的申请者" />
                        <StatCard label="常规审核" value={volunteers.filter((item) => item.status === '待审批').length} desc="可顺序完成审核" />
                        <StatCard label="推荐方向" value="儿童陪伴" desc="当前最缺方向" />
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(22,9,9,0.95),rgba(14,7,7,0.92))]">
                      <div className="grid grid-cols-1 gap-2 border-b border-white/8 px-7 py-5 text-[11px] font-black uppercase tracking-[0.24em] text-white/35 md:grid-cols-[1.2fr_1.4fr_1fr_0.7fr_0.9fr]">
                        <div>申请志愿者</div><div>擅长方向</div><div>地区</div><div>状态</div><div className="text-right">操作</div>
                      </div>
                      <div className="grid h-[calc(100%-72px)] auto-rows-fr divide-y divide-white/6">
                        {volunteers.map((item, index) => (
                          <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="grid grid-cols-1 gap-4 px-7 py-6 md:grid-cols-[1.2fr_1.4fr_1fr_0.7fr_0.9fr]">
                            <div><div className="text-lg font-black text-white">{item.name}</div><div className="mt-1 text-sm text-white/40">{item.school}</div><div className="mt-2 text-xs font-bold text-[#F6D365]">{item.id}</div></div>
                            <div><div className="text-sm font-bold text-white/80">{item.focus}</div><div className="mt-2 text-xs text-white/38">申请时间：{item.time}</div></div>
                            <div className="text-sm text-white/68">{item.city}</div>
                            <div><span className={`inline-flex rounded-full px-3 py-2 text-xs font-black ${item.status === '建议优先' ? 'bg-[#D4AF37]/14 text-[#F6D365]' : 'bg-white/8 text-white/68'}`}>{item.status}</span></div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setVolunteers((list) => list.filter((v) => v.id !== item.id))} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/12 px-4 py-3 text-sm font-black text-emerald-300 hover:bg-emerald-500/18"><CheckCircle2 className="h-4 w-4" /> 通过</button>
                              <button onClick={() => setVolunteers((list) => list.filter((v) => v.id !== item.id))} className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 hover:bg-red-500/16"><Trash2 className="h-4 w-4" /> 移除</button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'objects' && (
                  <motion.div key="objects" {...panelMotion} className="grid h-full grid-cols-1 gap-5 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="grid grid-rows-[0.42fr_0.58fr] gap-5">
                      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(52,16,16,0.92),rgba(19,8,8,0.92))] p-7">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="text-3xl font-black text-white">待审批概览</div>
                          <div className="rounded-full border border-[#D4AF37]/18 bg-[#D4AF37]/10 px-3 py-2 text-xs font-black text-[#F6D365]">{objects.length} 条</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <StatCard label="儿童申请" value={objects.filter((item) => item.type === '留守儿童').length} desc="儿童样本" />
                          <StatCard label="老人申请" value={objects.filter((item) => item.type === '留守老人').length} desc="老人样本" />
                          <StatCard label="高优先" value={objects.filter((item) => item.level === '高优先').length} desc="需要优先处理" />
                          <StatCard label="正常审核" value={objects.filter((item) => item.level === '正常审核').length} desc="可顺序处理" />
                        </div>
                      </div>
                      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-7">
                        <div className="mb-5 text-xl font-black text-white">审核提示</div>
                        <div className="space-y-4">
                          {[
                            '老人探访与生活照料申请建议优先处理，视觉上保持红金提示层级。',
                            '儿童陪伴类申请更适合通过“陪伴 + 辅导”双标签展示。',
                            '高优先样本统一保持强调边框，方便比赛展示时一眼识别。',
                          ].map((item) => (
                            <div key={item} className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-4 text-sm leading-6 text-white/70">{item}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(22,9,9,0.95),rgba(14,7,7,0.92))]">
                      <div className="grid grid-cols-1 gap-2 border-b border-white/8 px-7 py-5 text-[11px] font-black uppercase tracking-[0.24em] text-white/35 md:grid-cols-[0.8fr_1.1fr_1.2fr_0.8fr_1fr_0.95fr]">
                        <div>类型</div><div>村庄</div><div>核心需求</div><div>联系人</div><div>提交时间</div><div className="text-right">操作</div>
                      </div>
                      <div className="grid h-[calc(100%-72px)] auto-rows-fr divide-y divide-white/6">
                        {objects.map((item, index) => (
                          <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="grid grid-cols-1 gap-4 px-7 py-6 md:grid-cols-[0.8fr_1.1fr_1.2fr_0.8fr_1fr_0.95fr]">
                            <div><div className="font-black text-white">{item.type}</div><div className="mt-2 text-xs font-bold text-[#F6D365]">{item.id}</div></div>
                            <div className="text-sm text-white/72">{item.village}</div>
                            <div><div className="text-sm font-bold text-white/82">{item.need}</div><div className="mt-2"><span className={`inline-flex rounded-full px-3 py-2 text-xs font-black ${item.level === '高优先' ? 'bg-[#D4AF37]/14 text-[#F6D365]' : 'bg-white/8 text-white/68'}`}>{item.level}</span></div></div>
                            <div className="text-sm text-white/68">{item.contact}</div>
                            <div className="text-sm text-white/52">{item.submittedAt}</div>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setObjects((list) => list.filter((v) => v.id !== item.id))} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/12 px-4 py-3 text-sm font-black text-emerald-300 hover:bg-emerald-500/18"><CheckCircle2 className="h-4 w-4" /> 通过</button>
                              <button onClick={() => setObjects((list) => list.filter((v) => v.id !== item.id))} className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 hover:bg-red-500/16"><XCircle className="h-4 w-4" /> 驳回</button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
