
# Group 申請 "pending" 欄位不存在錯誤

**發生時間**: 2025年9月10日  
**問題回報**: 用戶詢問 "pending does not exist" 錯誤

## 問題描述
在群組申請功能中，PostgreSQL 報告了 `error: column "pending" does not exist` 錯誤，導致群組申請失敗。

## 錯誤現象
```
發送群組申請錯誤: error: column "pending" does not exist
    at D:\Users\User\Documents\coding\project_laptop\next-guru\backend\node_modules\pg\lib\client.js:545:17
    at async file:///D:/Users/User/Documents/coding/project_laptop/next-guru/backend/routes/group.js:568:39
```

**前端錯誤:**
```
Runtime Error: column "pending" does not exist
components/group/GroupJoin.js (78:15) @ handleSubmit
```

## 根本原因
1. **資料庫結構問題**: `group_requests` 或相關表格中沒有 `pending` 欄位
2. **SQL 查詢錯誤**: 查詢語句中引用了不存在的 `pending` 欄位
3. **資料庫遷移不完整**: MySQL 到 PostgreSQL 遷移時遺漏了某些欄位

## 解決方案

### 1. 檢查資料庫結構
```sql
-- 檢查 group_requests 表格結構
\d group_requests;

-- 檢查是否有 status 欄位
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'group_requests';
```

### 2. 修正 SQL 查詢
**可能的修正方式:**
```sql
-- 錯誤的查詢
SELECT * FROM group_requests WHERE status = 'pending';

-- 正確的查詢（如果欄位名稱不同）
SELECT * FROM group_requests WHERE status = 'pending';
-- 或者
SELECT * FROM group_requests WHERE request_status = 'pending';
```

### 3. 檢查欄位對應
- `pending` → `status` 或 `request_status`
- 確認正確的欄位名稱和資料類型

## 影響範圍
- `backend/routes/group.js` 第 568 行
- `frontend/components/group/GroupJoin.js` 第 78 行
- 群組申請功能完全無法使用

## 預防措施
1. 在 MySQL 到 PostgreSQL 遷移時，檢查所有欄位名稱
2. 使用一致的命名規範
3. 在部署前測試所有 SQL 查詢

## 相關檔案
- `backend/routes/group.js`
- `frontend/components/group/GroupJoin.js`
- `backend/database/group_requests.sql`
- `backend/database/group.sql`

## 下一步行動
1. 檢查 `group_requests` 表格的實際結構
2. 修正 SQL 查詢中的欄位名稱
3. 測試群組申請功能
