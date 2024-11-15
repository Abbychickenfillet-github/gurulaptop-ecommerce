import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
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

  const getOrderDetail = async () => {
    const res = await fetch(
      `http://localhost:3005/api/buy-list/detail/${order_id}`
    )
    const data = await res.json()
    setOrderDetail(data.data)
  }

  const getCouponData = async () => {
    try {
      const res = await fetch(`http://localhost:3005/api/coupon/${coupon_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      setCouponCode(data.data.coupon.coupon_code)
    } catch (err) {
      console.log(err)
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
      window.location.href = `http://localhost:3005/api/ecpay-test-only/?orderId=${order_id}&amount=${order.order.order_amount}`
    }
  }

  useEffect(() => {
    console.log(order_id)
  }, [order_id])

  useEffect(() => {
    if (order_id) {
      getOrderDetail()
    }
    // console.log(orderDetail)
  }, [order_id])

  useEffect(() => {
    if (order.order.already_pay == 1) {
      setAlreadyPay(true)
    }
  }, [order])

  useEffect(() => {
    if (coupon_id !== 0) {
      getCouponData()
    }
  }, [coupon_id])

  return (
    <>
      <Accordion defaultActiveKey="0" className="mb-3">
        <Accordion.Item eventKey="0" className="border-primary">
          <Accordion.Header>
            <div className="col-10">訂單編號: {order_id}</div>
            <div className="col-1">
              {alreadyPay ? (
                <div className="btn btn-success text-light">已付款</div>
              ) : (
                <div className="btn btn-danger text-red">未付款</div>
              )}
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="row mb-3">
              <div className="col-6">訂單日期： {order_date}</div>
              <div className="col">
                訂單金額： NT {order.order.order_amount.toLocaleString()}元
              </div>
              <div className="">
                本筆訂單使用優惠券： {coupon_code == 0 ? '無' : coupon_code}
              </div>
              <div className="col-6">收件人： {receiver}</div>
              <div className="col-6">聯絡電話： {phone}</div>
              <div className="">收件地址： {address}</div>
            </div>
            {orderDetail.map((item, index) => {
              return <BuyItemCard key={index} item={item} />
            })}
            {alreadyPay ? (
              <></>
            ) : (
              <>
                <button
                  className="btn btn-primary text-light"
                  onClick={handlePay}
                >
                  前往付款
                </button>
              </>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <style jsx>{`
        .text-red {
          color: red;
        }
      `}</style>
    </>
  )
}
