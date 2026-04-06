-- 访客提交留守对象信息（管理员后台审核后再加入 service_objects）

CREATE TABLE IF NOT EXISTS service_object_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('elderly', 'child')),
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  village VARCHAR(100) NOT NULL,
  situation TEXT NOT NULL,
  needs TEXT NOT NULL,
  contact_name VARCHAR(50),
  contact_phone VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_object_code VARCHAR(20),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE service_object_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'service_object_requests_insert_all' AND tablename = 'service_object_requests'
  ) THEN
    CREATE POLICY service_object_requests_insert_all ON service_object_requests
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'service_object_requests_select_all' AND tablename = 'service_object_requests'
  ) THEN
    CREATE POLICY service_object_requests_select_all ON service_object_requests
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'service_object_requests_update_all' AND tablename = 'service_object_requests'
  ) THEN
    CREATE POLICY service_object_requests_update_all ON service_object_requests
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'service_object_requests_delete_all' AND tablename = 'service_object_requests'
  ) THEN
    CREATE POLICY service_object_requests_delete_all ON service_object_requests
      FOR DELETE USING (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON service_object_requests TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_service_object_requests_status ON service_object_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_object_requests_created_at ON service_object_requests(created_at);
