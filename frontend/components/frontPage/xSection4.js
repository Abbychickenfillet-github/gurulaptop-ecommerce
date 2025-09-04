// src/components/frontPage/Section4.js
import React, { useState } from 'react'
import Image from 'next/image'

// 將 laptopData 移到組件外部
const laptopData = [
  {
    id: 1,
    image: '/banner_05.png',
  },
  {
    id: 2,
    image: '/banner_06.png',
  },
  {
    id: 3,
    image: '/banner_07.png',
  },
]

const Section4 = () => {
  const [rotation, setRotation] = useState(0)

  const handlePrev = () => {
    setRotation((prev) => prev - 120)
  }

  const handleNext = () => {
    setRotation((prev) => prev + 120)
  }

  return (
    <section className="home-section4">
      <div className="home-pic-body2">
        <div className="home-title">◇</div>
        <div className="home-card1">
          <div className="home-card2">
            <div className="home-slider-container">
              <div className="home-slider-content">
                <div className="carousel-container">
                  <div
                    className="carousel-content"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {/* 確保 laptopData 存在且是陣列 */}
                    {Array.isArray(laptopData) &&
                      laptopData.map((image, index) => (
                        <div
                          key={image.id}
                          className="carousel-item"
                          style={{
                            transform: `
                              rotate(${index * 120}deg) 
                              translateX(250px) 
                              rotate(-${index * 120}deg)
                            `,
                          }}
                        >
                          <Image
                            src={image.image}
                            alt={`Laptop ${index + 1}`}
                            width={300}
                            height={200}
                          />
                        </div>
                      ))}
                  </div>
                </div>
                <div className="home-nav-arrows">
                  <button
                    className="home-arrow-container"
                    onClick={handlePrev}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handlePrev()
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="home-triangle-left" />
                  </button>
                  <button
                    className="home-arrow-container"
                    onClick={handleNext}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNext()
                      }
                    }}
                    tabIndex={0}
                  >
                    <div className="home-triangle-right" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="home-font">Find a unique collection</div>
      </div>
    </section>
  )
}

export default Section4
