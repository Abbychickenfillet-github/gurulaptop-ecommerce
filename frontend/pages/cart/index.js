import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/router'
import BuyCard from '@/components/cart/buy-card'
import { useShip711StoreOpener } from '@/hooks/use-ship-711-store'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)
import CouponBtn from '@/components/coupon/coupon-btn'
import axiosInstance from '@/services/axios-instance'
import Head from 'next/head'
import NextBreadCrumb from '@/components/common/next-breadcrumb'

export default function CartIndex() {
  const router = useRouter()
  const { auth } = useAuth()
  const { userData } = auth
  const [cartdata, setCartdata] = useState([])
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState({
    order_id: '',
    amount: '',
  })
  const [lineOrder, setLineOrder] = useState({})
  const [receiver, setReceiver] = useState('')
  const [ship, setShip] = useState('')
  const [address, setAddress] = useState('')
  const [payment_method, setPayment_method] = useState(0)
  const [couponDetails, setCouponDetails] = useState({
    coupon_id: '',
    coupon_code: '',
    coupon_discount: 0,
    finalPrice: 0,
  })
  const [shipPrice, setShipPrice] = useState(0)
  // confirm回來用的，在記錄確認之後，line-pay回傳訊息與代碼，例如
  // {returnCode: '1172', returnMessage: 'Existing same orderId.'}
  const [result, setResult] = useState({
    returnCode: '',
    returnMessage: '',
  })
  // 載入狀態(控制是否顯示載入中的訊息，和伺服器回傳時間點未完成不同步的呈現問題)
  const [isLoading, setIsLoading] = useState(true)

  const handlePaymentMethod = (e) => {
    setPayment_method(+e.target.value)
  }

  const user_id = userData.user_id ? userData.user_id : ''
  const country = userData.country ? userData.country : ''
  const city = userData.city ? userData.city : ''
  const district = userData.district ? userData.district : ''
  const road_name = userData.road_name ? userData.road_name : ''
  const detail_address = userData.detailed_address
    ? userData.detailed_address
    : ''
  let nowAddress = `${country}${city}${district}${road_name}${detail_address}`
  if (nowAddress === 'undefined') {
    nowAddress = ''
  }

  useEffect(() => {
    setAddress(nowAddress)
  }, [nowAddress])

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

  const handleAddress = (targetAddress) => {
    setAddress(targetAddress)
    MySwal.fire({
      icon: 'success',
      title: '選擇門市成功',
      showConfirmButton: false,
      timer: 1500,
    })
  }

  // 處理7-11選擇
  const { store711, openWindow } = useShip711StoreOpener(
    'http://localhost:3005/api/shipment/711',
    { autoCloseMins: 3 } // x分鐘沒完成選擇會自動關閉，預設5分鐘。
  )

  //產生訂單
  const createOrder = async () => {
    if (cartdata == null) {
      MySwal.fire({
        icon: 'error',
        title: '購物車是空的',
        showConfirmButton: false,
        timer: 1500,
      })
      return
    }

    if (ship == '') {
      MySwal.fire({
        icon: 'error',
        title: '請選擇運送方式',
        showConfirmButton: false,
        timer: 1500,
      })
      return
    }

    if (ship == '7-11') {
      if (store711.storeid == '') {
        MySwal.fire({
          icon: 'error',
          title: '請選擇7-11門市',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }
    }

    if (receiver == '') {
      setReceiver(userData.name)
    }

    if (phone == '') {
      setPhone(userData.phone)
    }

    const check = await MySwal.fire({
      title: '確認訂單後將無法修改',
      html: `收件人: ${receiver}<br>電話: ${phone}<br>運送方式: ${ship}<br>收貨地址: ${address}<br>套用優惠券: ${
        couponDetails.coupon_code
      }<br>金額: NT ${(
        Number(couponDetails.finalPrice) + Number(shipPrice)
      ).toLocaleString()}元`,
      icon: 'warning',
      showCancelButton: true,

      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '前往結帳',
      cancelButtonText: '取消',
    })

    if (!check.isConfirmed) {
      return
    }

    const result = await fetch(`http://localhost:3005/api/cart/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        receiver: receiver,
        phone: phone,
        amount: Number(couponDetails.finalPrice) + Number(shipPrice),
        payment_method: payment_method,
        coupon_id: couponDetails.coupon_id,
        detail: cartdata,
        address: address,
      }),
    })

    if (couponDetails.coupon_id !== '') {
      const couponResult = await fetch(
        `http://localhost:3005/api/coupon-user/update/${user_id}/${couponDetails.coupon_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: '已使用' }),
        }
      )
    }

    const data = await result.json()
    const order_id = data.order_id
    // const id = data.id
    if (data.status === 'success') {
      setOrder({ order_id: order_id, amount: total })
      setCartdata([])
      setAddress('')
      localStorage.removeItem('store711')
      window.location.href = `http://localhost:3005/api/ecpay-test-only/?orderId=${order_id}&amount=${couponDetails.finalPrice}`
    }
  }

  // 生成line pay訂單
  const goLinePay = () => {
    MySwal.fire({
      icon: 'info',
      title: '確認要導向至LINE Pay進行付款?',
      showCancelButton: true,
      confirmButtonText: '確認',
      cancelButtonText: '取消',
    }).then((result) => {
      setCartdata([])
      setAddress('')
      localStorage.removeItem('store711')
      if (result.isConfirmed) {
        window.location.href = `http://localhost:3005/api/line-pay/reserve?orderId=${lineOrder.orderId}`
      }
    })
  }

  const createLinePayOrder = async () => {
    if (cartdata == null) {
      MySwal.fire({
        icon: 'error',
        title: '購物車是空的',
        showConfirmButton: false,
        timer: 1500,
      })
      return
    }

    if (ship == '') {
      MySwal.fire({
        icon: 'error',
        title: '請選擇運送方式',
        showConfirmButton: false,
        timer: 1500,
      })
      return
    }

    if (ship == '7-11') {
      if (store711.storeid == '') {
        MySwal.fire({
          icon: 'error',
          title: '請選擇7-11門市',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }
    }

    if (receiver == '') {
      setReceiver(userData.name)
    }

    if (phone == '') {
      setPhone(userData.phone)
    }

    const check = await MySwal.fire({
      title: '確認訂單後將無法修改',
      html: `收件人: ${receiver}<br>電話: ${phone}<br>運送方式: ${ship}<br>收貨地址: ${address}<br>套用優惠券: ${
        couponDetails.coupon_code
      }<br>金額: NT ${(
        Number(couponDetails.finalPrice) + Number(shipPrice)
      ).toLocaleString()}元`,
      icon: 'warning',
      showCancelButton: true,

      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '前往結帳',
      cancelButtonText: '取消',
    })

    if (!check.isConfirmed) {
      return
    }

    const result = await fetch(`http://localhost:3005/api/cart/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        receiver: receiver,
        phone: phone,
        amount: Number(couponDetails.finalPrice) + Number(shipPrice),
        payment_method: payment_method,
        coupon_id: couponDetails.coupon_id,
        detail: cartdata,
        address: address,
      }),
    })

    if (couponDetails.coupon_id !== '') {
      const couponResult = await fetch(
        `http://localhost:3005/api/coupon-user/update/${user_id}/${couponDetails.coupon_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: '已使用' }),
        }
      )
    }

    const data = await result.json()
    const order_id = data.order_id
    // const id = data.id
    if (data.status === 'success') {
      setOrder({ order_id: order_id, amount: total })
    }

    const res = await axiosInstance.post('/line-pay/create-order', {
      userId: auth.userData.user_id,
      orderId: order_id,
      amount: +(total + shipPrice),
      products: [
        {
          id: 1,
          name: '商品價格',
          quantity: 1,
          price: total,
        },
        {
          id: 2,
          name: '運費',
          quantity: 1,
          price: shipPrice,
        },
      ],
    })

    // console.log(res.data) //訂單物件格式(line-pay專用)

    if (res.data.status === 'success') {
      setLineOrder(res.data.data.order)
      MySwal.fire({
        icon: 'success',
        title: '已成功建立訂單',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  // 確認交易，處理伺服器通知line pay已確認付款，為必要流程
  const handleConfirm = async (transactionId) => {
    const res = await axiosInstance.get(
      `/line-pay/confirm?transactionId=${transactionId}`
    )

    // console.log(res.data)

    if (res.data.status === 'success') {
      MySwal.fire({
        icon: 'success',
        title: '付款成功',
        showConfirmButton: false,
        timer: 1500,
      })
    } else {
      MySwal.fire({
        icon: 'error',
        title: '付款失敗',
        showConfirmButton: false,
        timer: 1500,
      })
    }

    if (res.data.data) {
      setResult(res.data.data)
    }

    // 處理完畢，關閉載入狀態
    setIsLoading(false)
  }

  // confirm回來用的
  useEffect(() => {
    if (router.isReady) {
      // 這裡確保能得到router.query值
      // console.log(router.query)
      // http://localhost:3000/order?transactionId=2022112800733496610&orderId=da3b7389-1525-40e0-a139-52ff02a350a8
      // 這裡要得到交易id，處理伺服器通知line pay已確認付款，為必要流程
      // TODO: 除非為不需登入的交易，為提高安全性應檢查是否為會員登入狀態
      const { transactionId, orderId } = router.query

      // 如果沒有帶transactionId或orderId時，導向至首頁(或其它頁)
      if (!transactionId || !orderId) {
        // 關閉載入狀態
        setIsLoading(false)
        // 不繼續處理
        return
      }

      // 向server發送確認交易api
      handleConfirm(transactionId)
    }

    // eslint-disable-next-line
  }, [router.isReady])

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

  const total = cartdata
    ? cartdata.reduce((acc, v) => acc + Number(v.quantity) * v.list_price, 0)
    : 0

  useEffect(() => {
    setCouponDetails({
      coupon_id: '',
      coupon_code: '',
      coupon_discount: 0,
      finalPrice: total,
    })
  }, [total])

  useEffect(() => {
    setPhone(userData.phone)
  }, [userData.phone])

  useEffect(() => {
    setReceiver(userData.name)
  }, [userData.name])

  return (
    <>
      <Head>
        <title>購物車</title>
      </Head>

      <div className="container">
        <NextBreadCrumb isHomeIcon isChevron bgClass="bg-transparent" />
        <div className="tilte d-flex mb-3">
          <div className="logo border-end me-3">
            <img src="/logo-black.svg" />
          </div>
          <div className="h2 align-items-center">
            <h2>購物車</h2>
          </div>
        </div>

        <div className="row mb-3 border-bottom p-2">
          <div className="col-lg-9 col-md-12 cart h-100">
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
                  <img src="/diamond.svg" />
                  清單資訊
                </div>
              </div>
              <div className="row border-bottom border-primary mb-2 pb-2">
                <div className="row">
                  <div className="col">商品總計</div>
                  <div className="col-auto">NT {total.toLocaleString()}元</div>
                </div>
                <div className="row">
                  <div className="col">運費總計</div>
                  <div className="col-auto">
                    NT {ship == '' && '0'}
                    {ship == '7-11' && '60'}
                    {ship == '宅配' && '200'}元
                  </div>
                </div>
              </div>
              <div className="row border-bottom border-primary mb-2 pb-2">
                {payment_method == 0 ? (
                  <>
                    <div className="mb-2">
                      <CouponBtn
                        price={total}
                        setCouponValue={setCouponDetails}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="form-control border-primary"
                        value={couponDetails.coupon_code}
                        disabled
                      />
                    </div>
                  </>
                ) : (
                  <></>
                )}
                {payment_method == 1 ? (
                  <div>* Line Pay不適用優惠券</div>
                ) : (
                  <></>
                )}
              </div>
              <div>
                <div className="discount row w-100 mb-2">
                  <div className="col">折價</div>
                  <div className="col-auto">
                    NT {(+total - +couponDetails.finalPrice).toLocaleString()}元
                  </div>
                </div>
                <div className="total row w-100 mb-2">
                  <div className="col">總計</div>
                  <div className="col-auto">
                    NT{' '}
                    {(+couponDetails.finalPrice + +shipPrice).toLocaleString()}
                    元
                  </div>
                </div>
                <div className="d-flex justify-content-center">
                  {/* <button
                  className="btn btn-primary w-50 text-light"
                  onClick={() => {
                    createOrder()
                    router.push(`/cart/double-check?order_id=${order.order_id}`)
                  }}
                >
                  產生訂單
                </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {cartdata && cartdata.length > 0 ? (
          <div className="border border-primary rounded w-lg-50 w-md-100 p-3 mb-3">
            <h3>確認訂單細節</h3>
            <h5>收件人</h5>
            <div className="mb-2">
              <input
                type="text"
                className="border-primary form-control"
                value={receiver}
                onChange={(e) => {
                  setReceiver(e.target.value)
                }}
              />
            </div>
            <h5>收件人連絡電話</h5>
            <div className="mb-2">
              <input
                type="text"
                className="border-primary form-control"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                }}
              />
            </div>
            <h5>運送方式</h5>
            <div className="text-center mb-2">
              <select
                className="form-select border-primary"
                onChange={(e) => {
                  setShip(e.target.value)
                  if (e.target.value === '7-11') {
                    setShipPrice(60)
                  } else {
                    setShipPrice(200)
                  }
                }}
              >
                <option value="" selected disabled>
                  選擇運送方式
                </option>
                <option value="宅配">宅配</option>
                <option value="7-11">7-11</option>
              </select>
            </div>
            <div className="address">
              {ship === '7-11' && (
                <>
                  <div className="d-flex justify-content-center mb-2">
                    <button
                      className="btn btn-primary w-50  text-light"
                      onClick={() => {
                        openWindow()
                      }}
                    >
                      選擇門市
                    </button>
                  </div>
                  <div className="d-flex justify-content-center mb-2">
                    <input
                      type="text"
                      className="border-primary form-control"
                      value={store711.storename}
                      disabled
                    />
                  </div>
                  <div className="d-flex justify-content-center mb-2">
                    <input
                      type="text"
                      className="border-primary form-control"
                      value={store711.storeaddress}
                      disabled
                    />
                  </div>
                  <div className="text-center">
                    <button
                      className="btn btn-primary text-light mb-2"
                      onClick={(e) => {
                        e.preventDefault()
                        handleAddress(store711.storeaddress)
                      }}
                    >
                      確認收件門市
                    </button>
                  </div>
                </>
              )}
              {ship === '宅配' && (
                <>
                  <div className="d-flex justify-content-center mb-2">
                    <input
                      type="text"
                      className="border-primary form-control"
                      value={address}
                      onChange={(e) => {
                        e.preventDefault()
                        setAddress(e.target.value)
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="d-flex mb-2">
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  id="ecpay"
                  value={'0'}
                  checked={payment_method == 0}
                  onChange={handlePaymentMethod}
                />
                <label
                  className="form-check-label"
                  htmlFor="ecpay"
                  defaultChecked
                >
                  綠界代收
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="linepay"
                  value={'1'}
                  checked={payment_method == 1}
                  onChange={handlePaymentMethod}
                />
                <label className="form-check-label" htmlFor="linepay">
                  Line Pay
                </label>
              </div>
            </div>
            {payment_method == 0 ? (
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-primary text-light w-50"
                  onClick={() => {
                    createOrder()
                  }}
                >
                  前往結帳
                </button>
              </div>
            ) : (
              <></>
            )}
            {payment_method == 1 ? (
              <>
                <div className="d-flex justify-content-center mb-2">
                  <button
                    className="btn btn-primary text-light"
                    onClick={createLinePayOrder}
                  >
                    產生Line Pay訂單
                  </button>
                </div>
                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-primary text-light"
                    onClick={goLinePay}
                    // 限制有orderId產生後才能點按
                    disabled={order.orderId === ''}
                  >
                    前往Line Pay付款
                  </button>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  )
}
