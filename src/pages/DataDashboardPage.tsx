import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { Activity, ArrowLeft, ArrowRight, HeartHandshake, MapPinned, UsersRound } from 'lucide-react';

import Navbar from '../components/Navbar';
import ProvinceServiceMap from '../components/visual/ProvinceServiceMap';

const statCards = [
  { label: '覆盖省份', value: '34', note: '省级需求地图', icon: MapPinned },
  { label: '留守儿童重点样本', value: '126k', note: '课业辅导 / 成长支持', icon: UsersRound },
  { label: '留守老人重点样本', value: '94k', note: '生活照料 / 探访服务', icon: HeartHandshake },
  { label: '平均响应周期', value: '40h', note: '近 7 日', icon: Activity },
];

const topRegions = [
  { rank: '01', province: '四川', combo: '课业辅导 / 生活照料', score: 65 },
  { rank: '02', province: '贵州', combo: '成长支持 / 生活照料', score: 68 },
  { rank: '03', province: '河南', combo: '课业辅导 / 生活照料', score: 63 },
  { rank: '04', province: '云南', combo: '课业辅导 / 健康探访', score: 62 },
];

const serviceBreakdown = [
  { name: '课业辅导', value: 34, color: '#D4AF37' },
  { name: '生活照料', value: 23, color: '#D1462F' },
  { name: '心理陪伴', value: 18, color: '#C43A43' },
  { name: '健康探访', value: 14, color: '#E17284' },
  { name: '精神慰藉', value: 11, color: '#F0DB8D' },
];

const activeVolunteers = [280, 294, 308, 324, 321, 338, 356, 370];
const activeClaims = [22, 24, 28, 26, 32, 35, 39, 42];
const childTrend = [68, 72, 75, 74, 81, 86, 92];
const elderlyTrend = [53, 57, 59, 63, 66, 70, 74];
const responseTrend = [48, 46, 44, 43, 42, 41, 39];

export default function DataDashboardPage() {
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

  const volunteerRealtimeOption = useMemo(
    () => ({
      animationDuration: 900,
      backgroundColor: 'transparent',
      grid: { left: 36, right: 16, top: 36, bottom: 20 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(12, 5, 5, 0.94)',
        borderColor: 'rgba(212,175,55,0.24)',
        textStyle: { color: '#fff' },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: 'rgba(255,255,255,0.58)', fontSize: 10, fontWeight: 700 },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisTick: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.42)', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 10 },
      },
      series: [
        {
          name: '在线志愿者',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: activeVolunteers,
          lineStyle: { width: 3, color: '#D4AF37' },
          itemStyle: { color: '#E5C65D' },
          areaStyle: { color: 'rgba(212,175,55,0.14)' },
        },
        {
          name: '实时认领',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: activeClaims,
          lineStyle: { width: 2, color: '#E06B79' },
          itemStyle: { color: '#E06B79' },
        },
      ],
    }),
    []
  );

  const serviceTrendOption = useMemo(
    () => ({
      animationDuration: 900,
      backgroundColor: 'transparent',
      grid: { left: 36, right: 16, top: 36, bottom: 20 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(12, 5, 5, 0.94)',
        borderColor: 'rgba(212,175,55,0.24)',
        textStyle: { color: '#fff' },
      },
      legend: {
        top: 0,
        right: 0,
        textStyle: { color: 'rgba(255,255,255,0.58)', fontSize: 10, fontWeight: 700 },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['4/01', '4/02', '4/03', '4/04', '4/05', '4/06', '4/07'],
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisTick: { show: false },
        axisLabel: { color: 'rgba(255,255,255,0.42)', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 10 },
      },
      series: [
        {
          name: '儿童服务热度',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: childTrend,
          lineStyle: { width: 3, color: '#D4AF37' },
          itemStyle: { color: '#D4AF37' },
        },
        {
          name: '老人服务热度',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: elderlyTrend,
          lineStyle: { width: 3, color: '#D36A73' },
          itemStyle: { color: '#D36A73' },
        },
        {
          name: '响应时长',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          data: responseTrend,
          lineStyle: { width: 2, color: '#F6EFE5' },
          itemStyle: { color: '#F6EFE5' },
        },
      ],
    }),
    []
  );

  const serviceBreakdownOption = useMemo(
    () => ({
      animationDuration: 900,
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(12, 5, 5, 0.94)',
        borderColor: 'rgba(212,175,55,0.24)',
        textStyle: { color: '#fff' },
      },
      legend: {
        bottom: 0,
        left: 'center',
        textStyle: { color: 'rgba(255,255,255,0.58)', fontSize: 10, fontWeight: 700 },
      },
      series: [
        {
          type: 'pie',
          radius: ['56%', '78%'],
          center: ['50%', '42%'],
          startAngle: 120,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderRadius: 8,
            borderColor: 'rgba(20,8,8,0.9)',
            borderWidth: 3,
          },
          data: serviceBreakdown.map((item) => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color },
          })),
        },
      ],
    }),
    []
  );

  const cardShell =
    'relative rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] backdrop-blur-[24px] shadow-[0_22px_60px_rgba(0,0,0,0.24)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#120505] text-white">
      <Navbar />

      <div className="dashboard-wrap relative z-10 mx-auto h-full w-full max-w-[1920px] px-6 pb-7 pt-[118px] md:px-8 xl:px-12">
        <div
          className="dashboard-frame mx-auto w-full"
          style={{ maxWidth: 'min(1720px, calc((100vh - 168px) * 1.7778))' }}
        >
          <div
            className="dashboard-shell relative overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,6,6,0.84),rgba(10,4,4,0.94))] shadow-[0_40px_120px_rgba(0,0,0,0.36)]"
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
                  <div className="grid h-full min-h-0 gap-5 xl:grid-cols-[1.38fr_0.62fr]">
                    <div className={`${cardShell} h-full overflow-hidden p-5 xl:p-6`}>
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Province Service Map</div>
                          <h1 className="mt-2 text-[clamp(1.9rem,2.3vw,2.8rem)] font-black leading-[1.04] text-white">
                            中国省级服务地图
                          </h1>
                        </div>
                        <div className="rounded-full border border-[#D4AF37]/24 bg-[#D4AF37]/10 px-4 py-2 text-[11px] font-bold text-[#F1D98B]">
                          Hover to Inspect
                        </div>
                      </div>
                      <ProvinceServiceMap className="h-[calc(100%-76px)] min-h-0" />
                    </div>

                    <div className="grid h-full min-h-0 gap-5 xl:grid-rows-[0.54fr_0.46fr]">
                      <div className={`${cardShell} min-h-0 overflow-hidden p-5 xl:p-6`}>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">重点区域</div>
                        <div className="panel-scrollbar panel-scroll-fade mt-4 max-h-[250px] space-y-3 overflow-y-auto pr-1">
                          {topRegions.map((region) => (
                            <div key={`map-${region.rank}`} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-3">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/16 bg-[#D4AF37]/10 text-xs font-black text-[#F2D26E]">
                                    {region.rank}
                                  </div>
                                  <div>
                                    <div className="text-base font-black text-white">{region.province}</div>
                                    <div className="text-xs text-white/55">{region.combo}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/32">指数</div>
                                  <div className="mt-1 text-[1.15rem] font-black text-[#F2D26E]">{region.score}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`${cardShell} min-h-0 overflow-hidden p-5 xl:p-6`}>
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">服务分布</div>
                        <div className="panel-scrollbar panel-scroll-fade mt-4 max-h-[220px] space-y-4 overflow-y-auto pr-1">
                          {serviceBreakdown.map((item) => (
                            <div key={`map-mix-${item.name}`}>
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-semibold text-white/78">{item.name}</span>
                                <span className="font-black text-[#F2D26E]">{item.value}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/8">
                                <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="h-full w-full min-w-full flex-none overflow-hidden p-3 xl:p-4">
                  <div className="grid h-full min-h-0 gap-5 xl:grid-cols-[0.74fr_1.26fr]">
                    <div className="grid h-full min-h-0 gap-5 xl:grid-rows-[0.46fr_0.54fr]">
                    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                        {statCards.map((card) => {
                          const Icon = card.icon;
                          return (
                            <div key={card.label} className={`${cardShell} p-4 xl:p-5`}>
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D4AF37]/16 bg-[#D4AF37]/8 text-[#EACB67]">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/34">{card.label}</div>
                              <div className="mt-2 text-[clamp(1.55rem,1.9vw,2.3rem)] font-black text-white">{card.value}</div>
                              <div className="mt-1 text-xs text-white/58">{card.note}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className={`${cardShell} min-h-0 overflow-hidden p-5 xl:p-6`}>
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Volunteer Live Feed</div>
                          <div className="rounded-full border border-[#D4AF37]/24 bg-[#D4AF37]/10 px-3 py-1.5 text-[11px] font-bold text-[#F1D98B]">
                            Live
                          </div>
                        </div>
                        <div className="mt-4 h-[260px] xl:h-[290px]">
                          <ReactECharts option={volunteerRealtimeOption} style={{ width: '100%', height: '100%' }} />
                        </div>
                      </div>
                    </div>

                    <div className={`${cardShell} h-full p-5 xl:p-6`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Service Trend</div>
                          <h2 className="mt-2 text-[clamp(1.9rem,2.3vw,2.9rem)] font-black leading-[1.04] text-white">
                            服务热度与响应效率
                          </h2>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold text-white/58">
                          近 7 日
                        </div>
                      </div>
                      <div className="mt-4 h-[calc(100%-68px)] min-h-[360px]">
                        <ReactECharts option={serviceTrendOption} style={{ width: '100%', height: '100%' }} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="h-full w-full min-w-full flex-none overflow-hidden p-3 xl:p-4">
                  <div className="grid h-full min-h-0 gap-5 xl:grid-cols-[0.56fr_1.44fr]">
                    <div className={`${cardShell} h-full p-5 xl:p-6`}>
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Service Structure</div>
                      <h2 className="mt-2 text-[clamp(1.9rem,2.3vw,2.8rem)] font-black leading-[1.04] text-white">
                        当前最常见服务类型
                      </h2>
                      <div className="mt-5 h-[calc(100%-84px)] min-h-[320px]">
                        <ReactECharts option={serviceBreakdownOption} style={{ width: '100%', height: '100%' }} />
                      </div>
                    </div>

                    <div className="grid h-full min-h-0 gap-5 xl:grid-rows-[0.7fr_0.3fr]">
                      <div className={`${cardShell} min-h-0 overflow-hidden p-5 xl:p-6`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Priority Regions</div>
                            <h2 className="mt-2 text-[clamp(1.9rem,2.3vw,2.9rem)] font-black leading-[1.04] text-white">
                              优先投入服务资源的区域
                            </h2>
                          </div>
                          <div className="rounded-full border border-[#D4AF37]/24 bg-[#D4AF37]/10 px-3 py-1.5 text-[11px] font-bold text-[#F1D98B]">
                            TOP 04
                          </div>
                        </div>

                        <div className="panel-scrollbar panel-scroll-fade mt-5 grid max-h-[360px] gap-4 overflow-y-auto pr-1">
                          {topRegions.map((region) => (
                            <div key={`priority-${region.rank}`} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/16 bg-[#D4AF37]/10 text-xs font-black text-[#F2D26E]">
                                    {region.rank}
                                  </div>
                                  <div>
                                    <div className="text-[1.3rem] font-black text-white">{region.province}</div>
                                    <div className="mt-1 text-sm text-white/55">{region.combo}</div>
                                  </div>
                                </div>
                                <div className="min-w-[160px]">
                                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-white/32">
                                    <span>压力指数</span>
                                    <span className="text-[#F2D26E]">{region.score}</span>
                                  </div>
                                  <div className="h-2.5 rounded-full bg-white/8">
                                    <div
                                      className="h-full rounded-full bg-[linear-gradient(90deg,#B41919,#D4AF37)]"
                                      style={{ width: `${Math.min(region.score, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid min-h-0 gap-5 md:grid-cols-2">
                        <div className={`${cardShell} min-h-0 overflow-hidden p-4 xl:p-5`}>
                          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Service Mix</div>
                          <div className="panel-scrollbar panel-scroll-fade mt-4 max-h-[170px] space-y-3 overflow-y-auto pr-1">
                            {serviceBreakdown.map((item) => (
                              <div key={`mix-${item.name}`}>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                  <span className="font-semibold text-white/78">{item.name}</span>
                                  <span className="font-black text-[#F2D26E]">{item.value}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/8">
                                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`${cardShell} grid place-items-center p-4 xl:p-5`}>
                          <div className="text-center">
                            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Resource Focus</div>
                            <div className="mt-3 text-[2.3rem] font-black text-[#F2D26E]">西南 / 中部</div>
                            <div className="mt-2 text-sm text-white/58">课业辅导、生活照料、健康探访</div>
                          </div>
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
