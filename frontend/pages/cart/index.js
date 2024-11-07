import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import BuyCard from '@/components/cart/buy-card'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const accessToken = Cookies.get('accessToken')
console.log(accessToken) // 顯示 accessToken 的值

export default function CartIndex() {
  const { auth } = useAuth()
  const { userData } = auth
  const [cartdata, setCartdata] = useState([])
  // const [total, setTotal] = useState(0)
  const [order, setOrder] = useState({})

  const user_id = userData?.user_id
  const country = userData?.country
  const city = userData?.city
  const district = userData?.district
  const road_name = userData?.road_name
  const detail_address = userData?.detail_address
  const address = `${country}${city}${district}${road_name}${detail_address}`

  // 處理遞增
  const handle = (itemId, newQuantity) => {
    const nextProducts = cartdata.map((v, i) => {
      // 這裡判斷id值是否等於productId，如果是就count屬性遞增

      if (v.id === itemId) {
        return { ...v, quantity: newQuantity }
      } else {
        return v
      }
    })

    setCartdata(nextProducts)
  }

  // 產生訂單
  const createOrder = async () => {
    const result = await fetch(`http://localhost:3005/api/cart/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        amount: total,
        coupon_id: '',
        detail: cartdata,
        address: address,
      }),
    })
  }

  useEffect(() => {
    async function fetchData() {
      const result = await fetch(`http://localhost:3005/api/cart/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user_id }),
      })

      const data = await result.json()
      const arrData = data.data
      setCartdata(arrData)
    }

    if (user_id) {
      fetchData()
    }
  }, [user_id])

  // useEffect(() => {
  //   if (cartdata.length > 0) {
  //     let total = 0
  //     cartdata.forEach((item) => {
  //       total += item.list_price * item.quantity
  //       setTotal(total)
  //     })
  //   }
  // }, [cartdata])
  const total = cartdata.reduce(
    (acc, v) => acc + Number(v.quantity) * v.list_price,
    0
  )

  return (
    <>
      <div className="tilte d-flex mb-3">
        <div className="logo border-end me-3">
          <img src="/logo-black.svg" alt />
        </div>
        <div className="h2 align-items-center">
          <h2>購物車</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-8 cart h-100">
          {cartdata && cartdata.length > 0 ? (
            cartdata.map((item) => (
              <BuyCard
                key={item.product_id}
                item={item}
                onDataChange={(newQuantity) => {
                  // console.log(item.quantity)
                  handle(item.product_id, newQuantity)
                  if (newQuantity === 0) {
                    setCartdata(
                      cartdata.filter((v) => v.product_id !== item.product_id)
                    )
                  }
                }}
              />
            ))
          ) : (
            <p>購物車是空的</p>
          )}
        </div>
        <div className="col bill h-50">
          <div className="card p-3 border-primary">
            <div className="row border-bottom border-primary mb-2 pb-2">
              <div className="col-6 text-primary">
                <img src="/diamond.svg" alt />
                清單資訊
              </div>
            </div>
            <div className="row border-bottom border-primary mb-2 pb-2">
              <div className="row">
                <div className="col">商品總計</div>
                <div className="col-auto">{total}</div>
              </div>
              <div className="row">
                <div className="col">運費總計</div>
                <div className="col-auto">$200</div>
              </div>
            </div>
            <div className="row border-bottom border-primary mb-2 pb-2">
              <div className=" d-flex justify-content-center">
                <button
                  className="btn btn-primary w-50  text-light"
                  type="button"
                >
                  使用優惠券
                </button>
              </div>
            </div>
            <div>
              <div className="discount row w-100 mb-2">
                <div className="col">折價</div>
                <div className="col-auto">$200</div>
              </div>
              <div className="total row w-100 mb-2">
                <div className="col">總計</div>
                <div className="col-auto">{total}</div>
              </div>
              <div className="d-flex justify-content-center">
                <button className="btn btn-primary w-50 text-light">
                  結帳
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
