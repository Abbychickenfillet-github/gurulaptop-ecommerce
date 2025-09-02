import React from 'react'
import Image from 'next/image'

export default function LeaseCard() {
  return (
    <>
      <div className="card p-3 border-primary mb-3">
        <div className="row border-bottom border-primary">
          <div className="col-8 text-primary">
            <Image src="/diamond.svg" alt="" width={20} height={20} />
            租賃資訊
          </div>
          <div className="col-2">數量</div>
          <div className="col-2 mb-2">價格</div>
        </div>
        <div className="row align-items-center border-bottom border-primary mb-2">
          <div className="col-3">
            <div className="cart-photo">
              <Image
                src="/images/lease/15-fd1149TU.png"
                alt=""
                width={100}
                height={100}
              />
            </div>
          </div>
          <div className="col-5">15-fd1149TU</div>
          <div className="col-2">
            <input type="number" defaultValue={1} className="w-50" />
          </div>
          <div className="col-2">$1000</div>
        </div>
        <div className="row align-items-center">
          <div className="col-8 text-primary">租賃時間~到期時間</div>
          <div className="col d-flex justify-content-between">
            <div className="start-time">2024-11-20</div>
            <div>~</div>
            <div className="end-time">2024-12-20</div>
          </div>
        </div>
      </div>
    </>
  )
}
