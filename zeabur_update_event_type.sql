-- Zeabur Event Type 換行符修復 SQL
-- 將所有 event_content, event_rule, event_award 中的 \n 替換為正確的換行符

-- PostgreSQL 和 MySQL 通用的 UPDATE 語句

-- 修復 event_content 欄位
UPDATE event_type
SET event_content = REPLACE(event_content, '\n', E'\r\n')
WHERE event_content LIKE '%\n%';

-- 修復 event_rule 欄位
UPDATE event_type
SET event_rule = REPLACE(event_rule, '\n', E'\r\n')
WHERE event_rule LIKE '%\n%';

-- 修復 event_award 欄位
UPDATE event_type
SET event_award = REPLACE(event_award, '\n', E'\r\n')
WHERE event_award LIKE '%\n%';

-- 驗證修復結果的查詢（可選執行）
-- SELECT event_id, event_name, SUBSTRING(event_content, 1, 100) as preview_content
-- FROM event_type
-- WHERE event_content LIKE '%\r\n%' OR event_rule LIKE '%\r\n%' OR event_award LIKE '%\r\n%';
