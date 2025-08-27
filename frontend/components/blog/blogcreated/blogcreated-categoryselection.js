import React from 'react'

export default function BlogcreatedCategoryselection() {
  return (
    <>
      <div className="container d-flex flex-row justify-content-between align-items-start col-12">
        <div className="BlogEditSmallTitle text-nowrap col-10">
          <p className>
            <i className="fa-solid fa-diamond TitleDiamond" />  類別
          </p>
        </div>
        <div className="container d-flex flex-column gap-5 col-2">
          <div
            className="BlogEditTypeSelected d-flex justify-content-center align-items-center"
            value="購買心得"
          >
            <p>購買心得</p>
          </div>
          <div
            className="BlogEditTypeSelected d-flex justify-content-center align-items-center"
            value="開箱文"
          >
            <p>開箱文！</p>
          </div>
          <div
            className="BlogEditTypeSelected d-flex justify-content-center align-items-center"
            value="疑難雜症"
          >
            <p>疑難雜症</p>
          </div>
          <div
            className="BlogEditTypeSelected d-flex justify-content-center align-items-center"
            value="活動心得"
          >
            <p>活動心得</p>
          </div>
        </div>
      </div>
    </>
  )
}
