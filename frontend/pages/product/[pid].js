import React from 'react'
import styles from '@/styles/product-lease.module.scss'
import BackToTop from '@/components/BackToTop/BackToTop'
import Header from '@/components/layout/default-layout/header'
import Footer from '@/components/layout/default-layout/my-footer'
import NextBreadCrumbLight from '@/components/common/next-breadcrumb-light'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Detail() {
  // 從網址列的參數取得商品ID，並透過ID取得商品資料
  const router = useRouter()
  const { pid } = router.query
  const [data, setData] = useState(null)
  const [isLoading, setIsLoding] = useState(true)
  useEffect(() => {
    async function fetchProduct(pid) {
      //抓取商品資料
      try {
        const response = await fetch(
          `http://localhost:3005/api/products/${pid}`
        )
        const result = await response.json()
        setData(result.data.product)
        setIsLoding(false)
      } catch (error) {
        //如果發生錯誤，重新導向商品列表
        router.push('/product/list')
      }
    }

    if (pid) {
      fetchProduct(pid)
    }
  }, [pid])
  return (
    <>
      <Header />
      <div className={styles.customBody}>
        <div className={styles.customContainer}>
          <nav className={`${styles.breadcrumb}`}>
            <NextBreadCrumbLight bgClass="transparent" isHomeIcon="true" />
          </nav>
          <section className={styles.col1}>
            <div className={styles.menu}>
              <div className={styles.square}>
                <Image
                  src={
                    isLoading
                      ? '' // 加載中，不顯示圖片
                      : data?.product_detail_img?.[0] // 若有圖片路徑，顯示第一張
                      ? `/product/${data.product_detail_img[0].product_img_path}`
                      : `/product/${data?.product_img[0].product_img_path}`
                  }
                  height={400}
                  width={500}
                  alt="Product"
                />
                <div className={`${styles.carouselBtn} ${styles.leftBtn}`}>
                  <Image
                    src="/images/lease/array_left.svg"
                    width={20}
                    height={20}
                    alt="Previous"
                  />
                </div>
                <div className={`${styles.carouselBtn} ${styles.rightBtn}`}>
                  <Image
                    src="/images/lease/array_right.svg"
                    width={20}
                    height={20}
                    alt="Next"
                  />
                </div>
              </div>
              <div className={styles.menu2}>
                <div className={styles.list}>
                  {!isLoading &&
                    data?.product_detail_img?.[1]?.product_img_path && (
                      <Image
                        src={`/product/${data.product_detail_img[1].product_img_path}`}
                        alt="product"
                        width={120}
                        height={120}
                      />
                    )}
                </div>
                <div className={styles.list}>
                  {!isLoading &&
                    data?.product_detail_img?.[2]?.product_img_path && (
                      <Image
                        src={`/product/${data.product_detail_img[2].product_img_path}`}
                        alt="product"
                        width={120}
                        height={120}
                      />
                    )}
                </div>
                <div className={styles.list}>
                  {!isLoading &&
                    data?.product_detail_img?.[3]?.product_img_path && (
                      <Image
                        src={`/product/${data.product_detail_img[3].product_img_path}`}
                        alt="product"
                        width={120}
                        height={120}
                      />
                    )}
                </div>
              </div>
            </div>

            <div className={styles.productInfo}>
              <div className={styles.productInfo2}>
                <div className={styles.brand}>
                  <span>{isLoading ? 'Loading...' : data?.product_brand}</span>
                  <div className={styles.icon}>
                    <Image
                      className={styles.cart}
                      src="/images/lease/cart.svg"
                      alt="Cart"
                      width={20}
                      height={20}
                    />
                    <Image
                      className={styles.heart}
                      src="/images/lease/heart.svg"
                      alt="Favorite"
                      width={20}
                      height={20}
                    />
                  </div>
                </div>

                <span className={styles.title}>
                  {isLoading ? 'Loading...' : data?.product_name}
                </span>

                <div className={styles.project}>
                  <div className={styles.project2}>
                    <span className={styles.price}>
                      {isLoading ? 'Loading...' : data?.list_price}
                    </span>
                  </div>
                </div>

                <div className={styles.quantityContainer}>
                  <div className={styles.quantity}>
                    <span className={styles.quantityLabel}>購買數量</span>
                    <div className={styles.quantitySelector}>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        max="99"
                        defaultValue={1}
                        className={styles.quantityInput}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.buttonContainer}>
                  <button className={styles.rentButton}>購買</button>
                  <div className={styles.articleCheckbox}>
                    <input type="checkbox" id="customCheck" />
                    <label htmlFor="customCheck" style={{ color: 'white' }}>
                      &nbsp;&nbsp;加入比較
                    </label>
                  </div>
                </div>

                <div className={styles.description}>
                  <p>CPU : {isLoading ? 'Loading...' : data?.product_CPU}</p>
                  <p>記憶體：{isLoading ? 'Loading...' : data?.product_RAM}</p>
                  <p>
                    硬碟：
                    {isLoading
                      ? 'Loading...'
                      : data?.product_hardisk_type +
                        ' ' +
                        data?.product_hardisk_volume}
                  </p>
                  {!isLoading && data?.product_OS && (
                    <p>作業系統： {data.product_OS}</p>
                  )}
                  <p>型號：{isLoading ? 'Loading...' : data?.model}</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.col2}>
            <div className={styles.productSpecs}>
              <div className={styles.title2}>產品規格</div>
              <ul>
                <li>
                  16" Mini LED WQXGA (2560x1600), 16:10, 240Hz, 3ms, DCI-P3
                  100%；副螢幕：14" IPS ScreenPad Plus (3840x1100) 4K
                </li>
                <li>AMD Ryzen 9 7945HX (2.5GHz up to 5.4GHz, 64MB) 16 Cores</li>
                <li>64GB (32GB*2) DDR5-4800 SO-DIMM (2Slot, Max.64GB)</li>
                <li>硬碟: 2TB+2TB PCIe 4.0 NVMe M.2 SSD (RAID 0)</li>
                <li>作業系統: Windows 11 Home</li>
                <li>
                  獨顯: NVIDIA GeForce RTX 4090 16GB GDDR6 (具備MUX獨顯直連)
                </li>
                <li>
                  無線網路: Wi-Fi 6E(802.11ax) (Triple band) 2*2 + Bluetooth 5.2
                </li>
                <li>1080P FHD@30FPS Camera</li>
                <li>RGB背光鍵盤</li>
                <li>Support NumberPad</li>
                <li>card reader (microSD) (UHS-II, 312MB/s)</li>
                <li>
                  I/O: 1*RJ45(2.5G LAN), 1*USB-C 3.2 Gen2 支援 DisplayPort /
                  電力供應, 1*USB-C 3.2 Gen2 支援 DisplayPort, 2*USB-A 3.2 Gen2,
                  1*HDMI 2.1 FRL, 1*耳機麥克風孔
                </li>
                <li>變壓器: 330W AC Adapter</li>
                <li>重量: 2.67 Kg</li>
                <li>尺寸: 35.5 x 26.6 x 2.05 – 2.97 cm</li>
                <li>2年全球保固 + 首年完美保固</li>
                <li>
                  配件: ROG Ranger BP2701 極輕量電競後背包, ROG Fusion II 300
                  電競耳機, ROG Gladius III 電競滑鼠
                </li>
              </ul>
            </div>
          </section>

          <section className={styles.col3}>
            <div className={styles.relatedProducts}>
              <span className={styles.diamond}>◇</span>
              <span className={styles.title3}>相關商品</span>
            </div>
          </section>
          <BackToTop />
        </div>
      </div>
      <Footer />
    </>
  )
}
Detail.getLayout = (page) => page
