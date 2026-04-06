-- 允许前端后台（未接入 Supabase Auth）读取与审核报名数据

-- volunteer_applications: 允许匿名读取/更新/删除（用于前端后台审核）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_applications_select_all' AND tablename = 'volunteer_applications'
  ) THEN
    CREATE POLICY volunteer_applications_select_all ON volunteer_applications
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_applications_update_all' AND tablename = 'volunteer_applications'
  ) THEN
    CREATE POLICY volunteer_applications_update_all ON volunteer_applications
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_applications_delete_all' AND tablename = 'volunteer_applications'
  ) THEN
    CREATE POLICY volunteer_applications_delete_all ON volunteer_applications
      FOR DELETE USING (true);
  END IF;
END $$;

GRANT SELECT, UPDATE, DELETE ON volunteer_applications TO anon;

-- service_objects: 允许匿名更新/删除（用于前端后台审核与维护）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'service_objects_update_all' AND tablename = 'service_objects'
  ) THEN
    CREATE POLICY service_objects_update_all ON service_objects
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'service_objects_delete_all' AND tablename = 'service_objects'
  ) THEN
    CREATE POLICY service_objects_delete_all ON service_objects
      FOR DELETE USING (true);
  END IF;
END $$;

GRANT UPDATE, DELETE ON service_objects TO anon;
