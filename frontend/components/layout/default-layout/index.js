// import MyNavbar from './my-navbar-nouse'
import Header from './header'
import MyFooter from './my-footer'
import Head from 'next/head'
import { useLoader } from '@/hooks/use-loader'

export default function DefaultLayout({ children }) {
  const { loader } = useLoader()

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width" />
      </Head>
      <Header />
      <main className="flex-shrink-0">

        {children}
        {/* </div> */}
        {loader()}
      </main>
      <MyFooter />
    </>
  )
}
