import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Form, Button } from 'react-bootstrap'
import Coupon from './index'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useAuth } from '@/hooks/use-auth'
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai'
import { AiOutlineSearch } from "react-icons/ai";
import { AiTwotoneDelete } from "react-icons/ai";


const MySwal = withReactContent(Swal)

export default function CouponUser() {
  const router = useRouter()
  const { auth } = useAuth() // 獲取 auth 對象
  const userId = auth?.userData?.user_id // 取得用戶ID

  const [couponDataList, setCouponDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  function sortCoupons(coupons, order) {
    return [...coupons].sort((a, b) => {
      const dateA = new Date(a.coupon_end_time)
      const dateB = new Date(b.coupon_end_time)
      return order === 'asc' ? dateA - dateB : dateB - dateA
    })
  }

  // 除錯用
  console.log('當前auth狀態:', auth)
  console.log('用戶ID:', userId)

  // 獲取使用者優惠券資料
  const getUserCoupons = async () => {
    if (!userId) {
      setError('請先登入')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`http://localhost:3005/api/coupon-user/${userId}`)

      if (!res.ok) {
        throw new Error('請求失敗')
      }

      const resData = await res.json()

      if (resData.status === 'success') {
        setCouponDataList(resData.data)

        // if (resData.data.length === 0) {
        //   MySwal.fire({
        //     title: '提示',
        //     text: '目前沒有可用的優惠券',
        //     icon: 'info',
        //   })
        // }
      } else {
        throw new Error(resData.message || '獲取資料失敗')
      }
    } catch (err) {
      console.error('錯誤:', err)
      setError(err.message)
      MySwal.fire({
        title: '錯誤',
        text: err.message,
        icon: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // 處理搜尋表單提交
  const handleSubmit = (e) => {
    e.preventDefault()
    // 可以在這裡加入其他搜尋邏輯
  }

  // 處理輸入變化
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // 跳轉到購物車
  const handleCartCoupon = (couponId) => {
    if (!userId) {
      MySwal.fire({
        title: '請先登入',
        text: '需要登入才能使用優惠券',
        icon: 'warning',
      })
      router.push('/member/login')
      return
    }
    router.push(`/cart?id=${couponId}`)
  }

  useEffect(() => {
    if (userId) {
      getUserCoupons()
    } else {
      setLoading(false)
    }
  }, [userId]) // 加入 userId 作為依賴項

  // 未登入時的顯示
  if (!userId) {
    return (
      <div className="container text-center py-5">
        <h3>請先登入以查看您的優惠券</h3>
        <Button
          variant="primary"
          onClick={() => router.push('/member/login')}
          style={{ backgroundColor: '#805AF5', borderColor: '#805AF5' }}
        >
          前往登入
        </Button>
      </div>
    )
  }

  // 搜尋過濾邏輯
  const filteredCoupons = sortCoupons(
    couponDataList.filter((coupon) => {
      const searchContent = searchTerm.toLowerCase()
      return (
        coupon.coupon_content.toLowerCase().includes(searchContent) ||
        coupon.coupon_code.toLowerCase().includes(searchContent) ||
        String(coupon.coupon_discount).includes(searchContent)
      )
    }),
    sortOrder
  )

  // 載入中顯示
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    )
  }

  // 錯誤顯示
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="container ">
      <Form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>現有優惠卷搜尋</Form.Label>
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="請輸入優惠券關鍵字"
              />
            </Form.Group>
          </div>

          <div className="col-md-9 d-flex align-items-end justify-content-between">
            <div>
              <Button
                variant="primary"
                type="submit"
                style={{
                  backgroundColor: '#805AF5',
                  borderColor: '#805AF5',
                  color: 'white',
                }}
                className="me-2"
              >
                <AiOutlineSearch />{/* 搜尋 */}
              </Button>
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  <AiTwotoneDelete />{/* 清除 */}
                </Button>
              )}
            </div>

            <div>
              <Button
                onClick={() => setSortOrder('asc')}
                className="me-2"
                style={{
                  backgroundColor: '#5B35AA',
                  color: 'white',
                }}
              >
                <AiOutlineArrowUp />
              </Button>
              <Button
                onClick={() => setSortOrder('desc')}
                style={{
                  backgroundColor: '#5B35AA',
                  color: 'white',
                }}
              >
                <AiOutlineArrowDown />
              </Button>
            </div>
          </div>
        </div>
      </Form>

      {/* 優惠券列表 */}
      <div className="row g-4">
        {filteredCoupons.length === 0 ? (
          <div className="col-12 text-center py-4">
            <p className="text-muted">
              {searchTerm ? '找不到符合的優惠券' : '目前沒有可用的優惠券'}
            </p>
          </div>
        ) : (
          filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="col-md-6 coupon-item"
              onClick={() => handleCartCoupon(coupon.coupon_id)}
            >
              <Coupon
                coupon_id={coupon.coupon_id}
                coupon_code={coupon.coupon_code}
                coupon_content={coupon.coupon_content}
                coupon_discount={coupon.coupon_discount}
                discount_method={coupon.discount_method}
                coupon_start_time={coupon.coupon_start_time}
                coupon_end_time={coupon.coupon_end_time}
                isValid={coupon.user_coupon_valid === 1}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
