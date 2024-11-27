// src/components/HomeSection.js
import React, { useState, useEffect } from 'react'
import { bannerData } from './bannerData'

export default function HomeSection() {
  const [currentImage, setCurrentImage] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const getTitleText = (index, title) => {
    switch (index) {
      case 0:
        return `ROG Strix G16`;
      case 1:
        return `MSI Cyborg 15`;
      case 2:
        return `Acer Predator`;
      default:
        return title
    }
  }

  // 處理圖片切換
  const handleImageChange = (index) => {
    if (isTransitioning) return // 如果正在轉換中，不執行切換
    setIsTransitioning(true)
    setCurrentImage(index)

    // 轉換完成後重置狀態
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500) // 配合 CSS transition 時間
  }

  // 自動輪播
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        handleImageChange((currentImage + 1) % bannerData.length)
      }
    }, 5000) // 每5秒切換一次

    return () => clearInterval(interval)
  }, [currentImage, isTransitioning])

  return (
    <div className="home-section1">
      <div className="home-welcome">
        <span>Welcome</span>
      </div>
      <div className="home-guru">
        <span>Guru</span>
      </div>
      <div className="home-laptop">
        <span>laptop</span>
      </div>
      <div className="home-banner">
        <div className="home-one">
          <img
            src={bannerData[currentImage].image}
            alt={bannerData[currentImage].title}
            className={isTransitioning ? 'transitioning' : ''}
          />
        </div>

        {bannerData.map((item, index) => (
          <div
            key={item.id}
            className={`home-${
              index === 0 ? 'two' : index === 1 ? 'three' : 'four'
            } ${currentImage === index ? 'active' : ''}`}
            onClick={() => handleImageChange(index)}
          >
            <div className="home-item">
              <div className="home-circle">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="home-item2">
                <span>{getTitleText(index, item.title)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
