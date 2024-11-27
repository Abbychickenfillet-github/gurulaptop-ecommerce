import React from 'react'
import styles from '@/styles/product-lease.module.scss'
import Header from '@/components/layout/default-layout/header'
import Footer from '@/components/layout/default-layout/my-footer'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/product/product-card'
import { useAuth } from '@/hooks/use-auth'
import { forEach } from 'lodash'
import BackToTop2 from '@/components/BackToTop/BackToTop2'
import Head from 'next/head'
export default function Detail() {
  // 從網址列的參數取得商品ID，並透過ID取得商品資料
  const router = useRouter()
  const { pid } = router.query
  const [data, setData] = useState(null)
  const [isLoading, setIsLoding] = useState(true)

  const { auth } = useAuth() // 獲取 auth 對象
  const { isAuth } = auth // 獲取 isAuth
  const { userData } = auth // 獲取 userdata

  const [isChecked, setIsChecked] = useState(false) // 用來控制 checkbox 狀態
  const [alertMessage, setAlertMessages] = useState([]) // 使用陣列儲存訊息
  const [alertType, setAlertType] = useState() // 設置訊息的類型
  const [quantity, setQuantity] = useState(1) // 用來控制購買數量

  // 初始化
  const init = async () => {
    try {
      // 確保只在瀏覽器端執行 localStorage 的操作
      if (typeof window !== 'undefined') {
        const response = await fetch(
          `http://localhost:3005/api/favorites/${userData.user_id}/${pid}`
        )
        const result = await response.json()

        if (result.status === 'success') {
          setIsChecked(true)
        }

        // 只有在瀏覽器端才能訪問 localStorage
        const compareProduct = localStorage
          .getItem('compareProduct')
          ?.split(',')
        if (
          compareProduct &&
          (compareProduct[0] === pid || compareProduct[1] === pid)
        ) {
          setIsCompared(true)
        } else {
          setIsCompared(false)
        }
      }
    } catch (error) {
      console.error('初始化錯誤:', error)
    }
  }

  // 初始化
  useEffect(() => {
    init()
  }, [userData, pid]) // 確保在 userData 和 pid 改變時重新執行

  // 新增訊息到陣列
  const handleShowMessage = (message, type) => {
    if (type === 'success') {
      setAlertType('alert-success')
      setAlertMessages((prevMessages) => [...prevMessages, message])
    } else {
      setAlertType('alert-danger')
      setAlertMessages((prevMessages) => [...prevMessages, message])
    }
    setTimeout(() => {
      // 1 秒後移除最早的訊息
      setAlertMessages((prevMessages) => prevMessages.slice(1))
    }, 1000)
  }

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

  // 切換圖片

  const [imgData, setImgData] = useState()

  useEffect(() => {
    if (data?.product_detail_img?.length > 0) {
      setImgData(data.product_detail_img)
    }
  }, [data])

  // 上一張
  const preImage = () => {
    let temp = []
    forEach(imgData, (value, key) => {
      // 更新圖片次序

      if (key === 0) {
        temp.push(imgData[imgData.length - 1])
      } else {
        temp.push(imgData[key - 1])
      }
    })
    setImgData(temp)
  }

  // 下一張
  const nextImage = () => {
    let temp = []
    forEach(imgData, (value, key) => {
      // 更新圖片次序

      if (key === imgData.length - 1) {
        temp.push(imgData[0])
      } else {
        temp.push(imgData[key + 1])
      }
    })
    setImgData(temp)
  }
  // 取得相關商品
  const [relatedProducts, setRelatedProducts] = useState(null)
  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const response = await fetch(
          `http://localhost:3005/api/products/related/${pid}`
        )
        const result = await response.json()
        setRelatedProducts(result.data.randomRelatedProducts)
      } catch (error) {
        console.error('Error fetching data', error)
      }
    }
    if (pid) {
      fetchRelatedProducts()
    }
  }, [pid])

  //收藏按鈕的狀態
  const toggleHeart = async () => {
    if (isAuth) {
      // 點擊按鈕時傳送訊息到父元件
      if (isChecked) {
        //刪除favorite_management資料庫
        try {
          const response = await fetch(
            `http://localhost:3005/api/favorites/${userData.user_id}/${pid}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.ok) {
            // 收藏成功
            handleShowMessage('取消收藏！', 'success')
            setIsChecked(false)
          } else {
            handleShowMessage('取消收藏失敗！', 'error')
          }
        } catch (error) {
          handleShowMessage('取消收藏失敗！', 'error')
        }
      } else {
        //寫入favorite management資料庫
        try {
          const response = await fetch(
            `http://localhost:3005/api/favorites/${userData.user_id}/${pid}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.ok) {
            // 收藏成功
            handleShowMessage('收藏成功！', 'success')
            setIsChecked(true)
          } else {
            handleShowMessage('收藏失敗！', 'error')
          }
        } catch (error) {
          handleShowMessage('收藏失敗！', 'error')
        }
      }
    } else {
      window.location.href = 'http://localhost:3000/member/login'
    }
  }

  // 加入購物車
  const addToCart = async () => {
    if (isAuth) {
      // 加入購物車資料庫
      try {
        const response = await fetch(`http://localhost:3005/api/cart/add`, {
          method: 'PUT',
          body: JSON.stringify({
            user_id: userData.user_id,
            product_id: pid,
            quantity: quantity,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const result = await response.json()
        if (result.status == 'success') {
          handleShowMessage('加入購物車成功！', 'success')
        } else {
          handleShowMessage('加入購物車失敗，請再試一次！', 'error')
        }
      } catch (error) {
        handleShowMessage('加入購物車失敗，請洽管理員！', 'error')
      }
    } else {
      window.location.href = 'http://localhost:3000/member/login'
    }
  }
  //比較按鈕的狀態
  const [isCompared, setIsCompared] = useState(false)
  const toggleCompare = () => {
    const productID = String(pid) // 確保 product_id 是字串格式

    // 取得目前的比較清單或初始化為空陣列
    let compareProduct = localStorage.getItem('compareProduct')
      ? localStorage.getItem('compareProduct').split(',')
      : []

    if (isCompared) {
      // 從比較清單中移除產品 ID
      compareProduct = compareProduct.filter((id) => id !== productID)
      localStorage.setItem('compareProduct', compareProduct.join(','))
      handleShowMessage('取消比較！', 'success')
      setIsCompared(false)
    } else {
      // 檢查比較清單是否已滿
      if (compareProduct.length >= 2) {
        handleShowMessage('比較清單已滿！', 'error')
        return
      }

      // 添加產品 ID 到比較清單
      compareProduct.push(productID)
      localStorage.setItem('compareProduct', compareProduct.join(','))
      handleShowMessage('加入比較！', 'success')
      setIsCompared(true)
    }
  }
  return (
    <>
      <Head>
        <title>{data?.product_name}</title>
      </Head>
      <Header />
      <div className={styles.customBody}>
        <div className={styles.customContainer}>
          <nav className={`${styles.breadcrumb}`}></nav>
          <section className={styles.col1}>
            <div className={styles.menu}>
              <div className={styles.square}>
                <Image
                  src={
                    isLoading
                      ? '' // 加載中，不顯示圖片
                      : imgData?.[0] // 若無圖片路徑，顯示第一張
                      ? `/product/${imgData[0].product_img_path}`
                      : `/product/${data?.product_img[0].product_img_path}`
                  }
                  height={400}
                  width={500}
                  alt="product"
                />
                <div className={`${styles.carouselBtn} ${styles.leftBtn}`}>
                  <Image
                    src="/images/lease/array_left.svg"
                    width={20}
                    height={20}
                    onClick={() => {
                      preImage()
                    }} // 上一張
                    alt="Previous"
                  />
                </div>
                <div className={`${styles.carouselBtn} ${styles.rightBtn}`}>
                  <Image
                    src="/images/lease/array_right.svg"
                    width={20}
                    height={20}
                    onClick={() => {
                      nextImage()
                    }} // 下一張
                    alt="Next"
                  />
                </div>
              </div>
              <div className={styles.menu2}>
                <div className={styles.list}>
                  {!isLoading && imgData?.[1]?.product_img_path && (
                    <Image
                      src={`/product/${imgData[1].product_img_path}`}
                      alt="product"
                      width={120}
                      height={120}
                    />
                  )}
                </div>
                <div className={styles.list}>
                  {!isLoading && imgData?.[2]?.product_img_path && (
                    <Image
                      src={`/product/${imgData[2].product_img_path}`}
                      alt="product"
                      width={120}
                      height={120}
                    />
                  )}
                </div>
                <div className={styles.list}>
                  {!isLoading && imgData?.[3]?.product_img_path && (
                    <Image
                      src={`/product/${imgData[3].product_img_path}`}
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
                      onClick={addToCart}
                    />

                    <input
                      type="checkbox"
                      id="heartCheckbox"
                      checked={isChecked}
                      onChange={toggleHeart}
                      className={styles.product_collection_checkbox}
                    />
                    <svg
                      className={styles.product_collection_icon}
                      onClick={toggleHeart}
                      width={20}
                      height={20}
                      viewBox="0 0 32 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.0102 4.82806C19.0093 1.32194 24.0104 0.378798 27.768 3.58936C31.5255 6.79991 32.0545 12.1679 29.1037 15.965C26.6503 19.122 19.2253 25.7805 16.7918 27.9356C16.5196 28.1768 16.3834 28.2972 16.2247 28.3446C16.0861 28.386 15.9344 28.386 15.7958 28.3446C15.6371 28.2972 15.5009 28.1768 15.2287 27.9356C12.7952 25.7805 5.37022 19.122 2.91682 15.965C-0.0339811 12.1679 0.430418 6.76615 4.25257 3.58936C8.07473 0.412578 13.0112 1.32194 16.0102 4.82806Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <span className={styles.title}>
                  {isLoading ? 'Loading...' : data?.product_name}
                </span>

                <div className={styles.project}>
                  <div className={styles.project2}>
                    <span className={styles.price}>
                      {isLoading
                        ? 'Loading...'
                        : `NT ${new Intl.NumberFormat('zh-TW').format(
                            data.list_price
                          )}元`}
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
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.buttonContainer}>
                  {/* 加入購物車並挑轉到購物車頁 */}
                  <button
                    className={styles.rentButton}
                    onClick={() => {
                      addToCart()
                      router.push('/cart')
                    }}
                  >
                    購買
                  </button>
                  <div className={styles.articleCheckbox}>
                    <input
                      onChange={toggleCompare}
                      checked={isCompared}
                      type="checkbox"
                      id="customCheck"
                    />
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
                {!isLoading && data?.affordance && (
                  <li>用途： {data.affordance}</li>
                )}
                {!isLoading && data?.product_CPU && (
                  <li>處理器： {data.product_CPU}</li>
                )}
                {!isLoading && data?.product_RAM && (
                  <li>記憶體： {data.product_RAM}</li>
                )}
                {!isLoading &&
                  data?.product_hardisk_type &&
                  data?.product_hardisk_volume && (
                    <li>
                      硬碟： {data.product_hardisk_type}{' '}
                      {data.product_hardisk_volume}
                    </li>
                  )}
                {!isLoading && data?.product_OS && (
                  <li>作業系統： {data.product_OS}</li>
                )}
                {!isLoading &&
                  data?.product_display_card &&
                  (data.discrete_display_card == 'yes' ? (
                    <li>顯示卡： {data.product_display_card}</li>
                  ) : (
                    <li>顯示晶片：{data.product_display_card}</li>
                  ))}
                {!isLoading && data?.product_wireless && (
                  <li>無線網路： {data.product_wireless}</li>
                )}
                {!isLoading && data?.product_camera && (
                  <li>攝影機： {data.product_camera}</li>
                )}
                {!isLoading && data?.product_keyboard && (
                  <li>鍵盤： {data.product_keyboard}</li>
                )}
                {!isLoading && data?.product_cardreader && (
                  <li>讀卡機： {data.product_cardreader}</li>
                )}
                {!isLoading && data?.['product_I/O'] && (
                  <li>I/O： {data['product_I/O']}</li>
                )}
                {!isLoading && data?.product_color && (
                  <li>顏色： {data.product_color}</li>
                )}
                {!isLoading && data?.product_power && (
                  <li>電源： {data.product_power}</li>
                )}
                {!isLoading && data?.product_weight && (
                  <li>重量： {data.product_weight}</li>
                )}
                {!isLoading && data?.product_size && (
                  <li>尺寸： {data.product_size}</li>
                )}
                <li>2年全球保固 + 首年完美保固</li>
              </ul>
            </div>
          </section>

          <section className={styles.col3}>
            <div className={styles.relatedProducts}>
              <span className={styles.diamond}></span>
              <span className={styles.title3}>相關商品</span>
            </div>

            <div className={styles.relatedProductsList}>
              {relatedProducts?.map((product) => (
                <div key={product.product_id}>
                  <ProductCard
                    onSendMessage={handleShowMessage}
                    product_id={product.product_id}
                  />
                </div>
              ))}
            </div>
          </section>
          <BackToTop2 />
        </div>
        {/* 顯示所有的訊息 */}
        <div className="alert-container">
          {alertMessage.map((msg, index) => (
            <div
              key={index}
              className={`alert ${alertType} alert-dismissible fade show`}
              style={{
                zIndex: 9999,
                position: 'fixed',
                top: `${20 + index * 60}px`, // 每次增加 60px，避免重疊
                right: '20px',
                width: 'auto',
              }}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
Detail.getLayout = (page) => page
