# Group 申請 400 Bad Request 錯誤 (`找不到該群組`)

**發生時間**: 2025年9月10日  
**問題回報**: 用戶詢問 "那為什麼會有bad Request dataType: undefined是怎樣"

## 問題描述
在群組申請功能中，前端發送 POST 請求到 `/api/group/requests` 時收到 400 Bad Request 錯誤，後端返回「找不到該群組」訊息。

## 錯誤現象
```
POST http://localhost:3005/api/group/requests 400 (Bad Request)
Error: Error: 找不到該群組
    at handleSubmit (GroupJoin.js:78:15)
```

## 根本原因
**前端傳送的 `groupId` 與後端期望的欄位不匹配**：

**前端傳送:**
```javascript
// GroupJoin.js 第 68 行 (錯誤)
groupId: groupData.group_id,  // undefined 或錯誤值
```

**前端實際資料結構:**
```javascript
// pages/group/index.js 第 244-256 行
groupData={{
  id: group.group_id,        // ← 正確的欄位名稱
  title: group.group_name,
  // ... 其他屬性
}}
```

**後端查詢:**
```sql
-- backend/routes/group.js 第 549 行
SELECT creator_id, group_name FROM "group" WHERE group_id = $1
```

## 解決方案
**修正前端傳送的欄位名稱:**

```javascript
// 修改前 (錯誤)
groupId: groupData.group_id,

// 修改後 (正確)
groupId: groupData.id,
```

## 資料流分析
1. **群組列表頁面** (`pages/group/index.js`) 創建 `groupData` 物件，使用 `id` 欄位
2. **群組申請組件** (`GroupJoin.js`) 錯誤地使用 `groupData.group_id` (undefined)
3. **後端 API** (`routes/group.js`) 收到 `undefined` 作為 `groupId`
4. **資料庫查詢** 失敗，因為 `WHERE group_id = undefined` 找不到記錄

## 影響範圍
- 所有群組申請功能無法使用
- 用戶無法加入任何群組
- 群組功能基本失效

## 預防措施
1. **資料結構一致性**: 確保前端組件間使用相同的資料結構
2. **TypeScript 使用**: 使用 TypeScript 可以避免這類欄位名稱錯誤
3. **API 測試**: 在開發時測試 API 請求的資料格式

## 相關檔案
- `frontend/components/group/GroupJoin.js` (第 68 行)
- `frontend/pages/group/index.js` (第 244-256 行)
- `backend/routes/group.js` (第 549 行)

## 測試方法
1. 重新啟動前端服務
2. 訪問群組頁面
3. 點擊「申請」按鈕
4. 填寫申請表單並提交
5. 檢查是否成功發送申請
