import React, { useState, useEffect } from 'react'
import styles from '@/styles/product-card.module.scss'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'

export default function ProductCard({ onSendMessage, product_id }) {
  // 產品卡片的 key 值，用於比較功能的 checkbox
  const key = Math.random()
  // 從後端撈取資料
  const [data, setData] = useState(null)

  const { auth } = useAuth() // 獲取 auth 對象
  const { isAuth } = auth // 獲取 isAuth
  const { userData } = auth // 獲取 userdata

  const [isChecked, setIsChecked] = useState(false) // 用來控制 checkbox 狀態

  // 初始化
  const init = async () => {
    const response = await fetch(
      `http://localhost:3005/api/favorites/${userData?.user_id}/${product_id}`
    )
    const result = await response.json()
    if (result.status === 'success') {
      setIsChecked(true)
    }

    if (
      localStorage.getItem('compareProduct')?.split(',')?.[0] == product_id ||
      localStorage.getItem('compareProduct')?.split(',')?.[1] == product_id
    ) {
      setIsCompared(true)
    }
  }
  // 初始化
  init()

  useEffect(() => {
    async function fetchProduct() {
      if (product_id) {
        try {
          const response = await fetch(
            `http://localhost:3005/api/products/card/${product_id}`
          )
          const result = await response.json()
          setData(result.data.product)
        } catch (error) {
          console.error('Error fetching data', error)
        }
      }
    }
    fetchProduct()
  }, [product_id]) // 加入依賴陣列，確保在 product_id 改變時重新執行

  //比較按鈕的狀態
  const [isCompared, setIsCompared] = useState(false)
  const toggleCompare = () => {
    const productID = String(product_id) // 確保 product_id 是字串格式

    // 取得目前的比較清單或初始化為空陣列
    let compareProduct = localStorage.getItem('compareProduct')
      ? localStorage.getItem('compareProduct').split(',')
      : []

    if (isCompared) {
      // 從比較清單中移除產品 ID
      compareProduct = compareProduct.filter((id) => id !== productID)
      localStorage.setItem('compareProduct', compareProduct.join(','))
      onSendMessage('取消比較！', `success`)
      setIsCompared(false)
    } else {
      // 檢查比較清單是否已滿
      if (compareProduct.length >= 2) {
        onSendMessage('比較清單已滿！', `error`)
        return
      }

      // 添加產品 ID 到比較清單
      compareProduct.push(productID)
      localStorage.setItem('compareProduct', compareProduct.join(','))
      onSendMessage('加入比較！', `success`)
      setIsCompared(true)
    }
  }

  //收藏按鈕的狀態
  const toggleHeart = async () => {
    if (isAuth) {
      // 點擊按鈕時傳送訊息到父元件
      if (isChecked) {
        //刪除favorite_management資料庫
        try {
          const response = await fetch(
            `http://localhost:3005/api/favorites/${userData.user_id}/${product_id}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.ok) {
            // 收藏成功
            onSendMessage('取消收藏！', 'success')
            setIsChecked(false)
          } else {
            onSendMessage('取消收藏失敗！', 'error')
          }
        } catch (error) {
          onSendMessage('取消收藏失敗！', 'error')
        }
      } else {
        //寫入favorite management資料庫
        try {
          const response = await fetch(
            `http://localhost:3005/api/favorites/${userData.user_id}/${product_id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.ok) {
            // 收藏成功
            onSendMessage('收藏成功！', 'success')
            setIsChecked(true)
          } else {
            onSendMessage('收藏失敗！', 'error')
          }
        } catch (error) {
          onSendMessage('收藏失敗！', 'error')
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
            product_id: product_id,
            quantity: 1,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const result = await response.json()
        if (result.status == 'success') {
          onSendMessage('加入購物車成功！', `success`)
        } else {
          onSendMessage('加入購物車失敗，請再試一次！', `error`)
        }
      } catch (error) {
        onSendMessage('加入購物車失敗，請洽管理員！', `error`)
      }
    } else {
      window.location.href = 'http://localhost:3000/member/login'
    }
  }

  return (
    <div className={styles.product_card}>
      <div className={styles.product_card_img}>
        <input
          type="checkbox"
          id={`productCompareCheck_${key}`}
          onChange={toggleCompare}
          checked={isCompared}
          className={styles.product_compare_checkbox}
        />
        <label
          htmlFor={`productCompareCheck_${key}`}
          className={styles.product_compare_label}
        >
          {''}
        </label>
        <span className={styles.product_compare_text}>比較</span>
        <Image
          src={
            data
              ? `/product/${data?.product_img_path}`
              : '/images/product/placeholder.avif'
          }
          alt="Product"
          width={200}
          height={200}
        />
      </div>
      <div className={styles.product_card_content}>
        <div className={`${styles.product_text} `}>
          <div className={styles.product_ellipsis}>
            {data ? data.product_name : 'Loading...'}
          </div>
          <div className={styles.product_ellipsis}>
            {data ? data.model : ''}
          </div>
        </div>
        <div className={styles.product_icons}>
          <input
            type="checkbox"
            id={`heartCheckbox_${key}`}
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
          <Image
            onClick={addToCart}
            src="/images/product/cart.svg"
            alt="cart"
            width={20}
            height={20}
          />
        </div>
      </div>
      <div className={styles.price_button}>
        <span className={styles.price}>
          {data
            ? `NT ${new Intl.NumberFormat('zh-TW').format(data.list_price)}元`
            : '$0'}
        </span>
        <span
          onClick={() =>
            (window.location.href = `http://localhost:3000/product/${product_id}`)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.location.href = `http://localhost:3000/product/${product_id}`
            }
          }}
          role="button"
          tabIndex={0}
          className={styles.arrow}
          style={{ cursor: 'pointer' }}
        >
          →
        </span>
      </div>
    </div>
  )
}
