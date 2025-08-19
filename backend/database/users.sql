-- PostgreSQL users table schema
-- 使用 PostgreSQL 語法，將 MySQL 的資料型別轉換為 PostgreSQL 相對應的資料型別
-- 注意：PostgreSQL 中沒有 UNSIGNED，預設整數為正整數
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY, -- PostgreSQL 中 UNSIGNED 不支援，預設正整數使用 INTEGER
  level SMALLINT NOT NULL DEFAULT 0, -- 對應 tinyint(2)
  password VARCHAR(80) NOT NULL,
  name VARCHAR(30),
  phone VARCHAR(30),
  email VARCHAR(30) NOT NULL,
  valid BOOLEAN NOT NULL DEFAULT TRUE, -- 使用 boolean 替代 tinyint(1)
  created_at TIMESTAMP NOT NULL,
  gender VARCHAR(10),
  country VARCHAR(30) NOT NULL,
  city VARCHAR(30) NOT NULL,
  district VARCHAR(30) NOT NULL,
  road_name VARCHAR(30) NOT NULL,
  detailed_address VARCHAR(30) NOT NULL,
  image_path TEXT NOT NULL, -- PostgreSQL 沒有 longtext，使用 text
  remarks VARCHAR(150),
  birthdate DATE,
  google_uid SMALLINT, -- int(2) 對應 smallint
  iat VARCHAR(50),
  exp VARCHAR(50)
);
INSERT INTO "users" (
    "user_id",
    "level",
    "password",
    "name",
    "phone",
    "email",
    "valid",
    "created_at",
    "gender",
    "country",
    "city",
    "district",
    "road_name",
    "detailed_address",
    "image_path",
    "remarks",
    "birthdate",
    "google_uid",
    "iat",
    "exp"
) VALUES (
    1,
    0,
    '$2b$10$pl4FQA.KOR4uT/58Y5iasult70YtracXUMvPmiuRJAuWD6Bgnkdkm',
    '陳冠霖123',
    '02-78240971',
    'xiuying79@test.com',
    0,
    '2024-05-01 03:28:46'::timestamp,
    'male',
    '台灣',
    '台北市',
    '大安區',
    '敦南街',
    '13號',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gJASUNDX1BST0ZJTEUAAQEAAAIwQURCRQIQAABtbnRyUkdCIFhZWiAHzwAGAAMAAAAAAABhY3NwQVBQTAAAAABub25lAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUFEQkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApjcHJ0AAAA/AAAADJkZXNjAAABMAAAAGt3dHB0AAABnAAAABRia3B0AAABsAAAABRyVFJDAAABxAAAAA5nVFJDAAAB1AAAAA5iVFJDAAAB5AAAAA5yWFlaAAAB9AAAABRnWFlaAAACCAAAABRiWFlaAAACHAAAABR0ZXh0AAAAAENvcHlyaWdodCAxOTk5IEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkAAAAZGVzYwAAAAAAAAARQWRvYmUgUkdCICgxOTk4KQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPNRAAEAAAABFsxYWVogAAAAAAAAAAAAAAAAAAAAAGN1cnYAAAAAAAAAAQIzAABjdXJ2AAAAAAAAAAECMwAAY3VydgAAAAAAAAABAjMAAFhZWiAAAAAAAACcGAAAT6UAAAT8WFlaIAAAAAAAADSNAACgLAAAD5VYWVogAAAAAAAAJjEAABAvAAC+nP/bAEMAAwICAgICAwICAgMDAwMEBgQEBAQECAYGBQYJCAoKCQgJCQoMDwwKCw4LCQkNEQ0ODxAQERAKDBITEhATDxAQEP/bAEMBAwMDBAMECAQECBALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/AABEIBQQHgAMBIgACEQE',
    NULL, -- `remarks` 在你的範例中是空的，所以這裡用 NULL 或空字串
    NULL, -- `birthdate` 在你的範例中是空的，所以這裡用 NULL
    NULL, -- `google_uid` 在你的範例中是空的，所以這裡用 NULL
    NULL, -- `iat` 在你的範例中是空的，所以這裡用 NULL
    NULL  -- `exp` 在你的範例中是空的，所以這裡用 NULL
);