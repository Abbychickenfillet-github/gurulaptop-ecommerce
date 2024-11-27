// import MyNavbar from './my-navbar-nouse'
import MyNavbarBS5 from './my-navbar'
import Header from './header'
import MyFooter from './my-footer'
import Head from 'next/head'
import NextBreadCrumb from '@/components/common/next-breadcrumb'
import { useLoader } from '@/hooks/use-loader'

export default function DefaultLayout({ title = 'Next-BS5', children }) {
  const { loader } = useLoader()

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width" />
      </Head>
      <Header />
      <main className="flex-shrink-0">
        {/* <div className="container">
          <NextBreadCrumb isHomeIcon isChevron bgClass="bg-transparent" /> */}
        {children}
        {/* </div> */}
        {/* 全域的載入動畫指示器 */}
        {loader()}
      </main>
      <MyFooter />
    </>
  )
}
