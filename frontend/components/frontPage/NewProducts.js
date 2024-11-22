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
      title: 'ASUS ExpertBook B9 OLED',
      description:
        '極輕．疾快\n採用頂級鎂鋰合金，突破輕量極限，實現極致的可攜性和耐用性',
      link: 'http://localhost:3000/product/71',
    },
    {
      id: 2,
      image: '/images/index/banner_03.jpg',
      title: 'GIGABYTE AORUS 5',
      description:
        '強大效能使遊戲操作不再受限，將全面解放玩家鬼神技術',
      link: 'http://localhost:3000/product/230',
    },
    {
      id: 3,
      image: '/images/index/banner_16.jpg',
      title: 'Razer Blade 18',
      description:
        '世上第一款搭載 18 吋 4K 200 Hz 顯示器1 與 Thunderbolt™ 52 的筆記型電腦',
      link: 'http://localhost:3000/product/247',
    },
    {
      id: 4,
      image: '/images/index/banner_05.jpg',
      title: '優惠券 7 折 ',
      description: '馬上領取，用最低價格入手你的夢幻筆電',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 5,
      image: '/images/index/banner_04.jpg',
      title: '結帳立減 1500 元',
      description: '筆電超值優惠，輕鬆帶回家，現在就行動',
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },

  ]

  return (
    <section className="home-section3">
      <div className="home-pic-body">
        <div className="title-body">
          <div className="home-title-diamond">◇</div>
          <title className="home-title">最新消息</title>
        </div>
        <Swiper
          onSwiper={setSwiperRef}
          slidesPerView={3}
          centeredSlides={true}
          spaceBetween={30}
          initialSlide={1}
          className="home-pic"
          breakpoints={{
            1200: {
              slidesPerView: 3,
              spaceBetween: 30,
              centeredSlides: true,
            },
            992: {
              slidesPerView: 2,
              spaceBetween: 20,
              centeredSlides: false,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 15,
              centeredSlides: false,
            },
            0: {
              slidesPerView: 1,
              spaceBetween: 10,
              centeredSlides: true,
            },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="home-pic-box">
              <a href={product.link} className="product-link">
                <div className="home-content">
                  <h3>{product.title}</h3>
                  <p
                    style={{
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                    }}
                  >
                    {product.description}
                  </p>
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
