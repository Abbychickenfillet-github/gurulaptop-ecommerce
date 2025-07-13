import { useEffect } from "react"
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/use-auth'
import LoadingAnimation from '@/components/LoadingAnimation/LoadingAnimation'


export default function RouterGuard({ children }) {
    const router = useRouter()
    const { auth } = useAuth()
    const protectedRoutes = ['/dashboard', '/coupon/coupon-user'] // 修正：加上 /
    const publicOnlyRoutes = ['/member/login', '/member/signup']

    useEffect(() => {
        // 等待認證檢查完成
        if (!router?.isReady || auth?.isLoading) {
            return
        }

        // 檢查受保護路由
        if (protectedRoutes?.includes(router.pathname) && !auth?.isAuth) {
            console.log('router?.pathname', router.pathname)
            console.log('auth?.isAuth', auth.isAuth)
            console.log('未登入用戶嘗試存取受保護頁面，跳轉登入頁')
            router.replace('/member/login')
            return
        }

        // 檢查公開路由（已登入用戶不應該看到登入頁）
        if (publicOnlyRoutes.includes(router.pathname) && auth.isAuth) {
            console.log('已登入用戶，跳轉至儀表板')
            router.replace('/dashboard')
            return
        }
    }, [router.isReady, router.pathname, auth.isAuth, auth.isLoading]) // 添加完整依賴

    // 顯示載入動畫
    if (auth?.isLoading) {
        return <LoadingAnimation />
    }

    return <>{children}</>
}