// src/components/frontPage/Section4.js
import React, { useState } from 'react';

// 將 laptopData 移到組件外部
// const laptopData = [
//   {
//     id: 1,
//     image: "/images/index/banner_05.jpg",
//   },
//   {
//     id: 2,
//     image: "/images/index/banner_06.jpg",
//   },
//   {
//     id: 3,
//     image: "/images/index/banner_07.jpg",
//   }
// ];

export default function Section4() {
  const [rotation, setRotation] = useState(0);

  const handleNext = () => {
    setRotation(prev => prev - 120); // 順時針旋轉 120 度
  };

  const handlePrev = () => {
    setRotation(prev => prev + 120); // 逆時針旋轉 120 度
  };

  return (
    <section className="home-section4">
      <div className="home-pic-body2">
        <title className="home-title">◇熱門商品</title>
        <div className="home-card1">
          <div className="home-card2">
            <div className="home-slider-container">
              <div className="home-slider-content">
                <div className="carousel-container">
                  <div 
                    className="carousel-rotate" 
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {/* 確保 laptopData 存在且是陣列 */}
                    {Array.isArray(laptopData) && laptopData.map((image, index) => (
                      <div 
                        key={image.id}
                        className="carousel-item"
                        style={{ 
                          transform: `
                            rotate(${index * 120}deg) 
                            translateX(250px) 
                            rotate(-${index * 120}deg)
                          `
                        }}
                      >
                        <img src={image.image} alt={`Laptop ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="home-nav-arrows">
                  <button className="home-arrow-left" onClick={handlePrev}>
                    <div className="home-triangle-left" />
                  </button>
                  <button className="home-arrow-right" onClick={handleNext}>
                    <div className="home-triangle-right" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className="home-font">
            Find your style in a unique collection
          </p>
        </div>
      </div>
    </section>
  );
}