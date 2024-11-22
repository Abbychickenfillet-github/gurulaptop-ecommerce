import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function BuyItemCard(item) {
  const product_img = item.item.product_img_path
  const product_name = item.item.product_name
  const product_id = item.item.product_id
  const price = item.item.list_price
  const quantity = item.item.quantity
  const subtotal = quantity * price

  return (
    <>
      <div className="card p-2 border-primary mb-3">
        <div className="row align-items-center mb-2">
          <div className="col-md-6 col-3 text-primary">
            <img src="diamond.svg" alt />
            商品資訊
          </div>
          <div className="col-md-2 col-3">單價</div>
          <div className="col-md-2 col-3">數量</div>
          <div className="col-md-2 col-3">小計</div>
        </div>
        <div className="row align-items-center mb-2">
          <div className="col-2 d-none d-md-block">
            <Link className="cart-photo" href={`/product/${product_id}`}>
              <Image src={`/product/${product_img}`} width={500} height={500} />
            </Link>
          </div>
          <Link
            className="col-md-4 col-3 text-decoration-none text-black"
            href={`/product/${product_id}`}
          >
            {product_name}
          </Link>
          <div className="col-md-2 col-3"> NT {price.toLocaleString()} 元</div>
          <div className="col-md-2 col-3">{quantity}</div>
          <div className="col-md-2 col-3">NT {subtotal.toLocaleString()}元</div>
        </div>
      </div>
    </>
  )
}
