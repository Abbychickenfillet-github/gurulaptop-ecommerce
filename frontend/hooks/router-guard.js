import { useEffect } from "react";
import {useRouter} from 'next/router'
import {useAuth} from '@/hooks/use-auth'

export default function RouterGuard({children}){
    const router=useRouter()
    const {auth} = useAuth()
    const protectedRoutes =['/dashboard','coupon/coupon-user']
    const publicOnlyRoutes = ['/member/login','/member/signup']
    useEffect(()=>{
        if (router.isReady){
            if(protectedRoutes.includes(router.pathname) && !auth.isAuth){
                router.replace('/member/login')
            }
        if(publicOnlyRoutes.includes(router.pathname) &&auth.isAuth){
            router.replace('/dashboard')
        }
        }
        
    })
    return<>{children}</>
}