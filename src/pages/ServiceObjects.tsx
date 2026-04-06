import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Heart,
  Home,
  MapPin,
  Plus,
  Target,
  User,
  UserCircle,
  Users,
} from 'lucide-react';
import { api } from '../api';
import Navbar from '../components/Navbar';
import ServiceGlobe from '../components/visual/ServiceGlobe';
import { ServiceObject } from '../types';

type SiteContent = {
  hero_image?: string;
  hero_images?: string[];
};

type DisplayObject = {
  id: string;
  name: string;
  age: number;
  village: string;
  status: ServiceObject['status'];
  need: string;
  gender: string;
};

type StatsConfig = {
  total: number;
  pending: number;
  claimed: number;
  averageAge: number;
  gender: { male: number; female: number };
  regions: { name: string; count: number; percentage: number }[];
};

const panelClass =
  'rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.28)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';

const fallbackChildren: DisplayObject[] = [
  { id: 'child-1', name: '0001', age: 10, village: '铜盆村', status: 'pending', need: '提供作业辅导', gender: '男' },
  { id: 'child-2', name: '0002', age: 8, village: '沙坪村', status: 'pending', need: '需要心理陪伴', gender: '女' },
  { id: 'child-3', name: '0003', age: 12, village: '莲花村', status: 'pending', need: '需要成长支持', gender: '男' },
  { id: 'child-4', name: '0004', age: 9, village: '和平村', status: 'pending', need: '需要物资支持', gender: '女' },
];

const fallbackElderly: DisplayObject[] = [
  { id: 'elderly-1', name: '1001', age: 72, village: '铜盆村', status: 'pending', need: '提供生活照料', gender: '男' },
  { id: 'elderly-2', name: '1002', age: 78, village: '沙坪村', status: 'pending', need: '进行健康探访', gender: '女' },
  { id: 'elderly-3', name: '1003', age: 68, village: '莲花村', status: 'pending', need: '需要精神慰藉', gender: '男' },
  { id: 'elderly-4', name: '1004', age: 75, village: '和平村', status: 'pending', need: '需要物资支持', gender: '女' },
];

const childStats: StatsConfig = {
  total: 1284,
  pending: 856,
  claimed: 428,
  averageAge: 10,
  gender: { male: 684, female: 600 },
  regions: [
    { name: '西南', count: 456, percentage: 35 },
    { name: '中部', count: 324, percentage: 25 },
    { name: '西北', count: 289, percentage: 23 },
    { name: '东部', count: 215, percentage: 17 },
  ],
};

const elderlyStats: StatsConfig = {
  total: 2567,
  pending: 1678,
  claimed: 889,
  averageAge: 72,
  gender: { male: 1234, female: 1333 },
  regions: [
    { name: '西南', count: 987, percentage: 38 },
    { name: '中部', count: 654, percentage: 25 },
    { name: '西北', count: 543, percentage: 21 },
    { name: '东部', count: 383, percentage: 15 },
  ],
};

function normalizeGender(value: unknown, fallback: '男' | '女') {
  if (typeof value !== 'string') return fallback;
  if (value.includes('女')) return '女';
  if (value.includes('男')) return '男';
  return fallback;
}

function mapObjectToDisplay(item: ServiceObject, index: number, type: 'child' | 'elderly'): DisplayObject {
  return {
    id: item.id,
    name: item.code || `${type === 'child' ? 'C' : 'E'}${String(index + 1).padStart(3, '0')}`,
    age: item.age,
    village: item.village || '待补充村落',
    status: item.status,
    need: item.needs || item.situation || '长期关怀',
    gender: normalizeGender(item.situation, type === 'child' ? '男' : '女'),
  };
}

function fillDisplayObjects(primary: DisplayObject[], fallback: DisplayObject[], targetCount: number) {
  if (primary.length >= targetCount) return primary.slice(0, targetCount);
  const usedIds = new Set(primary.map((item) => item.id));
  const supplements = fallback.filter((item) => !usedIds.has(item.id)).slice(0, targetCount - primary.length);
  return [...primary, ...supplements];
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-3 backdrop-blur-[24px]">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{label}</div>
      <div className="mt-2 text-[1.65rem] font-black text-white">{value}</div>
      <div className="mt-1 text-xs text-white/50">{hint}</div>
    </div>
  );
}

function DataStatsCard({ title, stats, accent }: { title: string; stats: StatsConfig; accent: string }) {
  const malePercent = Math.round((stats.gender.male / stats.total) * 100);
  const femalePercent = 100 - malePercent;

  return (
    <div className={`${panelClass} relative min-h-0 overflow-hidden p-4`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5" style={{ color: accent }}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">Overview</div>
            <h3 className="mt-1 text-[1.4rem] font-black text-white">{title}</h3>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-[#D4AF37]">实时更新</div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: '服务总量', value: stats.total.toLocaleString(), color: '#ffffff' },
          { label: '待认领', value: stats.pending.toLocaleString(), color: accent },
          { label: '已匹配', value: stats.claimed.toLocaleString(), color: '#ffffff' },
          { label: '平均年龄', value: `${stats.averageAge} 岁`, color: '#ffffff' },
        ].map((item) => (
          <div key={item.label} className="rounded-[18px] border border-white/10 bg-black/10 p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{item.label}</div>
            <div className="mt-2 text-[1.7rem] font-black" style={{ color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="panel-scrollbar panel-scroll-fade mt-4 grid max-h-[300px] gap-4 overflow-y-auto border-t border-white/10 pt-4 pr-1">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white/70">
            <UserCircle className="h-4 w-4 text-[#D4AF37]" />
            性别分布
          </div>
          <div className="space-y-2.5">
            {[
              { label: '男性', value: stats.gender.male, percent: malePercent, gradient: 'from-[#8B0000] to-[#D4AF37]' },
              { label: '女性', value: stats.gender.female, percent: femalePercent, gradient: 'from-[#D4AF37] to-[#F7E7A1]' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-10 text-xs text-white/55">{item.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${item.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="w-12 text-right text-xs text-white/75">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white/70">
            <BarChart3 className="h-4 w-4 text-[#D4AF37]" />
            区域分布
          </div>
          <div className="grid grid-cols-2 gap-2">
            {stats.regions.map((region) => (
              <div key={region.name} className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                <div className="mb-1 flex items-center justify-between text-xs font-black text-white">
                  <span>{region.name}</span>
                  <span className="text-[#D4AF37]">{region.percentage}%</span>
                </div>
                <div className="text-xs text-white/50">{region.count} 人</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectItemCard({ item, index, accent, onClaim }: { item: DisplayObject; index: number; accent: string; onClaim: () => void }) {
  const statusText = item.status === 'pending' ? '待认领' : item.status === 'claimed' ? '已认领' : '已完成';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: index * 0.05 }}
      className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.035))] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.16)] backdrop-blur-[20px]"
    >
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-black/10" style={{ color: accent }}>
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[15px] font-black text-white">{item.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
              <span>{item.age} 岁</span>
              <span>·</span>
              <span>{item.gender}</span>
            </div>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-xs font-black text-[#D4AF37]">{statusText}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[13px] text-white/65">
          <MapPin className="h-4 w-4" />
          {item.village}
        </div>
        <div className="rounded-[16px] border border-white/10 bg-[#8B0000]/10 px-3 py-2.5">
          <div className="mb-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#D4AF37]/80">
            <Target className="h-4 w-4" />
            主要需求
          </div>
          <div className="text-[13px] font-bold text-[#F6E2A4]">{item.need}</div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClaim}
        className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-gradient-to-r from-[#8B0000] to-[#722F37] px-4 py-2 text-sm font-black text-white"
      >
        立即认领
        <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
      </motion.button>
    </motion.div>
  );
}

function ExpandButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white"
    >
      {expanded ? (
        <>
          收起列表
          <ChevronUp className="h-4 w-4 text-[#D4AF37]" />
        </>
      ) : (
        <>
          查看更多
          <ChevronDown className="h-4 w-4 text-[#D4AF37]" />
        </>
      )}
    </motion.button>
  );
}

function ContentColumn({
  title,
  description,
  accent,
  stats,
  items,
  showMore,
  onToggleMore,
  onClaim,
}: {
  title: string;
  description: string;
  accent: string;
  stats: StatsConfig;
  items: DisplayObject[];
  showMore: boolean;
  onToggleMore: () => void;
  onClaim: () => void;
}) {
  const collapsedCount = 2;
  const visibleItems = showMore ? items : items.slice(0, collapsedCount);

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className={`${panelClass} relative min-h-0 overflow-hidden p-4`}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">名单</div>
            <h3 className="mt-1 text-[1.55rem] leading-none font-black text-white">{title}</h3>
          </div>
          <div className="max-w-[150px] pt-1 text-right text-xs leading-5 text-white/50">{description}</div>
        </div>

        <div className="panel-scrollbar panel-scroll-fade max-h-[330px] space-y-3 overflow-y-auto pr-1">
          {visibleItems.map((item, index) => (
            <ObjectItemCard key={item.id} item={item} index={index} accent={accent} onClaim={onClaim} />
          ))}
        </div>

        {items.length > collapsedCount ? (
          <div className="mt-3">
            <AnimatePresence mode="wait">
              <ExpandButton expanded={showMore} onClick={onToggleMore} />
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      <DataStatsCard title={title} stats={stats} accent={accent} />
    </div>
  );
}

function FloatingHeroText() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[-34px] z-[1] flex justify-center">
      <div className="relative h-[175px] w-full max-w-[1260px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="absolute left-0 top-0 text-[72px] font-black leading-none tracking-[-0.05em] text-white/[0.16] [text-shadow:0_12px_36px_rgba(255,255,255,0.12)] xl:text-[96px]"
          style={{ transform: 'perspective(900px) rotateX(72deg)' }}
        >
          让陪伴被看见
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.18 }}
          className="absolute right-0 top-[62px] text-[68px] font-black leading-none tracking-[-0.05em] text-[#F0D27B]/[0.2] [text-shadow:0_14px_40px_rgba(212,175,55,0.2)] xl:text-[90px]"
          style={{ transform: 'perspective(900px) rotateX(72deg)' }}
        >
          让需要被更快连接
        </motion.div>
      </div>
    </div>
  );
}

function GlobePanel({ onSubmit, onJoin }: { onSubmit: () => void; onJoin: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.08 }}
      className={`${panelClass} relative z-10 flex min-h-0 flex-col overflow-hidden p-4 xl:h-full`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">Service Map</div>
          <h2 className="mt-1 text-[1.55rem] font-black text-white">服务分布</h2>
          <p className="mt-1 max-w-[240px] text-sm leading-5 text-white/55">
            聚焦重点区域与服务对象分布，便于快速进入认领和提交入口。
          </p>
        </div>
        <div className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-bold text-[#F5E0A0]">重点区域</div>
      </div>

      <div className="mb-3 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          className="flex flex-1 items-center justify-center gap-3 rounded-[20px] border border-[#D4AF37]/35 bg-gradient-to-r from-[#8B0000] to-[#722F37] px-4 py-3 text-base font-black text-white"
        >
          <Plus className="h-5 w-5 text-[#D4AF37]" />
          提交服务对象
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onJoin}
          className="flex items-center justify-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 text-base font-black text-white"
        >
          <Heart className="h-5 w-5 text-[#D4AF37]" />
          参与认领
        </motion.button>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-[30px] border border-white/10 bg-[#120304]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(212,175,55,0.18),transparent_38%),radial-gradient(circle_at_50%_92%,rgba(139,0,0,0.32),transparent_54%)]" />
        <ServiceGlobe />

        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-3">
          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
            Rural Care Network
          </div>
          <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] font-bold text-[#D4AF37]">重点追踪中</div>
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-[22px] border border-white/10 bg-black/30 p-2.5 backdrop-blur-md">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: '高关注', value: '西南与中部' },
              { label: '服务对象', value: '儿童与老人' },
              { label: '行动入口', value: '认领 / 提交' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{item.label}</div>
                <div className="mt-1 text-xs font-bold text-white/82 xl:text-sm">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const ServiceObjects = () => {
  const navigate = useNavigate();
  const [objects, setObjects] = useState<ServiceObject[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>({});
  const [showMoreChildren, setShowMoreChildren] = useState(false);
  const [showMoreElderly, setShowMoreElderly] = useState(false);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const [data, contentData] = await Promise.all([api.getObjects(), api.getSiteContent().catch(() => ({}))]);
        const verifiedOnly = (data || []).filter((item: any) => item && item.is_verified !== false);
        setObjects(verifiedOnly as ServiceObject[]);
        setSiteContent((contentData || {}) as SiteContent);
      } catch (error) {
        console.error('Failed to fetch service objects', error);
      }
    };

    fetchObjects();
  }, []);

  const coverSrc = useMemo(() => {
    const direct = typeof siteContent.hero_image === 'string' ? siteContent.hero_image.trim() : '';
    if (direct) return direct;

    if (Array.isArray(siteContent.hero_images) && siteContent.hero_images.length > 0) {
      return siteContent.hero_images[0]?.trim() || '';
    }

    return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1920&auto=format&fit=crop';
  }, [siteContent]);

  const childObjects = useMemo(() => {
    const filtered = objects
      .filter((item) => item.type === 'child')
      .slice(0, 4)
      .map((item, index) => mapObjectToDisplay(item, index, 'child'));
    return fillDisplayObjects(filtered, fallbackChildren, 4);
  }, [objects]);

  const elderlyObjects = useMemo(() => {
    const filtered = objects
      .filter((item) => item.type === 'elderly')
      .slice(0, 4)
      .map((item, index) => mapObjectToDisplay(item, index, 'elderly'));
    return fillDisplayObjects(filtered, fallbackElderly, 4);
  }, [objects]);

  const summaryCards = [
    { label: '服务对象总量', value: (childStats.total + elderlyStats.total).toLocaleString(), hint: '持续更新中' },
    { label: '待认领对象', value: (childStats.pending + elderlyStats.pending).toLocaleString(), hint: '欢迎志愿者加入' },
    { label: '重点覆盖区域', value: '12+', hint: '西南与中部为主' },
    { label: '平均响应周期', value: '48h', hint: '提交后持续跟进' },
  ];

  return (
    <div className="min-h-screen bg-[#140607] text-white">
      <Navbar />

      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(${coverSrc})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            filter: 'blur(14px)',
            transform: 'scale(1.06)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_32%),linear-gradient(180deg,rgba(11,2,3,0.18),rgba(11,2,3,0.92))]" />

        <div className="relative z-10 mx-auto max-w-[1920px] px-6 pb-12 pt-[138px] xl:px-10">
          <div className="mx-auto xl:aspect-[1920/1020] xl:max-h-[860px] xl:min-h-[860px] xl:w-full xl:max-w-[1680px] xl:overflow-visible">
            <div className="relative grid h-full grid-rows-[auto_1fr] gap-6">
              <FloatingHeroText />

              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <SummaryCard label={item.label} value={item.value} hint={item.hint} />
                  </motion.div>
                ))}
              </section>

              <section className="relative grid min-h-0 gap-6 xl:grid-cols-[1.02fr_0.92fr_1.02fr]">
                <ContentColumn
                  title="留守儿童"
                  description="以学业辅导、心理陪伴和长期成长支持为主。"
                  accent="#D4AF37"
                  stats={childStats}
                  items={childObjects}
                  showMore={showMoreChildren}
                  onToggleMore={() => setShowMoreChildren((value) => !value)}
                  onClaim={() => navigate('/join-us')}
                />

                <GlobePanel onSubmit={() => navigate('/submit-object')} onJoin={() => navigate('/join-us')} />

                <ContentColumn
                  title="留守老人"
                  description="聚焦生活照料、健康探访和精神慰藉。"
                  accent="#C0535F"
                  stats={elderlyStats}
                  items={elderlyObjects}
                  showMore={showMoreElderly}
                  onToggleMore={() => setShowMoreElderly((value) => !value)}
                  onClaim={() => navigate('/join-us')}
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceObjects;
