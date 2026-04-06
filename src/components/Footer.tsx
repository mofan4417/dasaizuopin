import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0A0505]/60 backdrop-blur-[40px] text-white/50 py-20 px-4 md:px-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#8B0000] rounded-sm flex items-center justify-center text-white font-black text-[8px] border border-white/10">CMO</div>
            <span className="text-xl font-black tracking-tight text-white">乡助桥</span>
          </div>
          <p className="text-sm leading-relaxed">
            连接城市大学生与乡村留守群体，让每一份陪伴都充满温度。
          </p>
        </div>

        <div>
          <h4 className="text-white font-black mb-6">快速链接</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/" className="hover:text-[#D4AF37] transition-colors">首页</Link></li>
            <li><Link to="/what-we-do" className="hover:text-[#D4AF37] transition-colors">我们做什么</Link></li>
            <li><Link to="/service-objects" className="hover:text-[#D4AF37] transition-colors">服务对象</Link></li>
            <li><Link to="/service-results" className="hover:text-[#D4AF37] transition-colors">服务成果</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black mb-6">联系我们</h4>
          <ul className="space-y-4 text-sm">
            <li>邮箱：2339832360@qq.com</li>
            <li>电话：15228883259</li>
            <li>地址：宜宾学院临港校区</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-black mb-6">管理入口</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/admin/login" className="hover:text-[#D4AF37] transition-colors">管理者登录系统</Link></li>
            <li><Link to="/privacy" className="hover:text-[#D4AF37] transition-colors">隐私政策</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
        <p>© 2026 乡助桥项目团队. All rights reserved.</p>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
          <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></span>
          <span>提供技术支持</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
