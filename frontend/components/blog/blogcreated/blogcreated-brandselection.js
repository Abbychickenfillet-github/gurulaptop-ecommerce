import React from 'react'

export default function BlogcreatedBrandselection() {
  return (
    <>
      <div className="container d-flex flex-row justify-content-between align-items-start col-12">
        <div className="BlogSmallTitleAlign d-flex justify-content-start align-items-start col-6">
          <div className="BlogEditSmallTitle text-nowrap">
            <p className>
              <i className="fa-solid fa-diamond TitleDiamond" />品牌
            </p>
          </div>
        </div>
        <div className="container d-flex flex-row gap-5 col-6">
          <div className="d-flex flex-column gap-5">
            <div
              className="BlogEditBrandSelected d-flex justify-content-center align-items-center"
              value="GIGABYTE"
            >
              <p>GIGABYTE</p>
            </div>
            <div
              className="BlogEditBrandSelected d-flex justify-content-center align-items-center"
              value="MSI"
            >
              <p>MSI</p>
            </div>
            <div
              className="BlogEditBrandSelected d-flex justify-content-center align-items-center"
              value="HP"
            >
              <p>HP</p>
            </div>
            <div
              className="BlogEditBrandSelected d-flex justify-content-center align-items-center"
              value="ASUS"
            >
              <p>ASUS</p>
            </div>
            <div
              className="BlogEditBrandSelected d-flex justify-content-center align-items-center"
              value="ROG"
            >
              <p>ROG</p>
            </div>
            <div
              className="BlogEditBrandSelected d-flex justify-content-center align-items-center"
              value="DELL"
            >
              <p>DELL</p>
            </div>
            <div
              className="BlogEditBrandSelected d-flex justify-content-center align-items-center"
              value="Acer"
            >
              <p>Acer</p>
            </div>
            <div
              className="BlogEditBrandSelected d-flex justify-content-center align-items-center"
              value="Raser"
            >
              <p>Raser</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
