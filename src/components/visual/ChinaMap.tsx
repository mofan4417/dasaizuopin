import { useState } from 'react';

// 模拟数据：省份留守儿童和老人的程度（0-100）
const childrenData = {
  '北京': 20,
  '天津': 15,
  '河北': 45,
  '山西': 35,
  '内蒙古': 30,
  '辽宁': 25,
  '吉林': 22,
  '黑龙江': 28,
  '上海': 18,
  '江苏': 30,
  '浙江': 25,
  '安徽': 40,
  '福建': 32,
  '江西': 45,
  '山东': 35,
  '河南': 50,
  '湖北': 42,
  '湖南': 48,
  '广东': 38,
  '广西': 52,
  '海南': 25,
  '重庆': 40,
  '四川': 45,
  '贵州': 55,
  '云南': 50,
  '西藏': 15,
  '陕西': 40,
  '甘肃': 45,
  '青海': 20,
  '宁夏': 30,
  '新疆': 25
};

const elderlyData = {
  '北京': 25,
  '天津': 20,
  '河北': 50,
  '山西': 45,
  '内蒙古': 35,
  '辽宁': 30,
  '吉林': 28,
  '黑龙江': 32,
  '上海': 22,
  '江苏': 35,
  '浙江': 30,
  '安徽': 45,
  '福建': 38,
  '江西': 50,
  '山东': 40,
  '河南': 55,
  '湖北': 48,
  '湖南': 52,
  '广东': 42,
  '广西': 55,
  '海南': 30,
  '重庆': 45,
  '四川': 50,
  '贵州': 60,
  '云南': 55,
  '西藏': 20,
  '陕西': 45,
  '甘肃': 50,
  '青海': 25,
  '宁夏': 35,
  '新疆': 30
};

// 模拟数据：省份留守儿童和老人的具体数量
const childrenCountData = {
  '北京': 12000,
  '天津': 8000,
  '河北': 450000,
  '山西': 280000,
  '内蒙古': 150000,
  '辽宁': 180000,
  '吉林': 120000,
  '黑龙江': 160000,
  '上海': 10000,
  '江苏': 200000,
  '浙江': 150000,
  '安徽': 350000,
  '福建': 180000,
  '江西': 320000,
  '山东': 300000,
  '河南': 500000,
  '湖北': 280000,
  '湖南': 350000,
  '广东': 320000,
  '广西': 400000,
  '海南': 50000,
  '重庆': 180000,
  '四川': 400000,
  '贵州': 450000,
  '云南': 380000,
  '西藏': 8000,
  '陕西': 250000,
  '甘肃': 280000,
  '青海': 20000,
  '宁夏': 30000,
  '新疆': 80000
};

const elderlyCountData = {
  '北京': 250000,
  '天津': 180000,
  '河北': 500000,
  '山西': 350000,
  '内蒙古': 200000,
  '辽宁': 280000,
  '吉林': 220000,
  '黑龙江': 250000,
  '上海': 300000,
  '江苏': 400000,
  '浙江': 350000,
  '安徽': 450000,
  '福建': 300000,
  '江西': 380000,
  '山东': 450000,
  '河南': 550000,
  '湖北': 400000,
  '湖南': 420000,
  '广东': 480000,
  '广西': 350000,
  '海南': 80000,
  '重庆': 280000,
  '四川': 500000,
  '贵州': 320000,
  '云南': 300000,
  '西藏': 30000,
  '陕西': 350000,
  '甘肃': 280000,
  '青海': 40000,
  '宁夏': 50000,
  '新疆': 120000
};

// 中国地图SVG路径（简化版）
const ChinaMapSVG = () => {
  const [activeType, setActiveType] = useState<'children' | 'elderly'>('children');
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const getColor = (province: string) => {
    const data = activeType === 'children' ? childrenData : elderlyData;
    const value = data[province as keyof typeof data] || 0;
    // 根据值计算红色的深浅
    const intensity = value / 100;
    const red = Math.floor(255 * intensity);
    const green = Math.floor(255 * (1 - intensity * 0.8));
    const blue = Math.floor(255 * (1 - intensity * 0.8));
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const handleMouseEnter = (province: string, event: React.MouseEvent) => {
    setHoveredProvince(province);
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setHoveredProvince(null);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setActiveType('children')}
          className={`px-4 py-2 rounded-full text-sm font-black transition-all ${activeType === 'children' ? 'bg-[#8B0000] text-white' : 'bg-white/5 text-white/40'}`}
        >
          留守儿童
        </button>
        <button
          onClick={() => setActiveType('elderly')}
          className={`px-4 py-2 rounded-full text-sm font-black transition-all ${activeType === 'elderly' ? 'bg-[#8B0000] text-white' : 'bg-white/5 text-white/40'}`}
        >
          留守老人
        </button>
      </div>
      
      <div className="relative w-full h-[400px] bg-white/5 rounded-2xl border border-white/10 p-4">
        <svg width="100%" height="100%" viewBox="0 0 1000 600" className="overflow-visible">
          {/* 简化的中国地图SVG路径 */}
          {/* 这里使用简化的路径，实际项目中应该使用完整的中国地图SVG */}
          <g>
            {/* 北部地区 */}
            <path 
              d="M100,100 L200,80 L300,100 L320,150 L280,200 L180,220 L100,180 Z" 
              fill={getColor('内蒙古')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('内蒙古', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M300,100 L400,80 L500,100 L520,150 L480,200 L380,220 L300,200 Z" 
              fill={getColor('黑龙江')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('黑龙江', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M300,200 L400,180 L500,200 L520,250 L480,300 L380,320 L300,300 Z" 
              fill={getColor('吉林')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('吉林', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M300,300 L400,280 L500,300 L520,350 L480,400 L380,420 L300,400 Z" 
              fill={getColor('辽宁')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('辽宁', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            
            {/* 中部地区 */}
            <path 
              d="M200,220 L300,200 L400,220 L450,280 L350,320 L250,300 Z" 
              fill={getColor('河北')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('河北', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M400,220 L500,200 L600,220 L650,280 L550,320 L450,300 Z" 
              fill={getColor('山东')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('山东', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M200,320 L300,300 L400,320 L450,380 L350,420 L250,400 Z" 
              fill={getColor('山西')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('山西', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M400,320 L500,300 L600,320 L650,380 L550,420 L450,400 Z" 
              fill={getColor('河南')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('河南', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            
            {/* 南部地区 */}
            <path 
              d="M200,420 L300,400 L400,420 L450,480 L350,520 L250,500 Z" 
              fill={getColor('湖北')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('湖北', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M400,420 L500,400 L600,420 L650,480 L550,520 L450,500 Z" 
              fill={getColor('湖南')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('湖南', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M200,520 L300,500 L400,520 L450,580 L350,580 L250,560 Z" 
              fill={getColor('广东')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('广东', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            
            {/* 西部地区 */}
            <path 
              d="M100,220 L200,200 L200,320 L100,340 L50,280 Z" 
              fill={getColor('陕西')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('陕西', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M100,340 L200,320 L200,420 L100,440 L50,380 Z" 
              fill={getColor('四川')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('四川', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M100,440 L200,420 L200,520 L100,540 L50,480 Z" 
              fill={getColor('云南')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('云南', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            
            {/* 东部地区 */}
            <path 
              d="M500,100 L600,80 L700,100 L720,150 L680,200 L580,220 L500,180 Z" 
              fill={getColor('江苏')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('江苏', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M600,100 L700,80 L800,100 L820,150 L780,200 L680,220 L600,180 Z" 
              fill={getColor('浙江')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('浙江', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
            <path 
              d="M700,100 L800,80 L900,100 L920,150 L880,200 L780,220 L700,180 Z" 
              fill={getColor('福建')} 
              stroke="white" 
              strokeWidth="1"
              onMouseEnter={(e) => handleMouseEnter('福建', e)}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              className="cursor-pointer hover:stroke-[#D4AF37] hover:stroke-width-2 transition-all"
            />
          </g>
        </svg>
        
        {/* 悬停信息卡片 */}
        {hoveredProvince && (
          <div 
            className="absolute bg-[#0A0505]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl z-10"
            style={{
              left: `${mousePosition.x + 10}px`,
              top: `${mousePosition.y + 10}px`,
              maxWidth: '200px'
            }}
          >
            <h4 className="font-black text-lg mb-2">{hoveredProvince}</h4>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-white/40">留守儿童</div>
                <div className="font-bold">{formatNumber(childrenCountData[hoveredProvince as keyof typeof childrenCountData] || 0)}</div>
                <div className="text-xs text-[#D4AF37]">{childrenData[hoveredProvince as keyof typeof childrenData] || 0}%</div>
              </div>
              <div>
                <div className="text-xs text-white/40">留守老人</div>
                <div className="font-bold">{formatNumber(elderlyCountData[hoveredProvince as keyof typeof elderlyCountData] || 0)}</div>
                <div className="text-xs text-[#D4AF37]">{elderlyData[hoveredProvince as keyof typeof elderlyData] || 0}%</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 图例 */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className="text-xs text-white/60 mr-2">程度</div>
          <div className="flex gap-1">
            <div className="w-6 h-6 bg-red-100 rounded-sm"></div>
            <div className="w-6 h-6 bg-red-300 rounded-sm"></div>
            <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
            <div className="w-6 h-6 bg-red-700 rounded-sm"></div>
            <div className="w-6 h-6 bg-red-900 rounded-sm"></div>
          </div>
          <div className="text-xs text-white/60 ml-2">严重</div>
        </div>
      </div>
    </div>
  );
};

export default ChinaMapSVG;