import { useEffect } from 'react'

// 樣式
import '@/styles/globals.scss'
import '@/styles/product.scss'
import '@/styles/cart.scss'
import '@/styles/loader.scss'
import '@/styles/coupon.scss'
import '@/styles/header.scss'
import '@/styles/footer.scss'

// 首頁
import '@/styles/frontPage.scss'
//會員註冊
// import '@/styles/transitions_Abby.scss'

// 文章/部落格用 css
import '@/styles/ArticleDetail.scss'
import '@/styles/ArticleHomePage.scss'
import '@/styles/BlogCreated.scss'
import '@/styles/BlogDetail.scss'
import '@/styles/BlogEdit.scss'
import '@/styles/BlogHomePage.scss'
import '@/styles/BlogUserOverview.scss'
import 'animate.css'

// 載入購物車context
import { CartProvider } from '@/hooks/use-cart-state'
// 載入認証用context
import { AuthProvider } from '@/hooks/use-auth'
// 載入動畫context
import { LoaderProvider } from '@/hooks/use-loader'

import DefaultLayout from '@/components/layout/default-layout'
// 自訂用載入動畫元件
import { CatLoader, NoLoader } from '@/hooks/use-loader/components'
import { LoadingSpinner } from '@/components/dashboard/loading-spinner'
// event的scss
import '../styles/event.scss'
// eventdetail的scss
import '../styles/eventDetail.scss'
// evenRegistration的scss
import '../styles/eventRegistration.scss'
// group的scss
import '../styles/group.scss'
// groupCreat的scss
import '../styles/groupCreat.scss'

import { GroupAuthProvider } from '@/context/GroupAuthContext'

//  新增加
import { LoadingProviderAnimation } from '@/context/LoadingContext'
import LoadingAnimation from '@/components/LoadingAnimation/LoadingAnimation'

// export default function MyApp({ Component, pageProps }) {
// 導入bootstrap的JS函式庫
// useEffect(() => {
//   import('bootstrap/dist/js/bootstrap')
// }, [])

// 使用預設排版檔案，對應`components/layout/default-layout/index.js`
// 或`components/layout/default-layout.js`
// const getLayout =
//   Component.getLayout || ((page) => <DefaultLayout>{page}</DefaultLayout>)

//   return (
//     <AuthProvider>
//       <LoaderProvider close={3} CustomLoader={LoadingSpinner}>
//         <GroupAuthProvider>
//           <CartProvider>{getLayout(<Component {...pageProps} />)}</CartProvider>
//         </GroupAuthProvider>
//       </LoaderProvider>
//     </AuthProvider>
//   )
// }

// export default function MyApp({ Component, pageProps }) {
//   useEffect(() => {
//     import('bootstrap/dist/js/bootstrap')
//   }, [])

//   const getLayout =
//     Component.getLayout || ((page) => <DefaultLayout>{page}</DefaultLayout>)

//   return (
//     <AuthProvider>
//       <LoadingProviderAnimation close={3} CustomLoader={LoadingAnimation}>
//         <LoaderProvider close={3} CustomLoader={LoadingSpinner}>
//           <GroupAuthProvider>
//             <CartProvider>
//               {getLayout(<Component {...pageProps} />)}
//             </CartProvider>
//           </GroupAuthProvider>
//         </LoaderProvider>
//       </LoadingProviderAnimation>
//     </AuthProvider>
//   )
// }

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap')
  }, [])

  const getLayout =
    Component.getLayout || ((page) => <DefaultLayout>{page}</DefaultLayout>)

  return (
    <AuthProvider>
      <LoadingProviderAnimation close={1} CustomLoader={LoadingAnimation}>
        <LoaderProvider
          close={1}
          CustomLoader={LoadingSpinner}
          excludePaths={['/', '/product']}
        >
          <GroupAuthProvider>
            <CartProvider>
              {getLayout(<Component {...pageProps} />)}
            </CartProvider>
          </GroupAuthProvider>
        </LoaderProvider>
      </LoadingProviderAnimation>
    </AuthProvider>
  )
}
// <LoaderProvider close={2} CustomLoader={CatLoader}> 是一個用於顯示載入動畫的元件。裡面的 close={2} 是指這個載入動畫在某種條件下會自動關閉，而 2 可能代表關閉的延遲時間或狀態碼，具體意圖取決於你的 LoaderProvider 元件實作方式。

// CustomLoader={CatLoader} 意味著你正在使用一個自定義的載入動畫元件，這個元件的名稱是 CatLoader。這樣可以替換掉預設的載入動畫，顯示你想要的動畫效果。
