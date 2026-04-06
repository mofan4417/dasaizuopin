import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

// 注册中国地图
import chinaJson from './data/china.json';

// 中国地图数据（模拟真实数据）
const elderlyData = [
  { name: '北京', value: 25, count: 250000 },
  { name: '天津', value: 20, count: 180000 },
  { name: '河北', value: 50, count: 500000 },
  { name: '山西', value: 45, count: 350000 },
  { name: '内蒙古', value: 35, count: 200000 },
  { name: '辽宁', value: 30, count: 280000 },
  { name: '吉林', value: 28, count: 220000 },
  { name: '黑龙江', value: 32, count: 250000 },
  { name: '上海', value: 22, count: 300000 },
  { name: '江苏', value: 35, count: 400000 },
  { name: '浙江', value: 30, count: 350000 },
  { name: '安徽', value: 45, count: 450000 },
  { name: '福建', value: 38, count: 300000 },
  { name: '江西', value: 50, count: 380000 },
  { name: '山东', value: 40, count: 450000 },
  { name: '河南', value: 55, count: 550000 },
  { name: '湖北', value: 48, count: 400000 },
  { name: '湖南', value: 52, count: 420000 },
  { name: '广东', value: 42, count: 480000 },
  { name: '广西', value: 55, count: 350000 },
  { name: '海南', value: 30, count: 80000 },
  { name: '重庆', value: 45, count: 280000 },
  { name: '四川', value: 50, count: 500000 },
  { name: '贵州', value: 60, count: 320000 },
  { name: '云南', value: 55, count: 300000 },
  { name: '西藏', value: 20, count: 30000 },
  { name: '陕西', value: 45, count: 350000 },
  { name: '甘肃', value: 50, count: 280000 },
  { name: '青海', value: 25, count: 40000 },
  { name: '宁夏', value: 35, count: 50000 },
  { name: '新疆', value: 30, count: 120000 },
  { name: '台湾', value: 25, count: 35000 },
  { name: '香港', value: 22, count: 18000 },
  { name: '澳门', value: 20, count: 8000 }
];

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

const AdvancedChinaMap = () => {
  const [chartOption, setChartOption] = useState<any>({});

  useEffect(() => {
    // 注册中国地图
    echarts.registerMap('china', chinaJson as any);
    
    // 初始化地图配置
    const option = {
      backgroundColor: 'transparent',
      title: {
        text: '中国留守老人分布',
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
        formatter: (params: any) => {
          const data = params.data;
          return `
            <div style="padding: 12px; border-radius: 10px; background: linear-gradient(135deg, rgba(10, 5, 5, 0.95), rgba(20, 10, 10, 0.9)); border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);">
              <div style="font-weight: bold; color: #ffffff; margin-bottom: 6px; font-size: 14px; text-align: center;">${data.name}</div>
              <div style="color: #D4AF37; margin-bottom: 3px; font-size: 12px;">留守老人数量: <span style="color: #ffffff; font-weight: bold;">${formatNumber(data.count)}</span></div>
              <div style="color: #D4AF37; font-size: 12px;">留守比例: <span style="color: #ffffff; font-weight: bold;">${data.value}%</span></div>
            </div>
          `;
        },
        backgroundColor: 'transparent',
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff'
        },
        padding: 12
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max: 60,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        textStyle: {
          color: '#ffffff',
          fontSize: 10,
          textShadow: '0 0 5px rgba(0, 0, 0, 0.8)'
        },
        calculable: true,
        inRange: {
          color: ['#FFEBEB', '#FF8A8A', '#FF5252', '#FF1744', '#D50000', '#8B0000']
        },
        itemWidth: 8,
        itemHeight: 100,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        backgroundColor: 'rgba(10, 5, 5, 0.3)',
        borderRadius: 4
      },
      series: [
        {
          name: '留守老人',
          type: 'map',
          map: 'china',
          roam: true, // 支持缩放和拖拽
          zoom: 1, // 初始缩放级别
          center: [104.195, 35.861], // 初始中心点
          label: {
            show: true,
            fontSize: 8,
            color: '#ffffff',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(0, 0, 0, 0.8)'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              color: '#D4AF37',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
            },
            itemStyle: {
              areaColor: '#8B0000',
              borderColor: '#D4AF37',
              borderWidth: 2,
              shadowColor: 'rgba(212, 175, 55, 0.5)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            areaColor: 'rgba(139, 0, 0, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 5
          },
          data: elderlyData
        }
      ]
    };

    setChartOption(option);
  }, []);

  return (
    <div className="w-full h-full">
      <ReactECharts
        option={chartOption}
        style={{ width: '100%', height: '350px' }}
        opts={{
          renderer: 'canvas'
        }}
      />
    </div>
  );
};

export default AdvancedChinaMap;