import React, { useState, useEffect } from 'react'

export default function BlogcreatedTitleinput(props) {
  return (
    <>
      <div className="container d-flex align-items-start justify-content-start">
        <div className="BlogEditSmallTitle text-nowrap col-4">
          <p className>
            <i className="fa-solid fa-diamond TitleDiamond" />  標題
          </p>
        </div>
        <div className="col-8 col-lg-8 col-md-10">
          <input
            className="blog-form-control blog-form-control-lg"
            type="text"
            placeholder="標題"
          />
        </div>
      </div>
    </>
  )
}
