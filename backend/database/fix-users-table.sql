-- 修复 users 表的 NOT NULL 约束问题
-- 允许地址相关字段为空，因为前端注册画面没有这些字段

-- 移除 NOT NULL 约束
ALTER TABLE users 
ALTER COLUMN country DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN district DROP NOT NULL,
ALTER COLUMN road_name DROP NOT NULL,
ALTER COLUMN detailed_address DROP NOT NULL;

-- 验证修改结果
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('country', 'city', 'district', 'road_name', 'detailed_address');

-- 更新现有数据，将空字符串改为 NULL
UPDATE users 
SET country = NULL, city = NULL, district = NULL, road_name = NULL, detailed_address = NULL
WHERE country = '' OR city = '' OR district = '' OR road_name = '' OR detailed_address = '';
