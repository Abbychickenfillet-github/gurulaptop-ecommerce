import React, { useState, useEffect, useCallback } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import BuyItemCard from './buy-item-card'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export default function BuyList(order) {
  const [orderDetail, setOrderDetail] = useState([])
  const [alreadyPay, setAlreadyPay] = useState(false)
  const [coupon_code, setCouponCode] = useState('')
  const order_id = order.order.order_id
  const order_date = order.order.create_time
  const coupon_id = order.order.coupon_id
  const receiver = order.order.receiver
  const phone = order.order.phone
  const address = order.order.address
  const payment_method = order.order.payment_method

  const getOrderDetail = useCallback(async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/buy-list/detail/${order_id}`,
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    const data = await res.json()
    setOrderDetail(data.data)
  }, [order_id])

  const getCouponData = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/${coupon_id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      const data = await res.json()
      setCouponCode(data.data.coupon.coupon_code)
    } catch (err) {
      // console.log(err)
    }
  }, [coupon_id])

  const goLinePay = async () => {
    const result = await MySwal.fire({
      icon: 'info',
      title: '確認要使用LINE Pay進行付款?',
      showCancelButton: true,
      confirmButtonText: '確認',
      cancelButtonText: '取消',
    })

    if (result.isConfirmed) {
      localStorage.removeItem('store711')

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/line-pay/reserve?orderId=${order_id}`)
        const data = await response.json()

        if (data.status === 'success') {
          // 顯示 QR code 和付款選項
          showLinePayOptions(data.data)
        } else {
          MySwal.fire({
            icon: 'error',
            title: '付款失敗',
            text: data.message || '無法建立付款，請稍後再試'
          })
        }
      } catch (error) {
        MySwal.fire({
          icon: 'error',
          title: '付款失敗',
          text: '網路錯誤，請稍後再試'
        })
      }
    }
  }

  // 顯示 Line Pay 付款選項
  const showLinePayOptions = (paymentData) => {
    const { paymentUrl } = paymentData

    // 檢測是否為手機設備
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isMobile) {
      // 手機直接跳轉到 Line Pay App
      MySwal.fire({
        icon: 'info',
        title: '即將跳轉到 LINE Pay',
        text: '請確認您的手機已安裝 LINE Pay App',
        showCancelButton: true,
        confirmButtonText: '前往 LINE Pay',
        cancelButtonText: '取消'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = paymentUrl.mobile
        }
      })
    } else {
      // 桌面顯示 QR code
      MySwal.fire({
        icon: 'info',
        title: 'LINE Pay 付款',
        html: `
          <div style="text-align: center;">
            <p>請使用 LINE Pay App 掃描下方 QR Code</p>
            <div style="margin: 20px 0;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentUrl.web)}"
                   alt="LINE Pay QR Code"
                   style="border: 1px solid #ddd; border-radius: 8px;">
            </div>
            <p style="font-size: 14px; color: #666;">或點擊下方按鈕在新視窗開啟</p>
            <button onclick="window.open('${paymentUrl.web}', '_blank')"
                    style="background: #00C300; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
              開啟 LINE Pay 付款頁面
            </button>
          </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: '關閉'
      })
    }
  }

  const handlePay = async () => {
    const check = await MySwal.fire({
      title: '是否確認前往結帳?',
      text: ``,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '前往結帳',
      cancelButtonText: '取消',
    })

    if (check.isConfirmed) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ecpay-test-only/?orderId=${order_id}&amount=${order.order.order_amount}`
    }
  }

  // useEffect(() => {
  //   // console.log(order_id)
  // }, [order_id])

  useEffect(() => {
    if (order_id) {
      getOrderDetail()
    }
    // console.log(orderDetail)
  }, [order_id, getOrderDetail])

  useEffect(() => {
    if (order.order.already_pay == 1) {
      setAlreadyPay(true)
    }
  }, [order])

  useEffect(() => {
    if (coupon_id !== 0) {
      getCouponData()
    }
  }, [coupon_id, getCouponData])

  return (
    <>
      <Accordion defaultActiveKey="0" className="mb-3">
        <Accordion.Item eventKey="0" className="border-primary">
          <Accordion.Header>
            <div className="col-md-10 col-8">訂單編號: {order_id}</div>
            <div className="col-md-1 col-2">
              {alreadyPay ? (
                <div className="btn btn-success text-light">已付款</div>
              ) : (
                <div className="btn btn-danger text-red">未付款</div>
              )}
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="row mb-3">
              <div className="col-md-6 col-12">訂單日期： {order_date}</div>
              <div className="col-md col-12">
                訂單金額： NT {order.order.order_amount.toLocaleString()}元
              </div>
              <div className="">
                本筆訂單使用優惠券： {coupon_code == 0 ? '無' : coupon_code}
              </div>
              <div className="col-md-6 col-12">收件人： {receiver}</div>
              <div className="col-md-6 col-12">聯絡電話： {phone}</div>
              <div className="col-md-6 col-12">收件地址： {address}</div>
              {payment_method == 1 ? (
                <div className="col-md-6 col-12">付款方式： Line Pay</div>
              ) : (
                <></>
              )}
              {payment_method == 0 ? (
                <div className="col-md-6 col-12">付款方式： 綠界支付</div>
              ) : (
                <></>
              )}
            </div>
            {orderDetail && orderDetail.length > 0 ? (
              orderDetail.map((item, index) => {
                return <BuyItemCard key={index} item={item} />
              })
            ) : (
              <div className="text-center text-muted">沒有訂單詳情</div>
            )}
            {alreadyPay ? (
              <></>
            ) : payment_method == 1 ? (
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary text-light"
                  onClick={goLinePay}
                >
                  前往Line Pay付款
                </button>
              </div>
            ) : (
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary text-light"
                  onClick={handlePay}
                >
                  前往綠界支付
                </button>
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <style jsx global>{`
        .text-red {
          color: red;
        }
      `}</style>
    </>
  )
}
