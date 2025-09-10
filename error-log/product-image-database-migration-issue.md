# 產品圖片資料庫遷移問題記錄

**發生時間**: 2025年1月2日  
**問題回報**: 用戶反映產品圖片無法顯示（"破圖"問題）

## 問題描述

在產品頁面中出現圖片無法顯示的問題，經調查發現是 `product_img` 資料表在從 MySQL 轉換到 PostgreSQL 時沒有完整遷移，導致產品圖片路徑缺失。

## 錯誤現象

### 1. 前端錯誤
- **產品卡片**: 顯示 placeholder 圖片而非實際產品圖片
- **產品詳情頁面**: `Cannot read properties of undefined (reading 'product_img_path')` 錯誤
- **Console 錯誤**: `Image is missing required "src" property`

### 2. 具體錯誤訊息
```
TypeError: Cannot read properties of undefined (reading 'product_img_path')
    at Detail ([pid].js:298:60)
```

### 3. 網路請求錯誤
- 請求 `http://localhost:3000/product/270/` 但找不到圖片
- 圖片路徑為空或 undefined

## 根本原因

**資料庫遷移不完整**: 從 MySQL 轉換到 PostgreSQL 時，`product_img` 資料表沒有完整遷移，導致：
- 產品圖片路徑資料缺失
- `product_img_path` 欄位為空或 null
- 前端無法正確載入產品圖片

## 影響範圍

### 受影響的組件
1. **產品卡片組件** (`frontend/components/product/product-card.js`)
2. **產品卡片白色組件** (`frontend/components/product/product-card-white.js`)
3. **產品詳情頁面** (`frontend/pages/product/[pid].js`)

### 受影響的功能
- 產品列表顯示
- 產品詳情頁面
- 產品圖片輪播
- 產品比較功能

## 臨時修復方案

### 1. 前端防護措施
在產品卡片組件中添加了安全檢查：

```javascript
// 產品卡片組件修復
<Image
  src={
    data && data.product_img_path
      ? `/product/${data.product_img_path}`
      : '/product/placeholder.avif'
  }
  alt="Product"
  width={200}
  height={200}
  onError={(e) => {
    console.log('圖片載入失敗:', e.target.src)
    e.target.src = '/product/placeholder.avif'
  }}
/>
```

### 2. 產品詳情頁面修復
```javascript
// 產品詳情頁面修復
<Image
  src={
    isLoading
      ? ''
      : imgData?.[0]
        ? `/product/${imgData[0].product_img_path}`
        : data?.product_img?.[0]?.product_img_path
          ? `/product/${data.product_img[0].product_img_path}`
          : '/product/placeholder.avif'
  }
  height={400}
  width={500}
  alt="product"
  onError={(e) => {
    console.log('產品詳情圖片載入失敗:', e.target.src)
    e.target.src = '/product/placeholder.avif'
  }}
/>
```

## 完整解決方案

### 1. 資料庫修復
需要重新遷移 `product_img` 資料表：

```sql
-- 檢查 product_img 資料表結構
SELECT * FROM product_img LIMIT 10;

-- 檢查是否有資料
SELECT COUNT(*) FROM product_img;

-- 如果需要重新插入資料
INSERT INTO product_img (product_id, product_img_path, created_at) 
VALUES 
  (1, 'XPS 13_1731661836_0.png', NOW()),
  (2, 'Vostro 14_1731661836_1.png', NOW()),
  -- ... 其他產品圖片資料
;
```

### 2. 資料驗證
```sql
-- 檢查產品與圖片的關聯
SELECT 
  p.product_id,
  p.product_name,
  pi.product_img_path
FROM product p
LEFT JOIN product_img pi ON p.product_id = pi.product_id
WHERE pi.product_img_path IS NULL;
```

### 3. 前端優化
- 添加圖片載入狀態指示器
- 實現圖片預載入機制
- 添加圖片載入失敗的重試機制

## 預防措施

### 1. 資料庫遷移檢查清單
- [ ] 檢查所有資料表是否完整遷移
- [ ] 驗證資料完整性
- [ ] 測試關鍵功能
- [ ] 檢查外鍵關聯

### 2. 前端防護機制
- [ ] 添加資料驗證
- [ ] 實現錯誤邊界
- [ ] 添加載入狀態
- [ ] 實現降級方案

## 相關檔案

### 資料庫檔案
- `backend/database/product_img.sql`
- `frontend/data/database/product_img.sql`

### 前端組件
- `frontend/components/product/product-card.js`
- `frontend/components/product/product-card-white.js`
- `frontend/pages/product/[pid].js`

### 樣式檔案
- `frontend/styles/product-card.module.scss`

## 測試建議

### 1. 資料庫測試
```sql
-- 測試產品圖片查詢
SELECT * FROM product_img WHERE product_id = 1;

-- 測試產品與圖片關聯
SELECT p.*, pi.product_img_path 
FROM product p 
JOIN product_img pi ON p.product_id = pi.product_id 
WHERE p.product_id = 1;
```

### 2. 前端測試
- 測試產品列表頁面圖片顯示
- 測試產品詳情頁面圖片輪播
- 測試圖片載入失敗時的降級處理
- 測試不同產品的圖片顯示

## 後續行動

1. **立即**: 修復 `product_img` 資料表資料
2. **短期**: 驗證所有產品圖片路徑
3. **中期**: 實現圖片 CDN 優化
4. **長期**: 建立完整的資料庫遷移流程

---

**建立時間**: 2024-01-XX  
**問題狀態**: 待修復  
**優先級**: 高  
**負責人**: [待指派]
