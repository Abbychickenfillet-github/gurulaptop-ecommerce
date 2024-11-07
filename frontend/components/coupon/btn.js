import React, { useState, useEffect } from 'react'

// 在前端 React 組件中使用
// components/coupon/index.js 或其他相關組件

const getCoupon = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/coupon/${userId}`)
    const data = await response.json()
    if (data.success) {
      // 處理成功的情況
      console.log(data.data)
    }
  } catch (error) {
    console.error('獲取優惠券失敗:', error)
  }
}

const addCoupon = async (userId, couponId) => {
  try {
    const response = await fetch('http://localhost:3000/api/coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        coupon_id: couponId,
      }),
    })
    const data = await response.json()
    if (data.success) {
      // 處理成功的情況
      console.log(data.message)
    }
  } catch (error) {
    console.error('新增優惠券失敗:', error)
  }
}

export default function CouponUse(props) {
  return (
    <>
      <div className="filter-section mb-4">
        <div className="d-flex align-items-center">
          <span className="me-3">現有優惠卷</span>
          {/* <button
            className="btn btn-outline-primary btn-sm me-2"
            style={{
              color: '#805AF5',
              borderColor: '#805AF5',
              '&:hover': {
                backgroundColor: '#805AF5',
                color: 'white',
              },
            }}
          >
            未使用
          </button>
          <button
            className="btn btn-outline-primary btn-sm me-2"
            style={{
              color: '#805AF5',
              borderColor: '#805AF5',
              '&:hover': {
                backgroundColor: '#805AF5',
                color: 'white',
              },
            }}
          >
            已使用
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            style={{
              color: '#805AF5',
              borderColor: '#805AF5',
              '&:hover': {
                backgroundColor: '#805AF5',
                color: 'white',
              },
            }}
          >
            已過期
          </button> */}
        </div>
      </div>
    </>
  )
}
