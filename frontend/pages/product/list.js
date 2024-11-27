import { useEffect, useState } from 'react'
import styles from '@/styles/product.module.scss'
import ProductCard from '@/components/product/product-card'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import Image from 'next/image'
import BackToTop2 from '@/components/BackToTop/BackToTop2'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function List() {
  // 利用網址列的參數來過濾產品
  const router = useRouter()
  const location = router.query
  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const currentPage = location?.page ? parseInt(location.page) : 1
  // 保存新的查詢參數
  const tmpCategory = location?.category
  const tmpCategoryValue = location?.category_value
  const tmpSearch = location?.search
  const tmpPrice = location?.price

  // 監聽網址變化並更新查詢內容
  useEffect(() => {
    const page = location?.page ? parseInt(location.page) : 1
    const category = location?.category
    const categoryValue = location?.category_value
    const price = location?.price
    const search = location?.search
    // 從網址列更新價格範圍
    setPriceMin(price ? Number(price.split('-')[0]) : 5000)
    setPriceMax(price ? Number(price.split('-')[1]) : 200000)
    fetchProducts({
      page,
      category,
      categoryValue,
      price,
      search,
    })
  }, [location])

  // 從後端撈取資料
  const fetchProducts = async ({
    page,
    category,
    categoryValue,
    price,
    search,
  }) => {
    let where = ''

    if (page) {
      where += `page=${page}`
    }
    if (category) {
      where += `&category=${category}`
    }
    if (categoryValue) {
      where += `&category_value=${categoryValue}`
    }
    if (price) {
      where += `&price=${price}`
    }
    if (search) {
      where += `&search=${search}`
    }

    const response = await fetch(
      `http://localhost:3005/api/products/list?${where}`
    )
    const result = await response.json()
    if (result.status === 'success') {
      setProducts(result.data.products)
      setTotalPages(result.data.totalPages)
    } else if (result.status === 'error') {
      setProducts([])
      setTotalPages(0)
    }
  }

  // 當按下按鈕時更新網址列的參數
  const handleButtonClick = (newParams) => {
    const searchParams = new URLSearchParams(location.search)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value)
      }
    })

    // 使用 router.push 更新 URL 並防止頁面刷新後往上捲動
    // router.push(`?${searchParams.toString()}`)
    router.push({ pathname: '/product/list', query: newParams }, undefined, {
      scroll: false,
    })
  }

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
  const [alertType, setAlertType] = useState() // 設定訊息類型
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

  return (
    <>
      <Head>
        <title>產品列表</title>
        <meta name="description" content="Product List" />
      </Head>
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
        <nav className={`${styles.product_breadcrumb}`}></nav>
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
                id="search"
                className={`${styles.product_search}`}
                placeholder="Search"
                onInput={(e) =>
                  handleButtonClick({
                    page: 1,
                    category: tmpCategory,
                    category_value: tmpCategoryValue,
                    search: e.target.value,
                    price: tmpPrice,
                  })
                }
                value={tmpSearch}
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
                value={priceMin}
                onChange={handleMinChange}
                onMouseEnter={() => setTooltipMinVisible(true)}
                onMouseLeave={() => setTooltipMinVisible(false)}
                onMouseUp={() => {
                  handleButtonClick({
                    page: 1,
                    category: tmpCategory,
                    category_value: tmpCategoryValue,
                    search: tmpSearch,
                    price: `${priceMin}-${priceMax}`,
                  })
                }}
                onTouchStart={() => setTooltipMinVisible(true)}
                onTouchEnd={() => {
                  setTooltipMinVisible(false)
                  handleButtonClick({
                    page: 1,
                    category: tmpCategory,
                    category_value: tmpCategoryValue,
                    search: tmpSearch,
                    price: `${priceMin}-${priceMax}`,
                  })
                }}
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
                value={priceMax}
                onChange={handleMaxChange}
                onMouseEnter={() => setTooltipMaxVisible(true)}
                onMouseLeave={() => setTooltipMaxVisible(false)}
                onMouseUp={() => {
                  handleButtonClick({
                    page: 1,
                    category: tmpCategory,
                    category_value: tmpCategoryValue,
                    search: tmpSearch,
                    price: `${priceMin}-${priceMax}`,
                  })
                }}
                onTouchStart={() => setTooltipMaxVisible(true)}
                onTouchEnd={() => {
                  setTooltipMaxVisible(false)
                  handleButtonClick({
                    page: 1,
                    category: tmpCategory,
                    category_value: tmpCategoryValue,
                    search: tmpSearch,
                    price: `${priceMin}-${priceMax}`,
                  })
                }}
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
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_brand',
                          category_value: 'ACER',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      ACER
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_brand',
                          category_value: 'ASUS',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      ASUS
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_brand',
                          category_value: 'DELL',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      DELL
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_brand',
                          category_value: 'GIGABYTE',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      GIGABYTE
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_brand',
                          category_value: 'HP',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      HP
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_brand',
                          category_value: 'MSI',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      MSI
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_brand',
                          category_value: 'RAZER',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      RAZER
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_brand',
                          category_value: 'ROG',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      ROG
                    </a>
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
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'affordance',
                          category_value: '文書',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      文書
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'affordance',
                          category_value: '商務',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      商務
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'affordance',
                          category_value: '電競',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      電競
                    </a>
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
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_size',
                          category_value: '13',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      13吋
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_size',
                          category_value: '14',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      14吋
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_size',
                          category_value: '15',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      15吋
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_size',
                          category_value: '16',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      16吋
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_size',
                          category_value: '17',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      17吋
                    </a>
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
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_display_card',
                          category_value: '4050',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      4050
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_display_card',
                          category_value: '4060',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      4060
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_display_card',
                          category_value: '4070',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      4070
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_display_card',
                          category_value: '4080',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      4080
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_display_card',
                          category_value: '4090',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      4090
                    </a>
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
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_CPU',
                          category_value: 'i3',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      i3
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_CPU',
                          category_value: 'i5',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      i5
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_CPU',
                          category_value: 'i7',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      i7
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_CPU',
                          category_value: 'i9',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      i9
                    </a>
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
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_RAM',
                          category_value: '8',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      8G
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_RAM',
                          category_value: '16',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      16G
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_RAM',
                          category_value: '32',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      32G
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_RAM',
                          category_value: '64',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      64G
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_RAM',
                          category_value: '128',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      128G
                    </a>
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
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_hardisk_volume',
                          category_value: '512',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      512G
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_hardisk_volume',
                          category_value: '1T',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      1T
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_hardisk_volume',
                          category_value: '2T',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      2T
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: 1,
                          category: 'product_hardisk_volume',
                          category_value: '4T',
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                    >
                      4T
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
          {/* 產品列表 */}
          <main className={`${styles.product_list}`}>
            {totalPages === 0 ? (
              <div className={`${styles.product_not_found}`}>查無產品</div>
            ) : (
              // 產品卡片
              products.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product_id={product.product_id}
                  onSendMessage={handleShowMessage}
                />
              ))
            )}
          </main>
        </div>
        <div className={`${styles.product_pagination}`}>
          <ul className={`${styles.product_pagination}`}>
            {/* 顯示頁碼 */}
            {totalPages > 0 && (
              <>
                {/* 左箭頭 */}
                <li className={`${styles.page_item}`}>
                  <a
                    onClick={(e) => {
                      e.preventDefault() // 阻止預設的 href 跳轉
                      handleButtonClick({
                        page: 1,
                        category: tmpCategory,
                        category_value: tmpCategoryValue,
                        search: tmpSearch,
                        price: tmpPrice,
                      })
                    }}
                    href=""
                    className={`${styles.product_page_link}`}
                  >
                    <span aria-hidden="true">&lt;</span>
                  </a>
                </li>
              </>
            )}
            {/* 頁碼 */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const isPageInRange = Math.abs(currentPage - index) <= 3 // 當前頁的前後 5 頁

              if (isPageInRange) {
                return (
                  <li key={index} className={`${styles.product_page_item}`}>
                    <a
                      onClick={(e) => {
                        e.preventDefault() // 阻止預設的 href 跳轉
                        handleButtonClick({
                          page: index + 1,
                          category: tmpCategory,
                          category_value: tmpCategoryValue,
                          search: tmpSearch,
                          price: tmpPrice,
                        })
                      }}
                      href=""
                      className={`${styles.product_page_link}`}
                    >
                      {index + 1}
                    </a>
                  </li>
                )
              }

              // 不顯示不在範圍內的頁碼
              return null
            })}
            {totalPages > 0 && (
              <>
                {/* 右箭頭 */}
                <li className={`${styles.product_page_item}`}>
                  <a
                    onClick={(e) => {
                      e.preventDefault() // 阻止預設的 href 跳轉
                      handleButtonClick({
                        page: totalPages,
                        category: tmpCategory,
                        category_value: tmpCategoryValue,
                        search: tmpSearch,
                        price: tmpPrice,
                      })
                    }}
                    href=""
                    className={`${styles.product_page_link}`}
                  >
                    <span aria-hidden="true">&gt;</span>
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
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

      <BackToTop2 />

      <MyFooter />
    </>
  )
}
List.getLayout = (page) => page
