import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { MapChart, EffectScatterChart } from 'echarts/charts';
import { GeoComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import chinaJson from './data/china.json';

type ProvinceDatum = {
  name: string;
  value: number;
  childCount: number;
  elderlyCount: number;
  childNeed: string;
  elderlyNeed: string;
  childDetail: string;
  elderlyDetail: string;
};

const provinceServiceData: ProvinceDatum[] = [
  { name: '北京', value: 42, childCount: 18000, elderlyCount: 12000, childNeed: '心理陪伴', elderlyNeed: '健康探访', childDetail: '以城市流动家庭子女的情绪陪伴与课后支持为主。', elderlyDetail: '社区独居老人更需要定期健康探访和陪诊协助。' },
  { name: '天津', value: 38, childCount: 12000, elderlyCount: 9000, childNeed: '课业辅导', elderlyNeed: '生活照料', childDetail: '课后作业陪伴与阅读辅导需求更突出。', elderlyDetail: '高龄老人更需要日常照料与上门探视。' },
  { name: '河北', value: 55, childCount: 86000, elderlyCount: 64000, childNeed: '成长支持', elderlyNeed: '健康探访', childDetail: '县域儿童长期成长支持与陪伴链路需求更强。', elderlyDetail: '空巢老人集中在县乡区域，巡访与健康监测需求高。' },
  { name: '山西', value: 51, childCount: 54000, elderlyCount: 43000, childNeed: '课业辅导', elderlyNeed: '精神慰藉', childDetail: '山区儿童更需要稳定的课业辅导资源。', elderlyDetail: '留守老人精神陪伴和聊天慰藉需求明显。' },
  { name: '内蒙古', value: 44, childCount: 26000, elderlyCount: 21000, childNeed: '物资支持', elderlyNeed: '生活照料', childDetail: '偏远牧区儿童对物资和交通支持的依赖更强。', elderlyDetail: '地广人稀区域老人更需要上门照料服务。' },
  { name: '辽宁', value: 40, childCount: 22000, elderlyCount: 26000, childNeed: '心理陪伴', elderlyNeed: '健康探访', childDetail: '留守儿童更需要稳定沟通与心理疏导。', elderlyDetail: '老龄化程度高，健康巡访需求持续存在。' },
  { name: '吉林', value: 39, childCount: 18000, elderlyCount: 22000, childNeed: '课业辅导', elderlyNeed: '精神慰藉', childDetail: '课业支持与假期托管服务需求较强。', elderlyDetail: '寒冷地区独居老人更需要定期陪伴。' },
  { name: '黑龙江', value: 37, childCount: 16000, elderlyCount: 24000, childNeed: '成长支持', elderlyNeed: '生活照料', childDetail: '儿童长期成长跟踪支持需求明显。', elderlyDetail: '冬季居家照料与生活援助需求高。' },
  { name: '上海', value: 30, childCount: 9000, elderlyCount: 11000, childNeed: '心理陪伴', elderlyNeed: '健康探访', childDetail: '儿童更需要适应型陪伴与情绪支持。', elderlyDetail: '社区老人更偏向健康随访和陪诊。' },
  { name: '江苏', value: 46, childCount: 44000, elderlyCount: 39000, childNeed: '课业辅导', elderlyNeed: '健康探访', childDetail: '县域儿童对学习辅导与阅读支持需求高。', elderlyDetail: '老人慢病管理与日常探访需求稳定。' },
  { name: '浙江', value: 41, childCount: 26000, elderlyCount: 25000, childNeed: '心理陪伴', elderlyNeed: '精神慰藉', childDetail: '务工家庭子女更需要稳定的陪伴支持。', elderlyDetail: '独居老人更需要情感联结与社区互动。' },
  { name: '安徽', value: 58, childCount: 92000, elderlyCount: 70000, childNeed: '课业辅导', elderlyNeed: '生活照料', childDetail: '农村儿童对基础学业辅导的需求持续居高。', elderlyDetail: '高龄留守老人生活照料与代办服务需求明显。' },
  { name: '福建', value: 43, childCount: 31000, elderlyCount: 22000, childNeed: '成长支持', elderlyNeed: '健康探访', childDetail: '沿海返乡流动导致儿童成长陪伴需求增加。', elderlyDetail: '山海分布地区老人健康探访半径较大。' },
  { name: '江西', value: 59, childCount: 78000, elderlyCount: 58000, childNeed: '课业辅导', elderlyNeed: '精神慰藉', childDetail: '乡镇学校周边课后辅导与阅读陪伴需求突出。', elderlyDetail: '留守老人长期独居，精神慰藉需求强。' },
  { name: '山东', value: 47, childCount: 42000, elderlyCount: 41000, childNeed: '心理陪伴', elderlyNeed: '健康探访', childDetail: '青春期儿童对心理支持和家庭沟通辅导需求更高。', elderlyDetail: '乡村老人慢病随访与巡诊需求稳定。' },
  { name: '河南', value: 63, childCount: 118000, elderlyCount: 86000, childNeed: '课业辅导', elderlyNeed: '生活照料', childDetail: '大量县域儿童最需要连续、低门槛的课业辅导。', elderlyDetail: '高龄老人分布广，生活照料和代办服务需求高。' },
  { name: '湖北', value: 56, childCount: 64000, elderlyCount: 52000, childNeed: '成长支持', elderlyNeed: '健康探访', childDetail: '留守儿童更需要长期成长跟进与假期支持。', elderlyDetail: '乡镇老人最需要固定频次的探访和体检提醒。' },
  { name: '湖南', value: 61, childCount: 98000, elderlyCount: 72000, childNeed: '课业辅导', elderlyNeed: '精神慰藉', childDetail: '山区和库区儿童更需要学习陪伴与阅读支持。', elderlyDetail: '留守老人情感支持和上门关怀需求强。' },
  { name: '广东', value: 45, childCount: 52000, elderlyCount: 35000, childNeed: '心理陪伴', elderlyNeed: '健康探访', childDetail: '流动儿童群体更偏向情绪陪伴和适应辅导。', elderlyDetail: '城郊老人最需要定期探访和健康咨询。' },
  { name: '广西', value: 60, childCount: 74000, elderlyCount: 50000, childNeed: '课业辅导', elderlyNeed: '生活照料', childDetail: '边远山区儿童对基础教育支持需求最为明显。', elderlyDetail: '村寨老人更需要生活照料与物资补给。' },
  { name: '海南', value: 35, childCount: 9000, elderlyCount: 8000, childNeed: '成长支持', elderlyNeed: '精神慰藉', childDetail: '儿童长期陪伴与暑期陪护需求更突出。', elderlyDetail: '小范围分散老人更需要定期探视。' },
  { name: '重庆', value: 57, childCount: 46000, elderlyCount: 39000, childNeed: '课业辅导', elderlyNeed: '健康探访', childDetail: '山地儿童通学压力大，课业辅导需求高。', elderlyDetail: '山区老人探访与陪诊协助需求明显。' },
  { name: '四川', value: 65, childCount: 132000, elderlyCount: 94000, childNeed: '课业辅导', elderlyNeed: '生活照料', childDetail: '留守儿童数量大，最急迫的是持续课业辅导。', elderlyDetail: '偏远乡镇老人更需要生活照料和定期入户。' },
  { name: '贵州', value: 68, childCount: 88000, elderlyCount: 57000, childNeed: '成长支持', elderlyNeed: '生活照料', childDetail: '山地县域儿童更需要长期成长支持和心理陪伴。', elderlyDetail: '交通不便区域老人最需要日常照料与物资支持。' },
  { name: '云南', value: 62, childCount: 76000, elderlyCount: 51000, childNeed: '课业辅导', elderlyNeed: '健康探访', childDetail: '边远地区儿童在课业陪伴和双语支持上需求明显。', elderlyDetail: '分散村落老人更需要健康巡访与陪诊。' },
  { name: '西藏', value: 28, childCount: 5000, elderlyCount: 4000, childNeed: '物资支持', elderlyNeed: '健康探访', childDetail: '高海拔地区儿童更需要基础物资与学习支持。', elderlyDetail: '老人就医半径大，健康探访价值更高。' },
  { name: '陕西', value: 49, childCount: 42000, elderlyCount: 31000, childNeed: '课业辅导', elderlyNeed: '精神慰藉', childDetail: '关中周边县域儿童最需要稳定课业辅导。', elderlyDetail: '独居老人更需要定期沟通与情绪陪伴。' },
  { name: '甘肃', value: 58, childCount: 48000, elderlyCount: 36000, childNeed: '物资支持', elderlyNeed: '生活照料', childDetail: '西部县域儿童对学习物资与陪伴支持需求高。', elderlyDetail: '老人生活照料和冬季援助需求更突出。' },
  { name: '青海', value: 33, childCount: 6000, elderlyCount: 5000, childNeed: '成长支持', elderlyNeed: '健康探访', childDetail: '高原地区儿童更需要长期陪伴型服务。', elderlyDetail: '老人更需要定期巡诊和随访。' },
  { name: '宁夏', value: 36, childCount: 8000, elderlyCount: 7000, childNeed: '课业辅导', elderlyNeed: '精神慰藉', childDetail: '课后辅导和阅读空间支持更急迫。', elderlyDetail: '独居老人更需要陪伴与回访。' },
  { name: '新疆', value: 34, childCount: 11000, elderlyCount: 9000, childNeed: '物资支持', elderlyNeed: '生活照料', childDetail: '地域跨度大，儿童服务更依赖物资和点位支持。', elderlyDetail: '老人更需要上门照料和代办服务。' },
  { name: '台湾', value: 22, childCount: 3000, elderlyCount: 2500, childNeed: '心理陪伴', elderlyNeed: '健康探访', childDetail: '以陪伴与社区支持型需求为主。', elderlyDetail: '老人更需要慢病管理与探访。' },
  { name: '香港', value: 18, childCount: 1200, elderlyCount: 1600, childNeed: '成长支持', elderlyNeed: '精神慰藉', childDetail: '儿童陪伴需求集中在社区支持项目。', elderlyDetail: '老人更需要情感关怀和探访。' },
  { name: '澳门', value: 16, childCount: 600, elderlyCount: 700, childNeed: '心理陪伴', elderlyNeed: '健康探访', childDetail: '儿童需求以陪伴和社区活动为主。', elderlyDetail: '老人更偏向健康探访和陪诊。' },
];

const provinceDataMap = new Map(provinceServiceData.map((item) => [item.name, item]));
const keyProvinceCoordinates: Record<string, [number, number]> = {
  四川: [104.06, 30.67],
  贵州: [106.71, 26.57],
  河南: [113.62, 34.75],
  云南: [102.71, 25.04],
  湖南: [112.98, 28.2],
  广西: [108.32, 22.82],
};

type ProvinceServiceMapProps = {
  className?: string;
};

let chinaMapRegistered = false;

echarts.use([MapChart, EffectScatterChart, GeoComponent, TooltipComponent, VisualMapComponent, CanvasRenderer] as any);

if (!chinaMapRegistered) {
  echarts.registerMap('china-service-map', chinaJson as any);
  chinaMapRegistered = true;
}

export default function ProvinceServiceMap({ className = '' }: ProvinceServiceMapProps) {
  const [selectedProvince, setSelectedProvince] = useState<ProvinceDatum>(provinceServiceData.find((item) => item.name === '四川') || provinceServiceData[0]);

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(14, 6, 6, 0.94)',
        borderColor: 'rgba(212,175,55,0.35)',
        borderWidth: 1,
        padding: 0,
        extraCssText: 'backdrop-filter: blur(14px); box-shadow: 0 18px 48px rgba(0,0,0,0.45); border-radius: 18px; overflow: hidden;',
        formatter: (params: any) => {
          const datum = provinceDataMap.get(params.name);
          if (!datum) return params.name;
          return `
            <div style="padding:14px 16px; min-width: 240px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <div style="font-size:16px;font-weight:800;color:#ffffff;">${datum.name}</div>
                <div style="font-size:11px;font-weight:700;color:#D4AF37;">服务指数 ${datum.value}</div>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.56);margin-bottom:10px;">鼠标悬停可快速查看当前省份重点服务方向</div>
              <div style="display:grid;gap:8px;">
                <div style="padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">
                  <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.42);margin-bottom:4px;">留守儿童</div>
                  <div style="font-size:15px;font-weight:800;color:#fff5d4;">${datum.childNeed}</div>
                  <div style="margin-top:4px;font-size:12px;color:rgba(255,255,255,0.72);line-height:1.5;">${datum.childDetail}</div>
                </div>
                <div style="padding:10px 12px;border-radius:12px;background:rgba(139,0,0,0.14);border:1px solid rgba(212,175,55,0.15);">
                  <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.42);margin-bottom:4px;">留守老人</div>
                  <div style="font-size:15px;font-weight:800;color:#ffd6d8;">${datum.elderlyNeed}</div>
                  <div style="margin-top:4px;font-size:12px;color:rgba(255,255,255,0.72);line-height:1.5;">${datum.elderlyDetail}</div>
                </div>
              </div>
            </div>
          `;
        },
      },
      geo: {
        map: 'china-service-map',
        roam: false,
        layoutCenter: ['41%', '53%'],
        layoutSize: '96%',
        itemStyle: {
          areaColor: 'rgba(61, 10, 14, 0.95)',
          borderColor: 'rgba(255, 228, 161, 0.22)',
          borderWidth: 1,
          shadowBlur: 24,
          shadowColor: 'rgba(0,0,0,0.24)',
        },
        emphasis: {
          itemStyle: {
            areaColor: '#98202b',
            borderColor: '#f1d57b',
            borderWidth: 1.8,
            shadowBlur: 32,
            shadowColor: 'rgba(212,175,55,0.34)',
          },
          label: { show: false },
        },
        select: {
          itemStyle: {
            areaColor: '#9e1520',
            borderColor: '#f5dfa0',
          },
        },
      },
      series: [
        {
          type: 'map',
          map: 'china-service-map',
          geoIndex: 0,
          top: 8,
          left: 0,
          right: 0,
          bottom: 8,
          silent: true,
          itemStyle: {
            areaColor: 'rgba(25, 5, 6, 0.84)',
            borderColor: 'rgba(0,0,0,0)',
            shadowColor: 'rgba(0,0,0,0.4)',
            shadowBlur: 18,
          },
          emphasis: { disabled: true },
          data: provinceServiceData,
        },
        {
          name: '省级服务地图',
          type: 'map',
          map: 'china-service-map',
          geoIndex: 0,
          data: provinceServiceData,
          label: { show: false },
          itemStyle: {
            areaColor: 'rgba(104, 18, 24, 0.92)',
            borderColor: 'rgba(255,239,198,0.24)',
            borderWidth: 1,
          },
          emphasis: {
            label: { show: false },
            itemStyle: {
              areaColor: '#b01e2b',
              borderColor: '#ffe29a',
              borderWidth: 1.8,
              shadowColor: 'rgba(212,175,55,0.42)',
              shadowBlur: 28,
            },
          },
          select: {
            itemStyle: {
              areaColor: '#a41825',
              borderColor: '#fff2c3',
            },
          },
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          rippleEffect: {
            brushType: 'stroke',
            scale: 3.4,
          },
          symbolSize: 10,
          itemStyle: {
            color: '#F4D572',
            shadowBlur: 16,
            shadowColor: 'rgba(212,175,55,0.7)',
          },
          data: Object.entries(keyProvinceCoordinates).map(([name, value]) => ({
            name,
            value: [...value, provinceDataMap.get(name)?.value || 0],
          })),
        },
      ],
      visualMap: {
        type: 'continuous',
        min: 15,
        max: 68,
        orient: 'horizontal',
        left: 28,
        bottom: 20,
        itemWidth: 90,
        itemHeight: 8,
        text: ['服务压力高', '服务压力低'],
        textStyle: {
          color: 'rgba(255,255,255,0.68)',
          fontSize: 11,
          fontWeight: 700,
        },
        inRange: {
          color: ['#3f0d10', '#6d1118', '#8b0000', '#b8232f', '#d4af37'],
        },
        calculable: false,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(15,6,6,0.34)',
      },
    }),
    []
  );

  const onEvents = useMemo(
    () => ({
      mouseover: (params: any) => {
        const datum = provinceDataMap.get(params.name);
        if (datum) setSelectedProvince(datum);
      },
    }),
    []
  );

  return (
    <div className={`grid h-full gap-4 xl:grid-cols-[1.58fr_0.62fr] ${className}`}>
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,8,10,0.94),rgba(14,5,6,0.96))] shadow-[0_40px_100px_rgba(0,0,0,0.32)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(212,175,55,0.1),transparent_24%),radial-gradient(circle_at_72%_76%,rgba(139,0,0,0.34),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]" />
        <div className="relative z-10 flex items-center justify-between px-7 pt-5">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/38">Province Service Map</div>
            <h3 className="mt-2 text-[1.7rem] font-black text-white">中国省级服务地图</h3>
            <p className="mt-2 max-w-[460px] text-sm leading-6 text-white/58">
              鼠标移入省份即可查看当前省域里留守儿童与留守老人最需要的服务方向。
            </p>
          </div>
          <div className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold text-[#F4E0A3]">
            Hover to Inspect
          </div>
        </div>

        <div className="relative z-10 min-h-[420px] flex-1 px-1 pb-3 pt-1">
          <ReactECharts
            option={option}
            notMerge
            lazyUpdate={false}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'canvas' }}
            onEvents={onEvents}
            onChartReady={(chart) => {
              chart.resize();
            }}
          />
        </div>
      </div>

      <div className="panel-scrollbar panel-scroll-fade flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur-[24px] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/35">Focused Province</div>
          <div className="mt-1 flex items-end justify-between gap-4">
            <div>
              <h4 className="text-[1.8rem] font-black text-white">{selectedProvince.name}</h4>
              <div className="mt-1 text-xs text-white/55">当前省份服务关注度 {selectedProvince.value}</div>
            </div>
            <div className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-bold text-[#F2D98B]">
              实时焦点
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">留守儿童最需要的服务</div>
              <div className="mt-2 text-[1.3rem] font-black text-[#fff2c6]">{selectedProvince.childNeed}</div>
              <div className="mt-1 text-xs leading-6 text-white/68">{selectedProvince.childDetail}</div>
              <div className="mt-2 text-xs text-white/45">当前覆盖儿童约 {selectedProvince.childCount.toLocaleString()} 人</div>
            </div>

            <div className="rounded-[22px] border border-[#D4AF37]/12 bg-[linear-gradient(180deg,rgba(139,0,0,0.18),rgba(255,255,255,0.03))] p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">留守老人最需要的服务</div>
              <div className="mt-2 text-[1.3rem] font-black text-[#ffd7da]">{selectedProvince.elderlyNeed}</div>
              <div className="mt-1 text-xs leading-6 text-white/68">{selectedProvince.elderlyDetail}</div>
              <div className="mt-2 text-xs text-white/45">当前覆盖老人约 {selectedProvince.elderlyCount.toLocaleString()} 人</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-[24px]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">儿童服务重点</div>
            <div className="mt-2 space-y-2 text-xs text-white/72">
              <div>课业辅导在中西部省份需求最集中。</div>
              <div>心理陪伴在流动人口输出省份持续上升。</div>
              <div>成长支持更适合做长期结对服务。</div>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-[24px]">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">老人服务重点</div>
            <div className="mt-2 space-y-2 text-xs text-white/72">
              <div>生活照料在西南与中部山区需求最高。</div>
              <div>健康探访适合作为高频入户服务。</div>
              <div>精神慰藉适合与社区陪伴计划结合。</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
