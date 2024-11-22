import { useState, useContext, createContext, useRef, useEffect } from 'react'
// 可自訂載入動畫元件
import { DefaultLoader, LoaderText } from './components'
import { useRouter } from 'next/router'
import { LoadingSpinner } from '@/components/dashboard/loading-spinner'
import { useLoading as useNewLoading } from '@/context/LoadingContext'

const LoaderContext = createContext(null)

// 保留原有的 delay 和 timeout 函數
export function delay(ms) {
  return function (x) {
    return new Promise((resolve) => setTimeout(() => resolve(x), ms))
  }
}

export function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 修改 LoaderProvider，整合新的 loading 系統
export const LoaderProvider = ({
  children,
  close = 2,
  global = true,
  CustomLoader = LoadingSpinner,
  excludePaths = [],
}) => {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const { showLoading: showNewLoading, hideLoading: hideNewLoading } =
    useNewLoading()

  useEffect(() => {
    const handleChangeStart = () => {
      // 改進路徑檢查邏輯
      const currentPath = router.pathname
      const shouldShowLoader = !excludePaths.some(
        (path) => currentPath === path || currentPath.startsWith(`${path}/`)
      )

      if (global && shouldShowLoader) {
        setShow(true)
        showNewLoading()
      }
    }

    const handleChangeEnd = () => {
      if (close && global) {
        timeout(close * 1000).then(() => {
          setShow(false)
          hideNewLoading()
        })
      }
    }

    // 初始路徑檢查
    const initialCheck = () => {
      const currentPath = router.pathname
      const shouldHideLoader = excludePaths.some(
        (path) => currentPath === path || currentPath.startsWith(`${path}/`)
      )
      if (shouldHideLoader) {
        setShow(false)
        hideNewLoading()
      }
    }

    // 執行初始檢查
    initialCheck()

    router.events.on('routeChangeStart', handleChangeStart)
    router.events.on('routeChangeComplete', handleChangeEnd)
    router.events.on('routeChangeError', handleChangeEnd)

    return () => {
      router.events.off('routeChangeStart', handleChangeStart)
      router.events.off('routeChangeComplete', handleChangeEnd)
      router.events.off('routeChangeError', handleChangeEnd)
    }
  }, [router, global, close, showNewLoading, hideNewLoading, excludePaths])

  return (
    <LoaderContext.Provider
      value={{
        showLoader: () => {
          const currentPath = router.pathname
          const shouldShowLoader = !excludePaths.some(
            (path) => currentPath === path || currentPath.startsWith(`${path}/`)
          )

          if (shouldShowLoader) {
            setShow(true)
            showNewLoading()
            if (close) {
              timeout(close * 1000).then(() => {
                setShow(false)
                hideNewLoading()
              })
            }
          }
        },
        hideLoader: () => {
          setShow(false)
          hideNewLoading()
        },
        loading: show,
        delay,
        loader: () => <CustomLoader show={show} />,
        loaderText: (text) => <LoaderText text={text} show={show} />,
      }}
    >
      {children}
    </LoaderContext.Provider>
  )
}

// 保持原有的 useLoader hook，但整合新的功能
export const useLoader = () => {
  const context = useContext(LoaderContext)
  const newLoading = useNewLoading()

  if (!context) {
    throw new Error('useLoader must be used within LoadingProvider')
  }

  return {
    ...context,
    // 暴露新的 loading 狀態和方法
    isNewLoading: newLoading.isLoading,
    showNewLoading: newLoading.showLoading,
    hideNewLoading: newLoading.hideLoading,
  }
}
