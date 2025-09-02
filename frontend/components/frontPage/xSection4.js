// src/components/frontPage/Section4.js
import React, { useState } from 'react'
import Image from 'next/image'
// 將 laptopData 移到組件外部
const laptopData = [
  {
    id: 1,
cx/banner_05.c
c
c
c
cx/banner_06.c
c
c
c
cx/banner_07.c
c
c
c
cSection4() {
ctation] = c
c
c=> {
c> prev - c20 度
c
c
c=> {
c> prev + c20 度
c
c
c
chome-section4">
cme-pic-body2">
c="home-title">◇c
chome-card1">
c="home-card2">
ccome-slider-contac
cc"home-slider-conc
cce="carousel-contc
c
csName="carousel-cte"
ce={{ transform: cate(${rotation}c` }}
c
c確保 laptopData c且是陣列 */}
cay.isArrayctopData) &&
cptopData.mapcimage, index) c (
c<div
c  key={image.id}
c  className="carousel-item"
c  style={{
c    transform: `
c    rotate(${index * 120}deg) 
c    translateX(250px) 
c    rotate(-${index * 120}deg)
c  `,
c  }}
c>
c  <Image
c    src={image.image}
c    alt={`Laptop ${index + 1}`}
c    width={300}
c    height={200}
c  />
c</div>
c}
c
c
cce="home-nav-arroc
cn came="home-arrow-conClick=cePrev}>
c csName="home-triac-left" />
con>
cn came="home-arrow-c onClick=ceNext}>
c csName="home-triac-right" />
con>
c
c
c
c
chome-font">Find ca unique collection</p>
        </div>
      </div>
    </section>
  )
}
