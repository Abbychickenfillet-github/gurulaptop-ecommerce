# 認證跳轉循環問題修復文檔

## 問題描述

用戶在登入後出現無限跳轉循環，在 `/member/login` 和 `/dashboard` 之間不斷跳轉，無法正常進入 dashboard 頁面。

## 問題症狀

1. **登入成功** → 跳轉到 `/dashboard`
2. **Dashboard 檢查認證** → `auth.isAuth` 為 `false` → 跳轉到 `/member/login`
3. **登入頁面檢查認證** → 發現已登入 → 跳轉到 `/dashboard`
4. **無限循環** 🔄

## 根本原因分析

### 1. **認證狀態更新延遲**
- 登入成功後，`auth.isAuth` 狀態沒有立即更新
- 前端認證檢查與後端認證狀態不同步
- 導致頁面檢查時認為用戶未登入

### 2. **跳轉邏輯衝突**
```javascript
// use-auth.js 中的問題邏輯
if (document.cookie.includes('accessToken') && loggedInBlockedRoutes.includes(router.pathname)) {
  router.push('/dashboard')  // 立即跳轉
}
```

### 3. **狀態檢查時序問題**
- `use-auth.js` 在認證檢查過程中就觸發跳轉
- Dashboard 頁面在認證狀態未更新時就檢查 `auth.isAuth`
- 造成狀態不一致

## 修復方案

### 1. **修復 Dashboard 頁面認證檢查**

**修改前：**
```javascript
// 如果未登入，跳轉到登入頁面
if (!auth.isAuth) {
  window.location.href = '/member/login'
}
```

**修改後：**
```javascript
// 如果認證檢查還沒完成，顯示載入中
if (!auth.hasChecked) {
  return <LoadingAnimation />
}

// 如果未登入，跳轉到登入頁面
if (!auth.isAuth) {
  window.location.href = '/member/login'
}
```

### 2. **修復登入頁面認證檢查**

**修改前：**
```javascript
useEffect(() => {
  if (auth?.isAuth) {
    router.replace('/dashboard')
  }
}, [auth?.isAuth, router])
```

**修改後：**
```javascript
useEffect(() => {
  // 如果認證檢查還沒完成，不執行跳轉
  if (!auth.hasChecked) {
    return
  }
  
  // 如果用戶已登入，重定向到儀表板
  if (auth?.isAuth) {
    router.replace('/dashboard')
  }
}, [auth?.isAuth, auth?.hasChecked, router])
```

### 3. **修復 use-auth.js 跳轉邏輯**

**修改前：**
```javascript
// 檢查是否已登入但嘗試訪問登入/註冊頁面
if (document.cookie.includes('accessToken') && loggedInBlockedRoutes.includes(router.pathname)) {
  setAuth(prev => ({ ...prev, isLoading: false, hasChecked: true }))
  router.push('/dashboard')  // 立即跳轉
  return
}
```

**修改後：**
```javascript
// 檢查是否已登入但嘗試訪問登入/註冊頁面
if (document.cookie.includes('accessToken') && loggedInBlockedRoutes.includes(router.pathname)) {
  console.log('⚠️ 已登入用戶嘗試訪問登入頁面，但先不跳轉，等待認證檢查完成')
  // 不立即跳轉，讓認證檢查完成後再處理
}
```

### 4. **修復認證成功後的跳轉**

**修改前：**
```javascript
// 如果已登入但當前在登入/註冊頁面，跳轉到 dashboard
if (loggedInBlockedRoutes.includes(router.pathname)) {
  router.push('/dashboard')  // 立即跳轉
}
```

**修改後：**
```javascript
// 如果已登入但當前在登入/註冊頁面，延遲跳轉到 dashboard
if (loggedInBlockedRoutes.includes(router.pathname)) {
  setTimeout(() => {
    router.push('/dashboard')
  }, 100)  // 延遲跳轉
}
```

### 5. **增加登入成功跳轉延遲**

**修改前：**
```javascript
setTimeout(() => {
  router.replace('/dashboard')
}, 300)
```

**修改後：**
```javascript
setTimeout(() => {
  router.replace('/dashboard')
}, 500)  // 增加延遲時間
```

## 修復原理

### 1. **狀態檢查優先級**
```
1. 檢查 hasChecked (認證檢查是否完成)
2. 檢查 isLoading (是否正在載入)
3. 檢查 isAuth (是否已登入)
```

### 2. **跳轉時機控制**
- **認證檢查過程中**：不觸發跳轉
- **認證檢查完成後**：才執行跳轉
- **狀態更新完成後**：延遲跳轉確保狀態同步

### 3. **避免競態條件**
- 使用 `hasChecked` 標記確保認證檢查完成
- 使用延遲跳轉避免狀態更新延遲
- 分離認證檢查和跳轉邏輯

## 測試結果

✅ **登入成功後正常跳轉到 dashboard**  
✅ **不再有無限跳轉循環**  
✅ **認證狀態穩定**  
✅ **頭像更新功能正常**  
✅ **三個地方的更新都成功**  

## 經驗教訓

### 1. **狀態管理**
- 認證狀態更新是異步的，需要等待完成
- 使用 `hasChecked` 標記避免重複檢查
- 狀態檢查要有優先級順序

### 2. **跳轉邏輯**
- 不要在認證檢查過程中觸發跳轉
- 使用延遲跳轉確保狀態同步
- 分離認證檢查和路由跳轉邏輯

### 3. **用戶體驗**
- 載入狀態要正確顯示
- 避免無限循環影響用戶體驗
- 狀態變化要有明確的視覺反饋

## 相關檔案

- `frontend/hooks/use-auth.js` - 認證邏輯核心
- `frontend/pages/dashboard/index.js` - Dashboard 頁面認證檢查
- `frontend/pages/member/login.js` - 登入頁面認證檢查
- `backend/routes/login.js` - 後端登入邏輯
- `backend/middlewares/authenticate.js` - 後端認證中間件

---

**修復日期：** 2024年12月  
**修復人員：** AI Assistant  
**測試狀態：** ✅ 通過  
