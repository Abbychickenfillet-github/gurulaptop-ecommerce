// import React, { useState, useEffect } from 'react'

// export default function Coupon(props) {
//   return (
//     <>
//       <div className="coupon position-relative">
//         <img className='coupon' src="/coupon_2.svg" alt />
//         <div className={`coupon-title position-absolute`}>laptop Guru</div>
//         <div className={`coupon-content position-absolute ms-2`}>
//           <div className>夏季特賣，滿3萬全館享85折優惠</div>
//           <button className="btn btn-primary">@NS2409_cn03</button>
//         </div>
//         <div className={`coupon-end-time position-absolute`}>
//           <div>使用期限：</div>
//           <div>2025/09/30</div>
//         </div>
//       </div>
//     </>
//   )
// }

import React, { useState, useEffect } from 'react'

export default function Coupon({ couponId = 1 }) {
  const [couponData, setCouponData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const response = await fetch(
          `http://localhost:3005/api/coupon/${couponId}`
        )

        const result = await response.json()
        console.log('API 回傳資料:', result)

        if (result.status === 'error') {
          throw new Error(result.message)
        }

        if (result.status === 'success' && result.data) {
          setCouponData(result.data) 
        } else {
          throw new Error('無優惠券資料')
        }
      } catch (err) {
        console.error('錯誤:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCoupon()
  }, [couponId])

  if (loading) {
    return (
      <div className="coupon-wrapper loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="coupon-wrapper error">
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  if (!couponData) {
    return (
      <div className="coupon-wrapper empty">
        <div className="alert alert-warning">無優惠券資料</div>
      </div>
    )
  }
  
  return (
    <div className="coupon-wrapper">
      <img className="coupon-bg" src="/coupon_2.svg" alt="coupon background" />
      <div className="coupon-content">
        <h2 className="store-name">GURU Laptop</h2>
        <p className="offer-text">{couponData.coupon_content}</p>
        <div className="coupon-code">優惠券代碼 {couponData.coupon_code}</div>
        <div className="expiry-date">
          期限：{(couponData.coupon_end_time)}前
        </div>
      </div>
    </div>
  )
}
