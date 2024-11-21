import { useEffect } from 'react'
import styles from '@/styles/compare.module.scss'
import NextBreadCrumbLight from '@/components/common/next-breadcrumb-light'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/router'
import BackToTop2 from '@/components/BackToTop/BackToTop2'
import Head from 'next/head'
export default function Compare() {
  const [compareProduct, setCompareProduct] = useState([])
  const [productDataFirst, setProductDataFirst] = useState([])
  const [productDataSecond, setProductDataSecond] = useState([])
  const router = useRouter()
  useEffect(() => {
    let compareProduct = []
    // 初始化比較清單
    if (!localStorage.getItem('compareProduct')) {
      localStorage.setItem('compareProduct', '')
      //取消顯示比較清單
      setCompareProduct([])
    } else {
      // 取得比較清單
      compareProduct = localStorage.getItem('compareProduct').split(',')
      // 顯示比較清單
      setCompareProduct(compareProduct)
    }
    //從後端撈取兩張表的詳細資料

    async function fetchProduct() {
      if (compareProduct.length === 0) return
      else if (compareProduct.length === 1) {
        {
          const responseFirst = await fetch(
            `http://localhost:3005/api/products/${compareProduct[0]}`
          )
          setProductDataFirst((await responseFirst.json()).data.product)
        }
      } else if (compareProduct.length === 2) {
        {
          const responseFirst = await fetch(
            `http://localhost:3005/api/products/${compareProduct[0]}`
          )
          setProductDataFirst((await responseFirst.json()).data.product)
          const responseSecond = await fetch(
            `http://localhost:3005/api/products/${compareProduct[1]}`
          )
          setProductDataSecond((await responseSecond.json()).data.product)
        }
      }
    }
    if (compareProduct.length > 0) {
      fetchProduct()
    }
  }, [])

  return (
    <>
      <Head>
        <title>比較</title>
      </Head>
      <Header />
      <div className={`${styles.compare_container}`}>
        <nav className={`${styles.compare_breadcrumb}`}>
          <NextBreadCrumbLight isHomeIcon={true} bgClass="transparent" />
        </nav>

        <main className={`${styles.container} ${styles.active}`}>
          <div
            className={`${styles.compare_box} ${
              compareProduct.length === 0 ? styles.active : ''
            }`}
            role="button"
            tabIndex={0}
            onClick={() => router.push('/product')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                router.push('/product')
              }
            }}
          >
            <div className={`${styles.compare_plus_icon}`}>+</div>
          </div>
          <div
            id="compareBox1"
            className={`${styles.compare_card} ${
              compareProduct.length >= 1 ? styles.active : ''
            }`}
          >
            <Image
              src={`/product/${productDataFirst?.product_img?.[0]?.product_img_path}`}
              alt="Product Image"
              className={`${styles.compare_image}`}
              width={300}
              height={300}
            />
            <div className={`${styles.compare_specifications}`}>
              <p>名稱：{productDataFirst.product_name}</p>
              <p>型號： {productDataFirst.model}</p>
              <p>廠牌： {productDataFirst.product_brand}</p>

              <p>
                價格：{' '}
                {`NT ${new Intl.NumberFormat('zh-TW').format(
                  productDataFirst.list_price
                )}元`}
              </p>
              <p>用途： {productDataFirst.affordance}</p>
              <p>處理器： {productDataFirst.product_CPU}</p>

              <p>記憶體： {productDataFirst.product_RAM}</p>

              <p>
                硬碟： {productDataFirst.product_hardisk_type}{' '}
                {productDataFirst.product_hardisk_volume}
              </p>

              <p>作業系統： {productDataFirst.product_OS}</p>

              {productDataFirst.discrete_display_card == 'yes' ? (
                <p>顯示卡： {productDataFirst.product_display_card}</p>
              ) : (
                <p>顯示晶片：{productDataFirst.product_display_card}</p>
              )}

              <p>無線網路： {productDataFirst.product_wireless}</p>

              <p>攝影機： {productDataFirst.product_camera}</p>

              <p>鍵盤： {productDataFirst.product_keyboard}</p>

              <p>讀卡機： {productDataFirst.product_cardreader}</p>

              <p>I/O： {productDataFirst['product_I/O']}</p>

              <p>顏色： {productDataFirst.product_color}</p>

              <p>電源： {productDataFirst.product_power}</p>

              <p>重量： {productDataFirst.product_weight}</p>

              <p>尺寸： {productDataFirst.product_size}</p>

              <p>2年全球保固 + 首年完美保固</p>
            </div>
          </div>
          <div
            className={`${styles.compare_box} ${
              compareProduct.length <= 1 ? styles.active : ''
            }`}
            role="button"
            tabIndex={0}
            onClick={() => router.push('/product')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                router.push('/product')
              }
            }}
          >
            <div className={`${styles.compare_plus_icon}`}>+</div>
          </div>
          {/* Product Card 2 */}
          <div
            id="compareBox2"
            className={`${styles.compare_card}  ${
              compareProduct.length === 2 ? styles.active : ''
            }`}
          >
            <Image
              src={`/product/${productDataSecond?.product_img?.[0]?.product_img_path}`}
              alt="Product Image"
              className={`${styles.compare_image}`}
              width={300}
              height={300}
            />
            <div className={`${styles.compare_specifications}`}>
              <p>名稱：{productDataSecond.product_name}</p>
              <p>型號： {productDataSecond.model}</p>
              <p>廠牌： {productDataSecond.product_brand}</p>

              <p>
                價格：{' '}
                {`NT ${new Intl.NumberFormat('zh-TW').format(
                  productDataSecond.list_price
                )}元`}
              </p>
              <p>用途： {productDataSecond.affordance}</p>
              <p>處理器： {productDataSecond.product_CPU}</p>

              <p>記憶體： {productDataSecond.product_RAM}</p>

              <p>
                硬碟： {productDataSecond.product_hardisk_type}{' '}
                {productDataSecond.product_hardisk_volume}
              </p>

              <p>作業系統： {productDataSecond.product_OS}</p>

              {productDataSecond.discrete_display_card == 'yes' ? (
                <p>顯示卡： {productDataSecond.product_display_card}</p>
              ) : (
                <p>顯示晶片：{productDataSecond.product_display_card}</p>
              )}

              <p>無線網路： {productDataSecond.product_wireless}</p>

              <p>攝影機： {productDataSecond.product_camera}</p>

              <p>鍵盤： {productDataSecond.product_keyboard}</p>

              <p>讀卡機： {productDataSecond.product_cardreader}</p>

              <p>I/O： {productDataSecond['product_I/O']}</p>

              <p>顏色： {productDataSecond.product_color}</p>

              <p>電源： {productDataSecond.product_power}</p>

              <p>重量： {productDataSecond.product_weight}</p>

              <p>尺寸： {productDataSecond.product_size}</p>

              <p>2年全球保固 + 首年完美保固</p>
            </div>
          </div>
        </main>
        {/* 清除cookies */}
        <button
          className={`${styles.clear_compare} ${
            compareProduct.length !== 0 ? styles.active : ''
          } `}
          onClick={() => {
            localStorage.setItem('compareProduct', '')
            setCompareProduct([])
            setProductDataFirst([])
            setProductDataSecond([])
          }}
        >
          清除比較
        </button>
      </div>
      <BackToTop2 />
      <MyFooter />
    </>
  )
}
Compare.getLayout = (page) => page
