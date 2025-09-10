# PostgreSQL NOT NULL 約束違反錯誤 (`null value in column "created_at" violates not-null constraint`)

## 問題描述
在修復日期時間範圍錯誤後，PostgreSQL 報告了 `ERROR: null value in column "created_at" of relation "event_type" violates not-null constraint` 錯誤。

## 錯誤現象
```
ERROR: null value in column "created_at" of relation "event_type" violates not-null constraint
Failing row contains (1, APEX - INTOVOID娛樂賽, Apex Legends, PC, INTOVOID娛樂賽 SDLP Community主辦的第四届娛樂賽,開..., 1. 需按時完成報到\n2. 禁止使用任何外掛或輔助..., 冠軍：新台幣30,000元 + 獎盃\n亞軍：新台幣15,000..., 團體, https://d1k8pxxip4mxx2.cloudfront.net/pub/media/t8t/13962/banner..., 2024-11-13 00:00:00, 2024-11-28 00:00:00, 2024-12-28 00:00:00, 2025-01-02 00:00:00, 60, 1, t, null, 33).
SQL state: 23502
```

## 根本原因
`created_at` 欄位被定義為 `NOT NULL DEFAULT NOW()`，但在 INSERT 語句中仍然明確指定了 `NULL` 值。PostgreSQL 的約束檢查在預設值應用之前執行，導致約束違反。

## 解決方案
**完全移除 `created_at` 欄位**從 INSERT 語句中，讓 `DEFAULT NOW()` 自動生效：

**修改前:**
```sql
INSERT INTO event_type (event_id, event_name, ..., created_at) VALUES 
(1, 'APEX - INTOVOID娛樂賽', ..., NULL),
(2, '另一個活動', ..., NULL);
```

**修改後:**
```sql
INSERT INTO event_type (event_id, event_name, ...) VALUES 
(1, 'APEX - INTOVOID娛樂賽', ...),
(2, '另一個活動', ...);
```

## 關鍵概念
- `NOT NULL DEFAULT NOW()` 表示：欄位不能為空，如果沒有提供值則使用當前時間
- 在 INSERT 中明確指定 `NULL` 會觸發 NOT NULL 約束檢查
- 完全省略欄位名稱和值，讓預設值自動生效

## 影響範圍
- `backend/database/event_type.sql` 中的所有 INSERT 語句
- 需要從欄位列表和 VALUES 列表中同時移除 `created_at`

## 預防措施
1. 理解 PostgreSQL 約束檢查的執行順序
2. 對於有 `DEFAULT` 值的 `NOT NULL` 欄位，避免在 INSERT 中明確指定 `NULL`
3. 使用 `DEFAULT NOW()` 自動管理時間戳記

## 相關檔案
- `backend/database/event_type.sql`
- `backend/database/event_schema_api_comparison.md`
