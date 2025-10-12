import { useEffect, useState } from 'react'
import styles from '@/styles/BackToTop.module.css'

const BackToTop = () => {
  // 控制按鈕是否可見的狀態，預設為 false (隱藏)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 滾動事件處理函式
    const handleScroll = () => {
      // window.scrollY 是整個頁面滾動的距離
      // 當頁面滾動超過 300px 時，顯示按鈕
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // 監聽 window 的滾動事件
    // 在 Next.js 中，滾動容器通常是 window，除非有特殊的 CSS 設定
    window.addEventListener('scroll', handleScroll)

    // useEffect 的清理函式：組件卸載時移除事件監聽器
    // 為什麼要移除？因為如果不移除，監聽器會一直存在記憶體中
    // 當組件被重新渲染或卸載時，會造成記憶體洩漏
    // 移除的寫法必須和註冊的寫法完全一致：
    // addEventListener('scroll', handleScroll)
    // removeEventListener('scroll', handleScroll)

    // 記憶體洩漏的具體情況：
    // 1. 組件第一次掛載：註冊 handleScroll1
    // 2. 組件重新掛載：註冊 handleScroll2 (但 handleScroll1 還在)
    // 3. 組件再次掛載：註冊 handleScroll3 (但 handleScroll1,2 都還在)
    // 結果：同一個滾動事件會觸發多個函式，造成效能問題
    return () => window.removeEventListener('scroll', handleScroll)
  }, []) // 空依賴陣列表示 useEffect 本身只在組件掛載時執行一次
  // 但 handleScroll 函式會在每次滾動時被觸發
  //
  // 重要理解：
  // 1. useEffect 只執行一次 = 只註冊一次事件監聽器
  // 2. 功能不會只能用一次，handleScroll 會持續被觸發
  // 3. 組件掛載/卸載的問題主要是防止程式碼堆積（記憶體洩漏）
  //
  // 什麼時候會觸發重新掛載？
  // 1. 頁面重新載入 (F5, Ctrl+R, 瀏覽器重新整理)
  // 2. 路由切換 (從 / 切換到 /product 再回到 /)
  // 3. 條件渲染 (如 {showComponent && <BackToTop />})
  // 4. 父組件重新渲染導致子組件被替換
  // 5. 應用程式關閉後重新開啟
  //
  // && 運算符 (邏輯 AND) 在 React 中的用法：
  // {condition && <Component />}
  // - 如果 condition 為 true，渲染 Component
  // - 如果 condition 為 false，不渲染任何東西 (null)
  // - 這是 React 中常用的條件渲染語法
  //
  // onClick 事件處理器的執行順序：
  // 1. 用戶點擊按鈕 → 觸發 onClick 事件
  // 2. 執行箭頭函式 () => setIsLoggedIn(!isLoggedIn)
  // 3. setIsLoggedIn 立即執行，將狀態更新為相反值
  // 4. React 重新渲染組件，使用新的狀態值
  //
  // 重要：setIsLoggedIn 是同步執行，但狀態更新是異步的
  //
  // 箭頭函式的兩種寫法：
  // 1. 簡潔寫法：() => expression (沒有大括號)
  //    - 自動返回 expression 的值
  //    - 只能有一行程式碼
  // 2. 完整寫法：() => { statements } (有大括號)
  //    - 需要明確使用 return 語句
  //    - 可以有多行程式碼
  //
  // 關於 isLoggedIn 的語意問題：
  // isLoggedIn = false → 顯示 '登入' 按鈕
  // isLoggedIn = true  → 顯示 '登出' 按鈕
  //
  // 這確實容易混淆，因為：
  // - 變數名稱 isLoggedIn 表示「是否已登入」
  // - 但按鈕文字是「要執行的動作」
  //
  // 更好的命名方式：
  // - 使用 showLoginButton 或 isLoginMode
  // - 或者使用 user 物件來管理登入狀態
  //
  // 關於登入狀態的初始值：
  // 1. useState(false) - 預設未登入，需要登入
  // 2. useState(true) - 預設已登入，需要登出
  //
  // 實際應用中，登入狀態應該：
  // - 從 localStorage 或 cookie 讀取
  // - 從伺服器驗證 token
  // - 考慮頁面重新載入後的狀態保持
  //
  // 正確的登入狀態管理：
  // const [user, setUser] = useState(null) // null 表示未登入
  //
  // 關於箭頭函式的 return 值：
  // 1. 簡潔寫法：() => expression (自動返回 expression 的值)
  // 2. 完整寫法：() => { statements; return value; } (明確返回)
  //
  // return true 的作用：
  // - 在 React 事件處理器中，返回值通常被忽略
  // - return true 只是表示函式執行成功
  // - 可以是 return false、return null、return undefined
  // - 重點是函式執行，不是返回值
  //
  // 為什麼使用 !prev 而不是 !isLoggedIn：
  // - prev 確保獲取最新的狀態值
  // - 避免閉包問題和狀態更新延遲

  const scrollToTop = () => {
    // 平滑滾動到頁面頂部
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  //   return (
  //     <button
  //       style={buttonStyle}
  //       onClick={scrollToTop}
  //       onMouseEnter={e => {
  //         e.target.style.backgroundColor = '#6900c7';
  //         e.target.style.transform = 'translateY(-3px)';
  //         e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  //       }}
  //       onMouseLeave={e => {
  //         e.target.style.backgroundColor = '#8B00FF';
  //         e.target.style.transform = 'translateY(0)';
  //         e.target.style.boxShadow = '0px 0px 20px 2px #6854C7';
  //       }}
  //     >
  //       ↑
  //     </button>
  //   );

  return (
    <button
      onClick={scrollToTop}
      // 動態類別名稱：
      // 1. 預設：styles.backToTop (隱藏狀態：opacity: 0, visibility: hidden)
      // 2. 當 isVisible 為 true 時：額外加上 styles.show (顯示狀態：opacity: 1, visibility: visible)
      className={`${styles.backToTop} ${isVisible ? styles.show : ''}`}
    >
      ↑
    </button>
  )
}

export default BackToTop
