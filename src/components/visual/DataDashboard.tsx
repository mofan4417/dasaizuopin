import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

// 模拟数据生成函数
const generateMockData = () => {
  // 基础数据
  const baseVolunteers = 1284;
  const baseHours = 45920;
  const baseBeneficiaries = 342;
  
  // 生成最近7天的趋势数据
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    // 添加一些随机波动
    const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // 0.9-1.1之间的随机因子
    
    return {
      date: dateStr,
      volunteers: Math.round(baseVolunteers * randomFactor),
      hours: Math.round(baseHours * randomFactor),
      beneficiaries: Math.round(baseBeneficiaries * randomFactor)
    };
  });
  
  // 生成年龄段分布数据
  const ageDistribution = [
    { name: '18-25岁', value: 65 },
    { name: '26-35岁', value: 25 },
    { name: '36-45岁', value: 8 },
    { name: '46岁以上', value: 2 }
  ];
  
  // 生成服务类型分布数据
  const serviceTypeDistribution = [
    { name: '学业辅导', value: 35 },
    { name: '心理疏导', value: 25 },
    { name: '生活照料', value: 20 },
    { name: '健康检查', value: 15 },
    { name: '其他服务', value: 5 }
  ];
  
  return {
    current: {
      volunteers: baseVolunteers,
      hours: baseHours,
      beneficiaries: baseBeneficiaries,
      averageHours: Math.round(baseHours / baseVolunteers)
    },
    trend: trendData,
    ageDistribution,
    serviceTypeDistribution
  };
};

const DataDashboard = () => {
  const [data, setData] = useState(generateMockData());
  
  // 每5秒更新一次数据，模拟实时数据
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  };
  
  // 趋势图配置
  const trendChartOption = {
    backgroundColor: 'transparent',
    title: {
      text: '平台运行趋势',
      textStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(139, 0, 0, 0.5)'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: 'rgba(10, 5, 5, 0.9)'
        }
      },
      backgroundColor: 'rgba(10, 5, 5, 0.9)',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      }
    },
    legend: {
      data: ['志愿者数', '服务时长', '受益人数'],
      textStyle: {
        color: '#ffffff',
        fontSize: 10
      },
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.trend.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '志愿者数',
        type: 'line',
        stack: 'Total',
        data: data.trend.map(item => item.volunteers),
        lineStyle: {
          color: '#D4AF37'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(212, 175, 55, 0.3)'
            }, {
              offset: 1, color: 'rgba(212, 175, 55, 0.05)'
            }]
          }
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#D4AF37'
        }
      },
      {
        name: '服务时长',
        type: 'line',
        stack: 'Total',
        data: data.trend.map(item => item.hours),
        lineStyle: {
          color: '#8B0000'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(139, 0, 0, 0.3)'
            }, {
              offset: 1, color: 'rgba(139, 0, 0, 0.05)'
            }]
          }
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#8B0000'
        }
      },
      {
        name: '受益人数',
        type: 'line',
        stack: 'Total',
        data: data.trend.map(item => item.beneficiaries),
        lineStyle: {
          color: '#722F37'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(114, 47, 55, 0.3)'
            }, {
              offset: 1, color: 'rgba(114, 47, 55, 0.05)'
            }]
          }
        },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#722F37'
        }
      }
    ]
  };
  
  // 年龄段分布饼图配置
  const ageChartOption = {
    backgroundColor: 'transparent',
    title: {
      text: '志愿者年龄段分布',
      textStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(139, 0, 0, 0.5)'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
      backgroundColor: 'rgba(10, 5, 5, 0.9)',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 10
      }
    },
    series: [
      {
        name: '年龄段',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(0, 0, 0, 0.3)',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold',
            color: '#ffffff'
          }
        },
        labelLine: {
          show: false
        },
        data: data.ageDistribution,
        color: ['#D4AF37', '#8B0000', '#722F37', '#4A1515']
      }
    ]
  };
  
  // 服务类型分布饼图配置
  const serviceChartOption = {
    backgroundColor: 'transparent',
    title: {
      text: '服务类型分布',
      textStyle: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textShadow: '0 0 10px rgba(139, 0, 0, 0.5)'
      },
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
      backgroundColor: 'rgba(10, 5, 5, 0.9)',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 10
      }
    },
    series: [
      {
        name: '服务类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(0, 0, 0, 0.3)',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
            fontWeight: 'bold',
            color: '#ffffff'
          }
        },
        labelLine: {
          show: false
        },
        data: data.serviceTypeDistribution,
        color: ['#D4AF37', '#8B0000', '#722F37', '#4A1515', '#2D0A0A']
      }
    ]
  };
  
  return (
    <div className="w-full space-y-6">
      {/* 数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[24px] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <div className="text-xs text-white/40 uppercase tracking-[0.2em] font-black mb-2">实时志愿者</div>
          <div className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {formatNumber(data.current.volunteers)}
          </div>
          <div className="text-xs text-[#D4AF37] mt-2">较昨日 +2.5%</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[24px] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <div className="text-xs text-white/40 uppercase tracking-[0.2em] font-black mb-2">累计服务时长</div>
          <div className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {formatNumber(data.current.hours)}h
          </div>
          <div className="text-xs text-[#D4AF37] mt-2">较昨日 +5.8%</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[24px] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <div className="text-xs text-white/40 uppercase tracking-[0.2em] font-black mb-2">受益人数</div>
          <div className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {formatNumber(data.current.beneficiaries)}
          </div>
          <div className="text-xs text-[#D4AF37] mt-2">较昨日 +3.2%</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[24px] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <div className="text-xs text-white/40 uppercase tracking-[0.2em] font-black mb-2">人均服务时长</div>
          <div className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {data.current.averageHours}h
          </div>
          <div className="text-xs text-[#D4AF37] mt-2">较昨日 +0.8%</div>
        </div>
      </div>
      
      {/* 图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[24px] p-4 shadow-[0_32px_64px_rgba(0,0,0,0.5)] lg:col-span-2">
          <ReactECharts
            option={trendChartOption}
            style={{ width: '100%', height: '300px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
        
        <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[24px] p-4 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <ReactECharts
            option={ageChartOption}
            style={{ width: '100%', height: '300px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[24px] p-4 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        <ReactECharts
          option={serviceChartOption}
          style={{ width: '100%', height: '300px' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
};

export default DataDashboard;