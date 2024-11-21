import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Coupon from '.'
import Coupon2 from './index2'
import { useAuth } from '@/hooks/use-auth'
import { AiFillExclamationCircle } from "react-icons/ai";
import { AiOutlineSearch } from "react-icons/ai";
import { AiTwotoneDelete } from "react-icons/ai";


const MySwal = withReactContent(Swal)

export default function CouponList() {
  const [couponDataList, setCouponDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const { auth } = useAuth()
  const userId = auth?.userData?.user_id
  const [claimedCoupons, setClaimedCoupons] = useState(new Set())
  const [userCoupons, setUserCoupons] = useState([])
  const [endDateFilter, setEndDateFilter] = useState('')

  console.log('當前auth狀態:', auth)
  console.log('用戶ID:', userId)

  const getCouponData = async () => {
    try {
      const res = await fetch('http://localhost:3005/api/coupon')
      const resData = await res.json()

      if (resData.data?.coupons) {
        setCouponDataList(resData.data.coupons)
        // 初始化 claimedCoupons 集合
        const claimedIds = resData.data.coupons
          .filter((coupon) => coupon.valid === 0)
          .map((coupon) => coupon.coupon_id)
        setClaimedCoupons(new Set(claimedIds))
      }
    } catch (err) {
      setError('獲取優惠券資料失敗')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimCoupon = async (couponId) => {
    if (!userId) {
      MySwal.fire({
        icon: 'warning',
        title: '請先登入',
        text: '需要登入才能領取優惠券',
      })
      window.location.href = 'http://localhost:3000/member/login'
      return
    }

    try {
      const addResponse = await fetch(
        `http://localhost:3005/api/coupon-user/add/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coupon_id: couponId,
            // valid: 0, // 設置為已領取
          }),
        }
      )

      const getUserCoupons = async (userId) => {
        try {
          const res = await fetch(
            `http://localhost:3005/api/coupon-user/${userId}`
          )
          const data = await res.json()

          if (data.status === 'success') {
            return data.data
          } else {
            throw new Error(data.message)
          }
        } catch (error) {
          console.error('獲取使用者優惠券失敗:', error)
          return []
        }
      }

      const addResult = await addResponse.json()

      if (addResult.status === 'success') {
        setClaimedCoupons((prev) => new Set([...prev, couponId]))

        MySwal.fire({
          icon: 'success',
          title: '領取成功！',
          text: '優惠券已加入您的帳戶',
        })
        getCouponData()
      } else {
        MySwal.fire({
          icon: 'error',
          title: '領取失敗',
          text: addResult.message || '請稍後再試',
        })
      }
    } catch (error) {
      console.error('領取失敗:', error)
      MySwal.fire({
        icon: 'error',
        title: '領取失敗',
        text: '系統錯誤，請稍後再試',
      })
    }
  }

  const getUserCoupons = async () => {
    if (!userId) return

    try {
      const res = await fetch(`http://localhost:3005/api/coupon-user/${userId}`)
      const data = await res.json()

      if (data.status === 'success') {
        setUserCoupons(data.data)
      }
    } catch (err) {
      console.error('獲取使用者優惠券失敗:', err)
    }
  }

  // 判斷使用者是否已擁有特定優惠券
  const isUserHasCoupon = (couponId) => {
    return userCoupons.some((userCoupon) => userCoupon.coupon_id === couponId)
  }

  useEffect(() => {
    setMounted(true)
    getCouponData()
    if (userId) {
      getUserCoupons()
    }
  }, [userId])

  const handleSubmit = (e) => {
    e.preventDefault()
    // 可以加入其他搜尋邏輯
  }

  const filteredCoupons = couponDataList.filter((coupon) => {
    const searchContent = searchTerm.toLowerCase()
    const matchesSearch =
      coupon.coupon_content.toLowerCase().includes(searchContent) ||
      coupon.coupon_code.toLowerCase().includes(searchContent) ||
      String(coupon.coupon_discount).includes(searchContent)

    // 日期篩選
    let matchesDate = true
    if (endDateFilter) {
      const couponEndDate = new Date(coupon.coupon_end_time).setHours(
        0,
        0,
        0,
        0
      )
      const filterDate = new Date(endDateFilter).setHours(0, 0, 0, 0)
      matchesDate = couponEndDate >= filterDate
    }

    return matchesSearch && matchesDate
  })

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">載入中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    )
  }

  const handleClaimAllCoupons = async () => {
    if (!userId) {
      MySwal.fire({
        icon: 'warning',
        title: '請先登入',
        text: '需要登入才能領取優惠券',
      })
      window.location.href = 'http://localhost:3000/member/login'
      return
    }

    // 取得尚未領取的優惠券
    const unclaimedCoupons = filteredCoupons.filter(
      (coupon) => !isUserHasCoupon(coupon.coupon_id)
    )

    if (unclaimedCoupons.length === 0) {
      MySwal.fire({
        icon: 'info',
        title: '沒有可領取的優惠券',
        text: '您已領取所有可用優惠券',
      })
      return
    }

    try {
      // 顯示確認對話框
      const result = await MySwal.fire({
        icon: 'question',
        title: '一鍵領取優惠券',
        text: `確定要領取 ${unclaimedCoupons.length} 張優惠券嗎？`,
        showCancelButton: true,
        confirmButtonText: '確定領取',
        cancelButtonText: '取消',
      })

      if (result.isConfirmed) {
        let successCount = 0
        let failCount = 0

        // 依序領取每張優惠券
        for (const coupon of unclaimedCoupons) {
          try {
            const addResponse = await fetch(
              `http://localhost:3005/api/coupon-user/add/${userId}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  coupon_id: coupon.coupon_id,
                }),
              }
            )

            const addResult = await addResponse.json()
            if (addResult.status === 'success') {
              successCount++
            } else {
              failCount++
            }
          } catch (error) {
            failCount++
          }
        }

        // 更新頁面資料
        await getCouponData()
        await getUserCoupons()

        // 顯示結果
        MySwal.fire({
          icon: successCount > 0 ? 'success' : 'error',
          title: '領取完成',
          text: `成功領取 ${successCount} 張優惠券${
            failCount > 0 ? `，${failCount} 張領取失敗` : ''
          }`,
        })
      }
    } catch (error) {
      console.error('一鍵領取失敗:', error)
      MySwal.fire({
        icon: 'error',
        title: '領取失敗',
        text: '系統錯誤，請稍後再試',
      })
    }
  }

  return (
    <div className="container">
      <Form onSubmit={handleSubmit} className="mb-4">
        <div className="row">
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>關鍵字搜尋</Form.Label>
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="請輸入優惠券關鍵字"
              />
            </Form.Group>
          </div>

          <div className="col-md-3">
            <Form.Group>
              <Form.Label>優惠券有效期限</Form.Label>
              <Form.Control
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </Form.Group>
          </div>

          <div className="col-md-6 d-flex align-items-end justify-content-between">
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
              {(searchTerm || endDateFilter) && (
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm('')
                    setEndDateFilter('')
                  }}
                >
                <AiTwotoneDelete />  {/* 清除 */}
                </Button>
              )}
            </div>
            <Button
              onClick={handleClaimAllCoupons}
              className="text-white"
              style={{
                backgroundColor: '#5B35AA',
              }}
            >
              <AiFillExclamationCircle /> 一鍵領取
            </Button>
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
          filteredCoupons.map((coupon) => {
            const hasThisCoupon = isUserHasCoupon(coupon.coupon_id)

            return (
              <div
                key={coupon.coupon_id}
                className="col-md-6 coupon-item"
                onClick={() =>
                  !hasThisCoupon && handleClaimCoupon(coupon.coupon_id)
                }
                style={{ cursor: hasThisCoupon ? 'default' : 'pointer' }}
              >
                {hasThisCoupon ? (
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
                  />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
