-- 完善网站内容管理表
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入初始配置
INSERT INTO site_content (key, value, description) VALUES 
('hero_image', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A+serene+forest+landscape+with+sunlight+filtering+through+tall+trees%2C+dreamy+and+peaceful+atmosphere%2C+high+quality%2C+cinematic+lighting&image_size=landscape_16_9', '首页大图'),
('service_photo_1', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Coastal+rocks+with+crashing+waves+at+sunset&image_size=square', '服务瞬间1'),
('service_photo_2', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Sea+with+icebergs+and+snowy+mountains&image_size=square', '服务瞬间2'),
('service_photo_3', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Coastal+cliffs+at+dawn&image_size=square', '服务瞬间3'),
('hero_quote_1', '“爱之花开放的地方，生命便能欣欣向荣”', '首页引言1'),
('hero_author_1', '梵高', '首页作者1'),
('hero_quote_2', '“爱能使伟大的灵魂变得更伟大”', '首页引言2'),
('hero_author_2', '德·席勒', '首页作者2')
ON CONFLICT (key) DO NOTHING;

-- 允许匿名访问
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'site_content_read_policy' AND tablename = 'site_content'
    ) THEN
        CREATE POLICY "site_content_read_policy" ON site_content FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'site_content_manage_policy' AND tablename = 'site_content'
    ) THEN
        CREATE POLICY "site_content_manage_policy" ON site_content FOR ALL USING (true);
    END IF;
END $$;

-- 确保网站统计表有初始数据且支持更新
INSERT INTO website_stats (stat_date, page_views, total_served, total_hours, total_villages)
VALUES (CURRENT_DATE, 0, 156, 2340, 12)
ON CONFLICT (stat_date) DO NOTHING;
