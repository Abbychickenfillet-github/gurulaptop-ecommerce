import React from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import BuyCard from '@/components/cart/buy-card'
import Cookies from 'js-cookie'
import { useShip711StoreOpener } from '@/hooks/use-ship-711-store'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal)
import CouponBtn from '@/components/coupon/coupon-btn'

const accessToken = Cookies.get('accessToken')
console.log(accessToken) // 顯示 accessToken 的值

export default function CartIndex() {
  const { auth } = useAuth()
  const { userData } = auth
  const [cartdata, setCartdata] = useState([])
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState({
    order_id: '',
    amount: '',
  })
  const [receiver, setReceiver] = useState('')
  const [ship, setShip] = useState('')
  const [address, setAddress] = useState('')

  const [couponDetails, setCouponDetails] = useState({
    coupon_id: '',
    coupon_code: '',
    coupon_discount: 0,
    finalPrice: 0,
  })

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
      }<br>金額: NT ${couponDetails.finalPrice.toLocaleString()}元`,
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
        amount: couponDetails.finalPrice,
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

  // // 送到綠界
  // const goECPay = (order_id, amount) => {
  //   if (window.confirm('確認要導向至ECPay進行付款?')) {
  //     // 先連到node伺服器後，導向至ECPay付款頁面
  //     window.location.href = `http://localhost:3005/api/ecpay/payment?orderId=${order_id}&amount=${amount}`
  //   }
  // }

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
      <div className="tilte d-flex mb-3">
        <div className="logo border-end me-3">
          <img src="/logo-black.svg" />
        </div>
        <div className="h2 align-items-center">
          <h2>購物車</h2>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-9 cart h-100">
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
          {cartdata && cartdata.length > 0 ? (
            <div className="border border-primary rounded w-50 p-3">
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
                        className="btn btn-primary text-light"
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

              <button
                className="btn btn-primary text-light"
                onClick={() => {
                  createOrder()
                  // router.push(`/cart/double-check?order_id=${order.order_id}`)
                }}
              >
                前往結帳
              </button>
            </div>
          ) : (
            <></>
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
            <CouponBtn price={total} setCouponValue={setCouponDetails} />

            <div className="row border-bottom border-primary mb-2 pb-2">
              <div className="text-center mb-2"></div>
              <div>
                <input
                  type="text"
                  className="form-control border-primary"
                  value={couponDetails.coupon_code}
                  disabled
                />
              </div>
            </div>
            <div>
              <div className="discount row w-100 mb-2">
                <div className="col">折價</div>
                <div className="col-auto">
                  NT {(+couponDetails.coupon_discount).toLocaleString()}元
                </div>
              </div>
              <div className="total row w-100 mb-2">
                <div className="col">總計</div>
                <div className="col-auto">
                  NT {couponDetails.finalPrice.toLocaleString()}元
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
    </>
  )
}