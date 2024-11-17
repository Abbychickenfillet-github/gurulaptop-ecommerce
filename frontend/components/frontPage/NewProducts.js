import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'

const NewProducts = () => {
  const [swiperRef, setSwiperRef] = useState(null)

  const products = [
    {
      id: 1,
      image: '/images/index/banner_17.jpg',
      title: '產品標題 1',
      description: '產品描述內容 1',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 2,
      image: '/images/index/banner_16.jpg',
      title: '產品標題 2',
      description: '產品描述內容 2',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 3,
      image: '/images/index/banner_03.jpg',
      title: '產品標題 3',
      description: '產品描述內容 3',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 4,
      image: '/images/index/banner_04.jpg',
      title: '產品標題 4',
      description: '產品描述內容 4',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 5,
      image: '/images/index/banner_04.jpg',
      title: '產品標題 4',
      description: '產品描述內容 4',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 6,
      image: '/images/index/banner_04.jpg',
      title: '產品標題 4',
      description: '產品描述內容 4',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
  ]

  return (
    <section className="home-section3">
      <div className="home-pic-body">
        <div className="title-body">
          <div className="home-title-diamond">◇</div>
          <title className="home-title">新品介紹</title>
        </div>
        <Swiper
          onSwiper={setSwiperRef}
          slidesPerView={3}
          centeredSlides={true}
          spaceBetween={30}
          initialSlide={1}
          className="home-pic"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="home-pic-box">
              <a href={product.link} className="product-link">
                <div className="home-content">
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </div>
                <div
                  className="slide-background"
                  style={{
                    backgroundImage: `url(${product.image})`,
                  }}
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default NewProducts
