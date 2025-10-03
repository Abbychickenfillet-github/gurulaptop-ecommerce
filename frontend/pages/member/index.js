import { useRouter } from 'next/router'
import { useEffect } from 'react'

// only redirect to member/login
export default function MemberIndex() {
  const router = useRouter()

  useEffect(() => {
    // 延遲重定向，避免與認證檢查衝突
    const timer = setTimeout(() => {
      router.push('/member/login')
    }, 100)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: '50vh' }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">載入中...</span>
      </div>
    </div>
  )
}
// 段代碼的目的是在瀏覽器中自動將用戶重定向到 /member/login 頁面。

// typeof window !== 'undefined'：這一行是用來確保代碼只在瀏覽器環境中運行，而不在服務器端運行。因為在服務器端 window 是未定義的。如果你不檢查這個，router.push 會在服務器端渲染時出錯。

// router.push('/member/login')：這個方法會將用戶重定向到 /member/login 頁面。
