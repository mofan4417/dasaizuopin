-- 创建服务对象表
CREATE TABLE service_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(10) CHECK (type IN ('elderly', 'child')) NOT NULL,
    age INTEGER CHECK (age > 0 AND age < 150),
    village VARCHAR(100) NOT NULL,
    situation TEXT NOT NULL,
    needs TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'completed')),
    claimed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建志愿者申请表
CREATE TABLE volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    college_major VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    available_time VARCHAR(50) NOT NULL,
    object_code VARCHAR(20),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建网站内容管理表
CREATE TABLE website_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) CHECK (content_type IN ('hero_image', 'service_photo', 'stats_info')) NOT NULL,
    content_path TEXT NOT NULL,
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建网站统计表
CREATE TABLE website_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_served INTEGER DEFAULT 156,
    total_hours INTEGER DEFAULT 2340,
    total_villages INTEGER DEFAULT 12,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE service_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_stats ENABLE ROW LEVEL SECURITY;

-- 设置访问策略 (RLS)

-- 1. service_objects: 所有人可以读, 所有人可以添加 (政府/家属需求), 只有认证用户可以修改
CREATE POLICY "Enable read for all" ON service_objects FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON service_objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated" ON service_objects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated" ON service_objects FOR DELETE TO authenticated USING (true);

-- 2. volunteer_applications: 所有人可以添加, 只有认证用户可以读/写
CREATE POLICY "Enable insert for all" ON volunteer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable manage for authenticated" ON volunteer_applications FOR ALL TO authenticated USING (true);

-- 3. website_content: 所有人可以读, 只有认证用户可以管理
CREATE POLICY "Enable read for all" ON website_content FOR SELECT USING (true);
CREATE POLICY "Enable manage for authenticated" ON website_content FOR ALL TO authenticated USING (true);

-- 4. website_stats: 所有人可以读, 所有人可以增加访问量 (通过函数或直接更新), 认证用户可以管理
CREATE POLICY "Enable read for all" ON website_stats FOR SELECT USING (true);
CREATE POLICY "Enable update for all" ON website_stats FOR UPDATE USING (true);
CREATE POLICY "Enable manage for authenticated" ON website_stats FOR ALL TO authenticated USING (true);

-- 授予匿名和认证用户权限
GRANT SELECT, INSERT ON service_objects TO anon, authenticated;
GRANT UPDATE, DELETE ON service_objects TO authenticated;

GRANT INSERT ON volunteer_applications TO anon, authenticated;
GRANT ALL ON volunteer_applications TO authenticated;

GRANT SELECT ON website_content TO anon, authenticated;
GRANT ALL ON website_content TO authenticated;

GRANT SELECT, UPDATE ON website_stats TO anon, authenticated;
GRANT ALL ON website_stats TO authenticated;

-- 初始统计数据
INSERT INTO website_stats (stat_date, total_served, total_hours, total_villages) 
VALUES (CURRENT_DATE, 156, 2340, 12)
ON CONFLICT (stat_date) DO NOTHING;
