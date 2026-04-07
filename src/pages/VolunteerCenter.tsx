import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookHeart,
  Camera,
  HeartHandshake,
  Lock,
  Save,
  Settings,
  Shield,
  Star,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../api';
import { useGameStore } from '../store/useGameStore';

type CenterTab = 'elderly' | 'children' | 'level' | 'settings';

const elderlyHelp = [
  { id: 'E-01', name: '张奶奶', village: '四川·凉山 / 石桥村', help: '生活照料与周探访', time: '2026-04-02 18:30', count: '第 12 次服务' },
  { id: 'E-02', name: '周爷爷', village: '云南·怒江 / 拉甲村', help: '药品代购与陪伴沟通', time: '2026-04-03 09:10', count: '第 7 次服务' },
  { id: 'E-03', name: '王奶奶', village: '贵州·毕节 / 河湾村', help: '健康探访与视频连线', time: '2026-04-05 14:20', count: '第 10 次服务' },
];

const childrenHelp = [
  { id: 'C-01', name: '小安', village: '河南·周口 / 南李庄', help: '作业辅导与阅读陪伴', time: '2026-04-01 19:40', count: '第 16 次服务' },
  { id: 'C-02', name: '小雨', village: '四川·凉山 / 木里村', help: '心理陪伴与周末连线', time: '2026-04-04 20:00', count: '第 9 次服务' },
  { id: 'C-03', name: '小禾', village: '云南·怒江 / 山背村', help: '课业复盘与成长支持', time: '2026-04-05 16:10', count: '第 11 次服务' },
];

const levelLadder = [
  { level: 1, need: 0, title: '萤火初现' },
  { level: 2, need: 100, title: '溪涧微光' },
  { level: 3, need: 250, title: '晨曦之愿' },
  { level: 4, need: 475, title: '星河守护' },
  { level: 5, need: 812, title: '月辉信使' },
  { level: 6, need: 1318, title: '暖阳先驱' },
  { level: 7, need: 2077, title: '炬焰导师' },
  { level: 8, need: 3216, title: '极光统领' },
  { level: 9, need: 4924, title: '永恒光冕' },
];

const tabMeta = {
  elderly: { label: '查看留守老人', title: '留守老人服务记录', subtitle: '以时间轴和次数统计展示你正在进行的老人帮扶。', icon: HeartHandshake },
  children: { label: '查看留守儿童', title: '留守儿童服务记录', subtitle: '聚焦你已参与的儿童陪伴、辅导与连线支持。', icon: BookHeart },
  level: { label: '志愿者等级', title: '志愿者等级与成长', subtitle: '等级、积分和升级需求都在这里统一展示。', icon: Star },
  settings: { label: '个人设置', title: '个人设置', subtitle: '支持修改头像、名字、密码和基础资料。', icon: Settings },
} satisfies Record<CenterTab, { label: string; title: string; subtitle: string; icon: any }>;

const VolunteerCenter = () => {
  const navigate = useNavigate();
  const { level, points, totalXp, xpToNextLevel, hydrateFromRemote, setAdminStatus } = useGameStore();
  const [activeTab, setActiveTab] = useState<CenterTab>('elderly');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [profileForm, setProfileForm] = useState({
    username: '',
    phone: '',
    avatar_url: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const session = await api.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        const profile = await api.getMyProfile();
        if (!profile) {
          navigate('/login');
          return;
        }

        const role = await api.getMyRole();
        setAdminStatus(role === 'admin');

        setProfileForm({
          username: profile.username || '',
          phone: profile.phone || '',
          avatar_url: profile.avatar_url || '',
          email: profile.email || '',
        });

        await hydrateFromRemote();
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [hydrateFromRemote, navigate, setAdminStatus]);

  const handleAvatarChange = async (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev) => ({ ...prev, avatar_url: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage('');
    try {
      await api.updateMyProfile({
        username: profileForm.username,
        phone: profileForm.phone,
        avatar_url: profileForm.avatar_url,
      });
      setMessage('个人资料已更新。');
    } catch (error: any) {
      setMessage(error?.message || '资料保存失败。');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password.length < 6) {
      setMessage('密码至少需要 6 位。');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setMessage('两次输入的密码不一致。');
      return;
    }

    setSavingPassword(true);
    setMessage('');
    try {
      await api.updateMyPassword(passwordForm.password);
      setPasswordForm({ password: '', confirmPassword: '' });
      setMessage('密码已更新。');
    } catch (error: any) {
      setMessage(error?.message || '密码更新失败。');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#090404] text-white">正在进入志愿者中心...</div>;
  }

  const currentMeta = tabMeta[activeTab];
  const nextLevelTarget = levelLadder.find((item) => item.level === Math.min(level + 1, 9));
  const progressWidth = nextLevelTarget ? Math.min(100, (totalXp / nextLevelTarget.need) * 100) : 100;

  return (
    <div className="min-h-screen overflow-hidden bg-[#090404] text-[#F5EDE8]">
      <Navbar />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(212,175,55,0.12),transparent_26%),radial-gradient(circle_at_76%_22%,rgba(139,0,0,0.18),transparent_26%),linear-gradient(180deg,#130707_0%,#060202_100%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(185,28,28,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <main className="relative h-screen px-6 pb-6 pt-28 lg:px-8">
        <div className="mx-auto flex h-full max-w-[1920px] gap-6 rounded-[34px] border border-white/8 bg-[rgba(18,7,7,0.82)] p-5 shadow-[0_32px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <aside className="flex w-[320px] shrink-0 flex-col rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(41,13,13,0.95)_0%,rgba(16,7,7,0.92)_100%)] p-6">
            <div className="mb-8 flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]">
                {profileForm.avatar_url ? (
                  <img src={profileForm.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-white/35" />
                )}
              </div>
              <div>
                <div className="text-xl font-black tracking-tight text-white">{profileForm.username || '志愿者'}</div>
                <div className="mt-1 text-sm text-white/40">Volunteer Center</div>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/8 p-4 text-sm leading-6 text-[#F4D8A8]">
              这里集中展示你的服务记录、成长等级和个人设置，风格与管理后台保持一致。
            </div>

            <div className="flex flex-1 flex-col gap-4">
              {(Object.keys(tabMeta) as CenterTab[]).map((tab) => {
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
                      <div className="text-base font-black">{meta.label}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(29,11,11,0.9)_0%,rgba(12,6,6,0.95)_100%)] p-6">
            <header className="mb-6 flex items-start justify-between gap-6">
              <div className="max-w-[760px]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/18 bg-[#D4AF37]/8 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#F6D365]">
                  <Shield className="h-3.5 w-3.5" /> 志愿者个人模块
                </div>
                <h1 className="text-[40px] font-black leading-none tracking-tight text-white">{currentMeta.title}</h1>
                <p className="mt-3 text-base leading-7 text-white/48">{currentMeta.subtitle}</p>
              </div>

              <div className="grid shrink-0 grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/35">等级</div>
                  <div className="mt-3 text-3xl font-black text-white">LV.{level}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/35">积分</div>
                  <div className="mt-3 text-3xl font-black text-white">{points}</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/35">累计 XP</div>
                  <div className="mt-3 text-3xl font-black text-white">{totalXp}</div>
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(139,0,0,0.2),transparent_40%),rgba(255,255,255,0.02)] p-5">
              <AnimatePresence mode="wait">
                {activeTab === 'elderly' && (
                  <motion.div key="elderly" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid h-full grid-cols-[0.78fr_1.22fr] gap-5">
                    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(52,16,16,0.92),rgba(19,8,8,0.92))] p-7">
                      <div className="mb-5 text-3xl font-black text-white">老人帮扶概览</div>
                      <div className="grid gap-4">
                        <StatCard label="服务对象" value="03" desc="当前重点跟进老人" />
                        <StatCard label="累计服务" value="29 次" desc="近 30 天帮扶总次数" />
                        <StatCard label="最近行动" value="今天" desc="已完成一次定点探访" />
                      </div>
                    </div>
                    <TimelinePanel items={elderlyHelp} tone="elderly" />
                  </motion.div>
                )}

                {activeTab === 'children' && (
                  <motion.div key="children" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid h-full grid-cols-[0.78fr_1.22fr] gap-5">
                    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(52,16,16,0.92),rgba(19,8,8,0.92))] p-7">
                      <div className="mb-5 text-3xl font-black text-white">儿童帮扶概览</div>
                      <div className="grid gap-4">
                        <StatCard label="服务对象" value="03" desc="当前重点跟进儿童" />
                        <StatCard label="累计服务" value="36 次" desc="近 30 天陪伴总次数" />
                        <StatCard label="本周重点" value="辅导连线" desc="学业支持需求最强" />
                      </div>
                    </div>
                    <TimelinePanel items={childrenHelp} tone="children" />
                  </motion.div>
                )}

                {activeTab === 'level' && (
                  <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid h-full grid-cols-[0.8fr_1.2fr] gap-5">
                    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(52,16,16,0.92),rgba(19,8,8,0.92))] p-7">
                      <div className="text-[11px] font-black uppercase tracking-[0.26em] text-white/35">当前等级</div>
                      <div className="mt-4 text-[92px] font-black leading-none text-white">LV.{level}</div>
                      <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between text-sm">
                          <span className="font-bold text-white/75">距离下一级</span>
                          <span className="font-black text-[#F6D365]">{xpToNextLevel} XP</span>
                        </div>
                        <div className="h-4 overflow-hidden rounded-full bg-white/[0.05]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressWidth}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="h-full rounded-full bg-[linear-gradient(90deg,#F6D365_0%,#F97316_100%)]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(22,9,9,0.95),rgba(14,7,7,0.92))] p-6">
                      <div className="mb-4 text-xl font-black text-white">等级阶梯</div>
                      <div className="panel-scrollbar panel-scroll-fade max-h-[520px] space-y-3 overflow-y-auto pr-1">
                        {levelLadder.map((item) => (
                          <div key={item.level} className={`flex items-center justify-between rounded-[22px] border px-5 py-4 ${item.level === level ? 'border-[#D4AF37]/30 bg-[#D4AF37]/10' : 'border-white/8 bg-white/[0.03]'}`}>
                            <div>
                              <div className="text-lg font-black text-white">LV.{item.level} {item.title}</div>
                              <div className="mt-1 text-sm text-white/42">累计 {item.need} XP 解锁</div>
                            </div>
                            {item.level === level && <span className="rounded-full bg-[#D4AF37]/14 px-3 py-2 text-xs font-black text-[#F6D365]">当前</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="grid h-full grid-cols-2 gap-5">
                    <form onSubmit={saveProfile} className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(52,16,16,0.92),rgba(19,8,8,0.92))] p-7">
                      <div className="mb-6 flex items-center gap-3 text-2xl font-black text-white">
                        <Camera className="h-5 w-5 text-[#F6D365]" /> 资料设置
                      </div>

                      <div className="mb-6 flex items-center gap-5">
                        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
                          {profileForm.avatar_url ? <img src={profileForm.avatar_url} alt="avatar" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-white/35" />}
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white/80">
                          上传头像
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleAvatarChange(e.target.files?.[0])} />
                        </label>
                      </div>

                      <div className="space-y-4">
                        <Field label="名字" value={profileForm.username} onChange={(value) => setProfileForm((prev) => ({ ...prev, username: value }))} />
                        <Field label="账号邮箱" value={profileForm.email} disabled onChange={() => undefined} />
                        <Field label="手机号" value={profileForm.phone} onChange={(value) => setProfileForm((prev) => ({ ...prev, phone: value }))} />
                      </div>

                      <button type="submit" disabled={savingProfile} className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#8B0000] to-[#722F37] px-8 py-4 font-black text-white">
                        <Save className="h-4 w-4" /> {savingProfile ? '正在保存...' : '保存资料'}
                      </button>
                    </form>

                    <form onSubmit={savePassword} className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(22,9,9,0.95),rgba(14,7,7,0.92))] p-7">
                      <div className="mb-6 flex items-center gap-3 text-2xl font-black text-white">
                        <Lock className="h-5 w-5 text-[#F6D365]" /> 密码设置
                      </div>
                      <div className="space-y-4">
                        <Field type="password" label="新密码" value={passwordForm.password} onChange={(value) => setPasswordForm((prev) => ({ ...prev, password: value }))} />
                        <Field type="password" label="确认密码" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))} />
                      </div>

                      {message && <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white/75">{message}</div>}

                      <button type="submit" disabled={savingPassword} className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-8 py-4 font-black text-white">
                        <Save className="h-4 w-4" /> {savingPassword ? '正在更新...' : '更新密码'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, desc }: { label: string; value: string | number; desc: string }) => (
  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5">
    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">{label}</div>
    <div className="mt-2 text-3xl font-black text-white">{value}</div>
    <div className="mt-2 text-sm text-white/42">{desc}</div>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{label}</label>
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-2xl border px-5 py-4 outline-none transition-all ${
        disabled
          ? 'cursor-not-allowed border-white/8 bg-white/[0.03] text-white/35'
          : 'border-white/10 bg-white/[0.05] text-white focus:ring-2 focus:ring-[#8B0000]/40'
      }`}
    />
  </div>
);

const TimelinePanel = ({ items, tone }: { items: typeof elderlyHelp; tone: 'elderly' | 'children' }) => (
  <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(22,9,9,0.95),rgba(14,7,7,0.92))] p-6">
    <div className="mb-5 text-2xl font-black text-white">{tone === 'elderly' ? '老人服务时间轴' : '儿童服务时间轴'}</div>
    <div className="grid gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="rounded-[22px] border border-white/8 bg-white/[0.03] p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-black text-white">{item.name}</div>
              <div className="mt-1 text-sm text-white/42">{item.village}</div>
            </div>
            <div className="rounded-full bg-[#D4AF37]/12 px-3 py-2 text-xs font-black text-[#F6D365]">{item.id}</div>
          </div>
          <div className="mt-4 text-sm font-bold text-white/82">{item.help}</div>
          <div className="mt-3 flex items-center justify-between text-sm text-white/45">
            <span>{item.time}</span>
            <span>{item.count}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default VolunteerCenter;
