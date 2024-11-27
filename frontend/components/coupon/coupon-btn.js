import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/router'
import { Form, Button } from 'react-bootstrap'
import Coupon from '@/components/coupon'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useAuth } from '@/hooks/use-auth'
import { useDiscount } from '@/hooks/use-coupon-discount'
import Coupon2 from './index2'

const MySwal = withReactContent(Swal)

export default function CouponBtn({ price, setCouponValue }) {
  const router = useRouter()
  const { auth } = useAuth()
  const userId = auth?.userData?.user_id

  // 除錯用
  console.log('當前auth狀態:', auth)
  console.log('用戶ID:', userId)

  const {
    appliedCoupon,
    setAppliedCoupon,
    calculateFinalPrice,
    calculateDiscountAmount,
  } = useDiscount(price)

  const [couponDataList, setCouponDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [usedCouponId, setUsedCouponId] = useState(null)

  // 獲取優惠券列表
  const getCouponData = async () => {
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
      console.log('優惠券資料:', resData)

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
      console.error('Error:', err)
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

  // 更新優惠券狀態
  const updateCouponStatus = async (couponId) => {
    if (!userId) {
      MySwal.fire({
        title: '請先登入',
        text: '需要登入才能使用優惠券',
        icon: 'warning',
      })
      router.push('/member/login')
      return false
    }

    try {
      const res = await fetch(
        `http://localhost:3005/api/coupon-user/update/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coupon_id: couponId,
            valid: 0,
          }),
        }
      )

      const data = await res.json()

      if (data.status === 'success') {
        await getCouponData()
        return true
      } else {
        throw new Error(data.message || '更新失敗')
      }
    } catch (error) {
      console.error('更新優惠券狀態失敗:', error)
      MySwal.fire({
        title: '錯誤',
        text: error.message || '更新優惠券狀態失敗',
        icon: 'error',
      })
      return false
    }
  }

  // 處理優惠券選擇
  const handleCouponSelect = async (coupon) => {
    try {
      const discountAmount = calculateDiscountAmount(price, coupon)
      const finalPrice = calculateFinalPrice(price, coupon)

      // 先確認用戶是否要使用此優惠券
      const result = await MySwal.fire({
        title: '確認使用優惠券',
        text: '使用後將無法再次使用此優惠券，確定要使用嗎？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '確定使用',
        cancelButtonText: '取消',
      })

      if (result.isConfirmed) {
        // const updateSuccess = await updateCouponStatus(coupon.coupon_id)
        // if (updateSuccess) {
        setUsedCouponId(coupon.coupon_id)
        setAppliedCoupon(coupon)
        setCouponValue({
          ...coupon,
          coupon_code: coupon.coupon_code,
          discountAmount,
          finalPrice,
        })
        setSearchTerm('')
        MySwal.fire({
          title: '成功',
          text: '優惠券已套用',
          icon: 'success',
        })
        // }
      }
    } catch (error) {
      console.error('處理優惠券選擇失敗:', error)
    }
  }

  useEffect(() => {
    if (userId) {
      getCouponData()
    } else {
      setLoading(false)
    }
  }, [userId])

  // 搜尋功能
  const filteredCoupons = couponDataList.filter((coupon) => {
    const searchContent = searchTerm.toLowerCase()
    return (
      coupon.coupon_content.toLowerCase().includes(searchContent) ||
      coupon.coupon_code.toLowerCase().includes(searchContent) ||
      String(coupon.coupon_discount).includes(searchContent)
    )
  })

  // 檢查是否未登入
  const handleClick = () => {
    if (!userId) {
      MySwal.fire({
        title: '請先登入',
        text: '需要登入才能使用優惠券',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '前往登入',
        cancelButtonText: '取消',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/member/login')
        }
      })
      return
    }
  }

  const couponModal = (
    <div className="d-flex justify-content-center">
      <button
        type="button"
        className="btn btn-primary text-light "
        data-bs-toggle="modal"
        data-bs-target="#staticBackdrop"
        onClick={handleClick}
        style={{ backgroundColor: '#805AF5', borderColor: '#805AF5' }}
      >
        選擇優惠券
      </button>

      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex={-1}
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                選擇優惠券
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>

            {/* 搜尋欄位 */}
            <div className="modal-header border-0 pb-0">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="搜尋優惠券..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="modal-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">載入中...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : (
                <div className="row g-3 d-flex justify-content-center">
                  {filteredCoupons.length === 0 ? (
                    <div className="col-12 text-center py-4">
                      <p className="text-muted">
                        {searchTerm
                          ? '找不到符合的優惠券'
                          : '目前沒有可用的優惠券'}
                      </p>
                    </div>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <div
                        className="col-12 col-md-8 coupon-item"
                        key={coupon.id}
                        onClick={() =>
                          usedCouponId !== coupon.coupon_id &&
                          handleCouponSelect(coupon)
                        }
                        style={{
                          cursor:
                            usedCouponId === coupon.coupon_id
                              ? 'default'
                              : 'pointer',
                        }}
                      >
                        <div className="d-flex justify-content-center">
                          {usedCouponId === coupon.coupon_id ? (
                            <Coupon2
                              coupon_id={coupon.coupon_id}
                              coupon_code={coupon.coupon_code}
                              coupon_content={coupon.coupon_content}
                              coupon_discount={coupon.coupon_discount}
                              discount_method={coupon.discount_method}
                              coupon_start_time={coupon.coupon_start_time}
                              coupon_end_time={coupon.coupon_end_time}
                            />
                          ) : (
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
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return <>{couponModal}</>
}
