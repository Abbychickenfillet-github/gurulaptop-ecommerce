import { useState } from 'react'

export const useDiscount = (originalPrice) => {
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  // 計算折扣後金額
  const calculateFinalPrice = (price, coupon) => {
    if (!coupon) return price
    
    // discount_method: 1 = 固定金額折扣, 0 = 折扣比例
    if (coupon.discount_method === 1) {
      // 固定金額折扣
      return Math.max(0, price - Number(coupon.coupon_discount))
    } else {
      // 折扣比例 (例如: 90 = 打 9 折)
      return price * (Number(coupon.coupon_discount) / 10)
    }
  }

  // 計算折扣金額
  const calculateDiscountAmount = (price, coupon) => {
    if (!coupon) return 0
    return price - calculateFinalPrice(price, coupon)
  }

  return {
    appliedCoupon,
    setAppliedCoupon,
    calculateFinalPrice,
    calculateDiscountAmount
  }
}