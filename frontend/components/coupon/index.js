// Coupon 元件
export default function Coupon({
  coupon_id, // 加入這個
  coupon_code,
  coupon_content,
  coupon_discount,
  discount_method,
  coupon_start_time,
  coupon_end_time,
}) {
  // 判斷折扣方式並格式化顯示文字
  const getDiscountText = () => {
    switch (discount_method) {
      case 0: // 折扣比例
        return `打 ${coupon_discount} 折`
      case 1: // 固定金額折扣
        return `折扣 ${coupon_discount} 元`
      case 2: // 運費折扣
        return `運費折抵 ${coupon_discount} 元`
      default:
        return ''
    }
  }

  return (
    <div className="coupon-wrapper">
      <img className="coupon-bg" src="/coupon_2.svg" alt="coupon background" />
      <div className="coupon-content">
        <h2 className="store-name">GURU Laptop</h2>
        <p className="offer-text">{coupon_content}</p>
        <div className="coupon-code">優惠券代碼：{coupon_code}</div>
        <div className="coupon_discount">
          {getDiscountText()} {/* 使用判斷後的折扣文字 */}
        </div>
        <div className="expiry-date">期限：{coupon_end_time}前</div>
      </div>
    </div>
  )
}
