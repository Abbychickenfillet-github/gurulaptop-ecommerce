# 認證跳轉循環問題修復文檔

**發生時間**: 2025年1月2日  
**問題回報**: 用戶登入後出現無限跳轉循環

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

### 認證跳轉問題修復
✅ **登入成功後正常跳轉到 dashboard**  
✅ **不再有無限跳轉循環**  
✅ **認證狀態穩定**  

### 圖片同步問題修復
✅ **Header 和 Dashboard 圖片現在會同步更新**  
✅ **不再有圖片不一致的問題**  
✅ **減少不必要的 API 請求**  
✅ **提高性能**  

### 性能優化
✅ **使用 useCallback 優化函數**  
✅ **使用 useMemo 優化數組**  
✅ **響應式狀態更新**  
✅ **避免不必要的重新渲染**

## 性能優化後的問題

### 圖片顯示不一致問題

**問題描述：**
- 進入 dashboard 後，header 和左側欄的圖片顯示不一致
- 上方 header 和左側欄的兩張圖片還是預設的男生圖片
- 但改過的圖片是正確的（用戶上傳的圖片）

**可能原因：**
1. **緩存問題** - 瀏覽器緩存了舊的圖片
2. **狀態更新時序** - 不同組件的狀態更新時序不同
3. **圖片路徑問題** - 不同組件使用了不同的圖片路徑
4. **認證狀態同步** - 認證狀態更新後，圖片狀態沒有同步更新

**需要檢查的檔案：**
- `frontend/components/layout/default-layout/header.js` - Header 組件
- `frontend/pages/dashboard/index.js` - Dashboard 左側欄
- `frontend/hooks/use-auth.js` - 認證狀態管理

**根本原因：**
1. **Header 組件使用本地狀態** - `const [imagePath, setImagePath] = useState(...)`
2. **Dashboard 組件直接使用認證狀態** - `auth?.userData?.image_path`
3. **狀態不同步** - Header 的本地狀態不會自動更新
4. **不必要的 API 請求** - Header 額外發送 API 請求獲取用戶數據

**修復方案：**
1. **移除 Header 的本地狀態** - 直接使用 `auth.userData.image_path`
2. **移除不必要的 API 請求** - 避免重複獲取數據
3. **統一圖片邏輯** - 所有組件都使用相同的認證狀態
4. **添加 `key` 屬性** - 強制圖片重新渲染

**修復後的程式碼：**
```javascript
// Header 組件 - 修復前
const [imagePath, setImagePath] = useState(
  auth?.userData?.image_path || getDefaultImage(auth?.userData?.gender)
)
<Image src={imagePath} alt="User" width={40} height={40} />

// Header 組件 - 修復後
<Image 
  src={
    auth?.userData?.image_path ||
    getDefaultImage(auth?.userData?.gender)
  } 
  alt="User" 
  width={40} 
  height={40}
  key={auth?.userData?.image_path} // 強制重新渲染
/>
```

**修復效果：**
✅ **Header 和 Dashboard 圖片現在會同步更新**  
✅ **不再有圖片不一致的問題**  
✅ **減少不必要的 API 請求**  
✅ **提高性能**

### 產品比較按鈕樣式修復

**問題描述：**
- 產品卡片上的「比較」按鈕鑽石圖標太小（15px）
- 邊框顏色不明顯（#ddd）
- 文字和圖標位置可能重疊
- 缺少背景色，可見度低

**修復方案：**
1. **增大鑽石圖標** - 從 15px 增加到 20px
2. **改善邊框顏色** - 改為主題色 `#805af5`
3. **調整位置** - 更精確的定位，避免重疊
4. **添加背景** - 半透明背景提高可見度
5. **改善文字樣式** - 添加陰影和粗體

**修復後的樣式：**
```scss
.product_compare_label {
  position: absolute;
  width: 20px;           // 增大尺寸
  height: 20px;
  border: 2px solid #805af5;  // 主題色邊框
  transform: rotate(45deg);
  right: 15px;           // 調整位置
  top: 15px;
  background-color: rgba(0, 0, 0, 0.3);  // 半透明背景
  cursor: pointer;
  z-index: 10;           // 確保在最上層
}

.product_compare_text {
  position: absolute;
  top: 15px;
  right: 40px;           // 調整位置避免重疊
  color: white;
  font-size: 14px;
  font-weight: bold;     // 粗體
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);  // 文字陰影
  z-index: 10;
}
```

**修復效果：**
✅ **鑽石圖標更大更清楚**  
✅ **邊框顏色與主題一致**  
✅ **文字和圖標不會重疊**  
✅ **選中狀態更明顯**  
✅ **整體視覺效果更好**    

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

### 4. **性能優化建議**

#### **`useCallback` vs `useMemo` 詳細解釋**

**`useCallback` 的用途：**
- 用來優化函數，不是針對數字
- 避免函數在每次組件重新渲染時重新創建
- 當函數作為 props 傳遞給子組件時特別有用
- 當函數作為 useEffect 的依賴時特別有用

**`useMemo` 的用途：**
- 用來優化計算結果，不一定是數字
- 可以是對象、數組、字符串等任何值
- 避免昂貴的計算重複執行
- 避免對象/數組重新創建

#### **在認證系統中的適合度分析**

**`useCallback` 適合度：**
```javascript
// ✅ 適合使用 useCallback
const login = useCallback(async (email, password) => { ... }, [router])
// 原因：login 函數會被傳遞給子組件使用，避免子組件不必要的重新渲染

const logout = useCallback(async () => { ... }, [clearAuthState, router])
// 原因：logout 函數會被傳遞給子組件使用

const clearAuthState = useCallback(() => { ... }, [])
// 原因：clearAuthState 被 logout 函數使用，避免函數重新創建
```

**`useMemo` 適合度：**
```javascript
// ✅ 適合使用 useMemo
const protectedRoutes = useMemo(() => ['/dashboard', '/coupon/coupon-user'], [])
// 原因：數組不會改變，避免每次重新渲染時重新創建數組

const loggedInBlockedRoutes = useMemo(() => ['/member/login', '/member/signup'], [])
// 原因：數組不會改變，避免每次重新渲染時重新創建數組
```

#### **實際效果對比**

**沒有優化時：**
```javascript
// 每次組件重新渲染時
const login = async (email, password) => { ... }  // 新函數
const protectedRoutes = ['/dashboard', '/coupon/coupon-user']  // 新數組
```

**有優化時：**
```javascript
// 組件重新渲染時
const login = useCallback(async (email, password) => { ... }, [router])  // 緩存函數
const protectedRoutes = useMemo(() => ['/dashboard', '/coupon/coupon-user'], [])  // 緩存數組
```

#### **使用 `useCallback` 優化函數**
```javascript
// 優化前
const login = async (email, password) => {
  // 登入邏輯
}

const logout = async () => {
  // 登出邏輯
}

const clearAuthState = () => {
  // 清除狀態邏輯
}

// 優化後
const login = useCallback(async (email, password) => {
  // 登入邏輯
}, [router]) // 依賴 router，因為函數內部使用了 router

const logout = useCallback(async () => {
  // 登出邏輯
}, [clearAuthState, router]) // 依賴 clearAuthState 和 router

const clearAuthState = useCallback(() => {
  // 清除狀態邏輯
}, []) // 空依賴數組，因為函數內部不依賴外部狀態
```

#### **使用 `useMemo` 優化計算**
```javascript
// 優化前
const protectedRoutes = ['/dashboard', '/coupon/coupon-user']
const loggedInBlockedRoutes = ['/member/login', '/member/signup']

// 優化後
const protectedRoutes = useMemo(() => ['/dashboard', '/coupon/coupon-user'], [])
const loggedInBlockedRoutes = useMemo(() => ['/member/login', '/member/signup'], [])
```

#### **更好的狀態更新方式**
```javascript
// 優化前：使用 setTimeout 延遲跳轉
setTimeout(() => {
  router.replace('/dashboard')
}, 500)

// 優化後：使用 useEffect 監聽狀態變化
useEffect(() => {
  if (auth.hasChecked && auth.isAuth && loggedInBlockedRoutes.includes(router.pathname)) {
    router.replace('/dashboard')
  }
}, [auth.hasChecked, auth.isAuth, router.pathname])
```

#### **Promise 等待狀態更新**
```javascript
// 更好的做法：等待狀態更新完成
const waitForAuthUpdate = useCallback(() => {
  return new Promise((resolve) => {
    const checkAuth = () => {
      if (auth.hasChecked) {
        resolve()
      } else {
        setTimeout(checkAuth, 50)
      }
    }
    checkAuth()
  })
}, [auth.hasChecked])

// 在登入成功後使用
await waitForAuthUpdate()
router.replace('/dashboard')
```

## 相關檔案

### 認證跳轉修復
- `frontend/hooks/use-auth.js` - 認證邏輯核心，性能優化
- `frontend/pages/dashboard/index.js` - Dashboard 頁面認證檢查
- `frontend/pages/member/login.js` - 登入頁面認證檢查
- `frontend/pages/member/index.js` - 重定向邏輯修復
- `backend/routes/login.js` - 後端登入邏輯
- `backend/middlewares/authenticate.js` - 後端認證中間件

### 圖片同步修復
- `frontend/components/layout/default-layout/header.js` - Header 組件圖片邏輯
- `frontend/pages/dashboard/index.js` - Dashboard 左側欄圖片邏輯
- `frontend/hooks/use-auth.js` - 認證狀態管理

### 文檔
- `frontend/pages/member/authentication-redirect-fix.md` - 問題修復文檔

---

**修復日期：** 2025年09月  

