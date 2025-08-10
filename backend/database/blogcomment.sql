-- 設定資料庫編碼
-- PostgreSQL 創建資料庫時設定編碼方式（需 superuser 權限）
CREATE DATABASE project_db
  WITH ENCODING 'UTF8'
  LC_COLLATE='en_US.utf8'
  LC_CTYPE='en_US.utf8'
  TEMPLATE=template0;

-- 切換到該資料庫（psql CLI 工具用）
\c project_db

-- 建立資料表
CREATE TABLE blogcomment (
  blog_comment_id SERIAL PRIMARY KEY,
  blog_id INTEGER,
  user_id VARCHAR(10),
  blog_content TEXT NOT NULL,
  blog_created_date TIMESTAMP NOT NULL
);
