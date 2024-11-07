import React, { useState, useEffect } from 'react'
import styles from '@/styles/product-card.module.scss'
import Image from 'next/image'

export default function ProductCard({ onSendMessage, product_id }) {
  // 產品卡片的 key 值，用於比較功能的 checkbox
  const key = Math.random()
  // 從後端撈取資料
  const [data, setData] = useState(null)

  useEffect(() => {
    async function init() {
      //偵測使用者是否登入
      const token = localStorage.getItem('jwt')
    }
    async function fetchProduct(product_id) {
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
    fetchProduct(product_id)
  }, [product_id]) // 加入依賴陣列，確保在 product_id 改變時重新執行

  //比較按鈕的狀態
  const [isCompared, setIsCompared] = useState(false)
  const toggleCompare = () => {
    // 點擊按鈕時傳送訊息到父元件
    if (isCompared) {
      onSendMessage('取消比較！')
      setIsCompared(false)
    } else {
      onSendMessage('加入比較！')
      setIsCompared(true)
    }
  }

  // 收藏按鈕的狀態
  const [isChecked, setIsChecked] = useState(false) // 用來控制 checkbox 狀態

  const toggleHeart = () => {
    // 點擊按鈕時傳送訊息到父元件
    if (isChecked) {
      onSendMessage('取消收藏！')
      setIsChecked(false)
    } else {
      onSendMessage('收藏成功！')
      setIsChecked(true)
    }
  }

  // 加入購物車
  const addToCart = () => {
    // 點擊按鈕時傳送訊息到父元件
    onSendMessage('加入購物車成功！')
  }

  return (
    <div className={styles.product_card}>
      <div className={styles.product_card_img}>
        <input
          type="checkbox"
          id={`productCompareCheck_${key}`}
          onClick={toggleCompare}
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
          src={data ? `/product/${data.product_img_path}` : ''}
          alt="Product"
          width={200}
          height={200}
        />
      </div>
      <div className={styles.product_card_content}>
        <div className={styles.product_text}>
          <div>{data ? data.product_name : 'Loading...'}</div>
          <div>{data ? data.model : ''}</div>
        </div>
        <div className={styles.product_icons}>
          <input
            type="checkbox"
            id="heartCheckbox"
            checked={isChecked}
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
          {data ? `$${data.list_price}` : '$0'}
        </span>
        <span className={styles.arrow}>→</span>
      </div>
      {/* 顯示 alert */}
    </div>
  )
}
