import React, { useRef, useState } from 'react'
import { Virtual, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'

const HotProducts = () => {
  const [swiperRef, setSwiperRef] = useState(null)

  const products = [
    {
      id: 1,
      image: '/images/index/banner_05.jpg',
      title: 'Product 1',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 2,
      image: '/images/index/banner_06.jpg',
      title: 'Product 2',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 3,
      image: '/images/index/banner_07.jpg',
      title: 'Product 3',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 4,
      image: '/images/index/banner_07.jpg',
      title: 'Product 2',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 5,
      image: '/images/index/banner_07.jpg',
      title: 'Product 2',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
  ]

  return (
    <section className="home-section4">
      <div className="home-pic-body2">
        <div className="title-body">
          <div className="home-title-diamond">◇</div>
          <title className="home-title">熱門商品</title>
        </div>
        <div className="home-card1">
          <Swiper
            modules={[Virtual, Navigation]}
            onSwiper={setSwiperRef}
            slidesPerView={3}
            centeredSlides={true}
            spaceBetween={30}
            initialSlide={1}
            navigation={{
              nextEl: '.home-arrow-right',
              prevEl: '.home-arrow-left',
            }}
            virtual
            className="home-slider-container"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product.id} virtualIndex={index}>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="product-link"
                >
                  <div className="home-laptop-item">
                    <img src={product.image} alt={product.title} />
                  </div>
                  <div className="product-title">
                    <h3>{product.title}</h3>
                  </div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="home-nav-arrows">
            <button className="home-arrow-left">
              <div className="home-triangle-left" />
            </button>
            <button className="home-arrow-right">
              <div className="home-triangle-right" />
            </button>
          </div>

          <p className="home-font">Find your style in a unique collection</p>
        </div>
      </div>
    </section>
  )
}

export default HotProducts
