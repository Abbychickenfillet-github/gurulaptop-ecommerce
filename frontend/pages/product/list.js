import { useEffect, useState } from 'react'
import styles from '@/styles/product.module.scss'
import NextBreadCrumbLight from '@/components/common/next-breadcrumb-light'
import ProductCard from '@/components/product/product-card'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import Image from 'next/image'
import BackToTop from '@/components/BackToTop/BackToTop'
export default function List() {
  // 小尺寸時的側邊欄開關
  const [isChecked, setIsChecked] = useState(false)
  const handleToggle = (event) => {
    setIsChecked(event.target.checked)
  }

  // 價格提示框 與 防呆
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(200000)
  const [tooltipMinVisible, setTooltipMinVisible] = useState(false)
  const [tooltipMaxVisible, setTooltipMaxVisible] = useState(false)

  const handleMinChange = (e) => {
    const minValue = parseInt(e.target.value)
    if (minValue + 4000 > priceMax) {
      setPriceMin(priceMax - 4000)
    } else {
      setPriceMin(minValue)
    }
  }

  const handleMaxChange = (e) => {
    const maxValue = parseInt(e.target.value)
    if (maxValue - 4000 < priceMin) {
      setPriceMax(priceMin + 4000)
    } else {
      setPriceMax(maxValue)
    }
  }

  const updateTooltipPosition = (value, min, max, sliderWidth) => {
    const percent = (value - min) / (max - min)
    return percent * sliderWidth
  }

  // 狀態顯示訊息

  const [alertMessage, setAlertMessages] = useState([]) // 使用陣列儲存訊息

  // 新增訊息到陣列
  const handleShowMessage = (message) => {
    setAlertMessages((prevMessages) => [...prevMessages, message])
    setTimeout(() => {
      // 1 秒後移除最早的訊息
      setAlertMessages((prevMessages) => prevMessages.slice(1))
    }, 1000)
  }

  return (
    <>
      <Header />
      <div className={`${styles.product_container}`}>
        <div className={`${styles.product_banner}`}>
          <div className={`${styles.product_text_container}`}>
            <h1 className={`${styles.product_banner_title}`}>Products</h1>
            <div className={`${styles.product_banner_content}`}>
              各種筆電官方品牌發文
              <br />
              最新的官方品牌情報在 GURU！
            </div>
          </div>
        </div>
        <nav className={`${styles.product_breadcrumb}`}>
          <NextBreadCrumbLight bgClass="transparent" isHomeIcon="true" />
        </nav>
        <input
          type="checkbox"
          id="product_aside_toggle"
          onChange={handleToggle}
          className={`${styles.product_aside_toggle}`}
        />
        <div className={`${styles.product_aside_toggle_wrapper}`}>
          <label
            htmlFor="product_aside_toggle"
            className={`${styles.product_aside_toggle_title}`}
          >
            Menu
          </label>
          <label
            htmlFor="product_aside_toggle"
            className={`${styles.product_aside_toggle_logo}`}
          >
            ▼
          </label>
        </div>
        <div className="d-flex align-items-start">
          {/* 側邊欄 */}
          <aside
            className={`${styles.product_aside} ${
              isChecked ? `${styles.show}` : ''
            }`}
          >
            <div className={`${styles.product_aside_content}`}>
              <input
                type="text"
                className={`${styles.product_search}`}
                placeholder="Search"
              />
              <Image
                src="/images/product/search.svg"
                className={`${styles.product_search_icon}`}
                alt="search"
                width={20}
                height={20}
              />
            </div>
            <div className={`${styles.product_slider_container}`}>
              <span className={`${styles.product_slider_title}`}>價格範圍</span>
              <input
                type="range"
                min={5000}
                max={200000}
                defaultValue={5000}
                value={priceMin}
                onInput={handleMinChange}
                onMouseEnter={() => setTooltipMinVisible(true)}
                onMouseLeave={() => setTooltipMinVisible(false)}
                className={`${styles.product_slider}`}
                id="slider-1"
              />
              {tooltipMinVisible && (
                <div
                  id="price_tip-1"
                  style={{
                    left: `${updateTooltipPosition(
                      priceMin,
                      0,
                      200000,
                      150
                    )}px`,
                  }}
                  className={`${styles.price_tip}`}
                >
                  {priceMin}
                </div>
              )}

              <input
                type="range"
                min={5000}
                max={200000}
                defaultValue={200000}
                value={priceMax}
                onInput={handleMaxChange}
                onMouseEnter={() => setTooltipMaxVisible(true)}
                onMouseLeave={() => setTooltipMaxVisible(false)}
                className={`${styles.product_slider}`}
                id="slider-2"
              />
              {tooltipMaxVisible && (
                <div
                  id="price_tip-2"
                  style={{
                    left: `${updateTooltipPosition(
                      priceMax,
                      0,
                      200000,
                      150
                    )}px`,
                  }}
                  className={`${styles.price_tip}`}
                >
                  {priceMax}
                </div>
              )}
            </div>
            {/* 選單 */}
            <div className={`${styles.product_list_container}`}>
              {/* 選單控制區 */}
              <input
                type="checkbox"
                id="menu-toggle1"
                className={`${styles.menu_toggle}`}
              />
              <div className={`${styles.menu_toggle_wrapper}`}>
                <label
                  htmlFor="menu-toggle1"
                  className={`${styles.menu_title}`}
                >
                  品牌
                </label>
                <label htmlFor="menu-toggle1" className={`${styles.menu_icon}`}>
                  ▼
                </label>
              </div>
              {/* 摺疊選單內容 */}
              <div className={`${styles.menu_content}`}>
                <ul>
                  <li>
                    <a href="">ACER</a>
                  </li>
                  <li>
                    <a href="">ASUS</a>
                  </li>
                  <li>
                    <a href="">DELL</a>
                  </li>
                  <li>
                    <a href="">GIGABYTE</a>
                  </li>
                  <li>
                    <a href="">HP</a>
                  </li>
                  <li>
                    <a href="">MSI</a>
                  </li>
                  <li>
                    <a href="">RAZER</a>
                  </li>
                  <li>
                    <a href="">ROG</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${styles.product_list_container}`}>
              {/* 選單控制區 */}
              <input
                type="checkbox"
                id="menu-toggle2"
                className={`${styles.menu_toggle}`}
              />
              <div className={`${styles.menu_toggle_wrapper}`}>
                <label
                  htmlFor="menu-toggle2"
                  className={`${styles.menu_title}`}
                >
                  用途
                </label>
                <label htmlFor="menu-toggle2" className={`${styles.menu_icon}`}>
                  ▼
                </label>
              </div>
              {/* 摺疊選單內容 */}
              <div className={`${styles.menu_content}`}>
                <ul>
                  <li>
                    <a href="">文書</a>
                  </li>
                  <li>
                    <a href="">商務</a>
                  </li>
                  <li>
                    <a href="">電競</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${styles.product_list_container}`}>
              {/* 選單控制區 */}
              <input
                type="checkbox"
                id="menu-toggle3"
                className={`${styles.menu_toggle}`}
              />
              <div className={`${styles.menu_toggle_wrapper}`}>
                <label
                  htmlFor="menu-toggle3"
                  className={`${styles.menu_title}`}
                >
                  螢幕尺寸
                </label>
                <label htmlFor="menu-toggle3" className={`${styles.menu_icon}`}>
                  ▼
                </label>
              </div>
              {/* 摺疊選單內容 */}
              <div className={`${styles.menu_content}`}>
                <ul>
                  <li>
                    <a href="">14吋</a>
                  </li>
                  <li>
                    <a href="">15吋</a>
                  </li>
                  <li>
                    <a href="">15.6吋</a>
                  </li>
                  <li>
                    <a href="">16吋</a>
                  </li>
                  <li>
                    <a href="">17吋</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${styles.product_list_container}`}>
              {/* 選單控制區 */}
              <input
                type="checkbox"
                id="menu-toggle4"
                className={`${styles.menu_toggle}`}
              />
              <div className={`${styles.menu_toggle_wrapper}`}>
                <label
                  htmlFor="menu-toggle4"
                  className={`${styles.menu_title}`}
                >
                  顯卡
                </label>
                <label htmlFor="menu-toggle4" className={`${styles.menu_icon}`}>
                  ▼
                </label>
              </div>
              {/* 摺疊選單內容 */}
              <div className={`${styles.menu_content}`}>
                <ul>
                  <li>
                    <a href="">4050</a>
                  </li>
                  <li>
                    <a href="">4060</a>
                  </li>
                  <li>
                    <a href="">4070</a>
                  </li>
                  <li>
                    <a href="">4080</a>
                  </li>
                  <li>
                    <a href="">4090</a>
                  </li>
                  <li>
                    <a href="">其他</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${styles.product_list_container}`}>
              {/* 選單控制區 */}
              <input
                type="checkbox"
                id="menu-toggle5"
                className={`${styles.menu_toggle}`}
              />
              <div className={`${styles.menu_toggle_wrapper}`}>
                <label
                  htmlFor="menu-toggle5"
                  className={`${styles.menu_title}`}
                >
                  處理器
                </label>
                <label htmlFor="menu-toggle5" className={`${styles.menu_icon}`}>
                  ▼
                </label>
              </div>
              {/* 摺疊選單內容 */}
              <div className={`${styles.menu_content}`}>
                <ul>
                  <li>
                    <a href="">i3</a>
                  </li>
                  <li>
                    <a href="">i5</a>
                  </li>
                  <li>
                    <a href="">i7</a>
                  </li>
                  <li>
                    <a href="">其他</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${styles.product_list_container}`}>
              {/* 選單控制區 */}
              <input
                type="checkbox"
                id="menu-toggle6"
                className={`${styles.menu_toggle}`}
              />
              <div className={`${styles.menu_toggle_wrapper}`}>
                <label
                  htmlFor="menu-toggle6"
                  className={`${styles.menu_title}`}
                >
                  記憶體
                </label>
                <label htmlFor="menu-toggle6" className={`${styles.menu_icon}`}>
                  ▼
                </label>
              </div>
              {/* 摺疊選單內容 */}
              <div className={`${styles.menu_content}`}>
                <ul>
                  <li>
                    <a href="">8G</a>
                  </li>
                  <li>
                    <a href="">16G</a>
                  </li>
                  <li>
                    <a href="">32G</a>
                  </li>
                  <li>
                    <a href="">64G</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`${styles.product_list_container}`}>
              {/* 選單控制區 */}
              <input
                type="checkbox"
                id="menu-toggle7"
                className={`${styles.menu_toggle}`}
              />
              <div className={`${styles.menu_toggle_wrapper}`}>
                <label
                  htmlFor="menu-toggle7"
                  className={`${styles.menu_title}`}
                >
                  硬碟容量
                </label>
                <label htmlFor="menu-toggle7" className={`${styles.menu_icon}`}>
                  ▼
                </label>
              </div>
              {/* 摺疊選單內容 */}
              <div className={`${styles.menu_content}`}>
                <ul>
                  <li>
                    <a href="">256G</a>
                  </li>
                  <li>
                    <a href="">512G</a>
                  </li>
                  <li>
                    <a href="">1T</a>
                  </li>
                  <li>
                    <a href="">2T</a>
                  </li>
                  <li>
                    <a href="">其他</a>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
          {/* 產品列表 */}
          <main className={`${styles.product_list}`}>
            {
              // 產品卡片
              [...Array(12)].map((v, i) => (
                <ProductCard
                  onSendMessage={handleShowMessage}
                  key={i}
                  product_id={275}
                />
              ))
            }
          </main>
        </div>
        <div className={`${styles.product_pagination}`}>
          <ul className={`${styles.product_pagination}`}>
            {/* 左箭頭 */}
            <li className={`${styles.page_item}`}>
              <a
                className={`${styles.product_page_link}`}
                href="#"
                aria-label="Previous"
              >
                <span aria-hidden="true">&lt;</span>
              </a>
            </li>
            {/* 頁碼 */}
            <li className={`${styles.product_page_item}`}>
              <a className={`${styles.product_page_link}`} href="">
                1
              </a>
            </li>
            <li className={`${styles.product_page_item}`}>
              <a className={`${styles.product_page_link}`} href="">
                2
              </a>
            </li>
            <li className={`${styles.product_page_item}`}>
              <a className={`${styles.product_page_link}`} href="">
                ...
              </a>
            </li>
            <li className={`${styles.product_page_item}`}>
              <a className={`${styles.product_page_link}`} href="">
                29
              </a>
            </li>
            <li className={`${styles.product_page_item}`}>
              <a className={`${styles.product_page_link}`} href="">
                30
              </a>
            </li>
            {/* 右箭頭 */}
            <li className={`${styles.product_page_item}`}>
              <a
                className={`${styles.product_page_link}`}
                href="#"
                aria-label="Next"
              >
                <span aria-hidden="true">&gt;</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* 顯示所有的訊息 */}
      <div className="alert-container">
        {alertMessage.map((msg, index) => (
          <div
            key={index}
            className="alert alert-success alert-dismissible fade show"
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
      <BackToTop />
      <MyFooter />
    </>
  )
}
List.getLayout = (page) => page
