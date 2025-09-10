# PostgreSQL SELECT DISTINCT ORDER BY 錯誤 (`for SELECT DISTINCT, ORDER BY expressions must appear in select list`)

**發生時間**: 2025年9月10日  
**問題回報**: 用戶詢問 "for SELECT DISTINCT, ORDER BY expressions must appear in select list" 錯誤

## 問題描述
在 `backend/routes/group.js` 的 `/api/group/events` 路由中，PostgreSQL 報告了 `for SELECT DISTINCT, ORDER BY expressions must appear in select list` 錯誤。

## 錯誤現象
```
獲取活動揪團失敗: error: for SELECT DISTINCT, ORDER BY expressions must appear in select list
    at async file:///D:/Users/User/Documents/coding/project_laptop/next-guru/backend/routes/group.js:101:30
SQL state: 42P10

    at async file:///D:/Users/User/Documents/coding/project_laptop/next-guru/backend/routes/group.js:101:30 {
  length: 148,                    // 錯誤訊息的總長度（字元數）
  severity: 'ERROR',              // 錯誤嚴重程度：ERROR（錯誤）、WARNING（警告）、NOTICE（通知）
  code: '42P10',                 // PostgreSQL 錯誤代碼：42P10 = "for SELECT DISTINCT, ORDER BY expressions must appear in select list"
  detail: undefined,              // 詳細錯誤說明（此錯誤沒有額外詳細資訊）
  hint: undefined,                // PostgreSQL 提供的修復建議（此錯誤沒有提示）
  position: '234',                // 錯誤在 SQL 查詢中的字元位置（第 234 個字元）
  internalPosition: undefined,     // PostgreSQL 內部解析位置（未提供）
  internalQuery: undefined,        // PostgreSQL 內部查詢（未提供）
  where: undefined,               // 錯誤發生的上下文位置（未提供）
  schema: undefined,              // 相關的資料庫 schema（未提供）
  table: undefined,               // 相關的資料表（未提供）
  column: undefined,              // 相關的欄位（未提供）
  dataType: undefined,            // 相關的資料類型（未提供）
  constraint: undefined,          // 相關的約束條件（未提供）
  file: 'parse_clause.c',         // PostgreSQL 原始碼檔案名稱
  line: '3019',                   // PostgreSQL 原始碼行號
  routine: 'transformDistinctClause' // PostgreSQL 內部函數名稱
}
```

## 根本原因
**PostgreSQL 的 `SELECT DISTINCT` 規則**：當使用 `SELECT DISTINCT` 時，`ORDER BY` 子句中的所有欄位都必須出現在 `SELECT` 列表中。

**錯誤的 SQL 查詢:**
```sql
SELECT DISTINCT e.event_id, e.event_name 
FROM "group" g 
JOIN event_type e ON g.event_id = e.event_id
WHERE g.event_id IS NOT NULL
GROUP BY e.event_id
HAVING COUNT(g.group_id) > 0
ORDER BY e.event_start_time DESC  -- ❌ 錯誤：event_start_time 不在 SELECT 中
```

## 解決方案
**將 `ORDER BY` 中使用的欄位加入 `SELECT` 列表:**

```sql
SELECT DISTINCT e.event_id, e.event_name, e.event_start_time
FROM "group" g 
JOIN event_type e ON g.event_id = e.event_id
WHERE g.event_id IS NOT NULL
GROUP BY e.event_id, e.event_name, e.event_start_time
HAVING COUNT(g.group_id) > 0
ORDER BY e.event_start_time DESC  -- ✅ 正確：event_start_time 在 SELECT 中
```

## PostgreSQL DISTINCT 規則
1. **SELECT DISTINCT**: 確保結果集中沒有重複行
2. **ORDER BY 限制**: 所有 `ORDER BY` 欄位必須在 `SELECT` 列表中
3. **GROUP BY 一致性**: 如果使用 `GROUP BY`，所有非聚合欄位都必須在 `GROUP BY` 中

## 影響範圍
- `GET /api/group/events` 路由返回 500 錯誤
- 活動揪團列表無法正常顯示
- 前端群組頁面載入失敗

## 預防措施
1. **SQL 語法檢查**: 使用 PostgreSQL 語法檢查工具
2. **測試查詢**: 在資料庫管理工具中先測試 SQL 查詢
3. **理解規則**: 熟悉 PostgreSQL 的 `DISTINCT` 和 `ORDER BY` 規則

## 相關檔案
- `backend/routes/group.js` (第 101-109 行)
- `frontend/pages/group/index.js` (使用此 API)

## 測試方法
1. 重新啟動後端服務
2. 訪問群組頁面
3. 檢查 `/api/group/events` 是否返回 200 狀態碼
4. 確認活動揪團列表正常顯示
