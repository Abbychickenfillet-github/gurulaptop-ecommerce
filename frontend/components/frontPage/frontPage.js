import React from 'react'
import Header from '@/components/layout/default-layout/header'
import MyFooter from '@/components/layout/default-layout/my-footer'
import HomeSection from './HomeSection'
import BackToTop from '../BackToTop/BackToTop'
import NewProducts from './NewProducts'
import HotProducts from './HotProducts'
import ArticleSlider from './ArticleSlider'
import Link from 'next/link'
import Image from 'next/image'

export default function FrontPage() {
  return (
    <>
      <div className="position-relative" style={{ zIndex: 1 }}>
        <Header />
      </div>

      <div className="blob-outer-container">
        <div className="blob-inner-container">
          <div className="blob"></div>
        </div>
      </div>

      <div className="main-body ">
        <HomeSection />

        <div className="home-section2">
          <div className="home-icon home-marquee-content3">
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ACER&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Acer.png"
                alt="Acer"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="https://www.asus.com/tw/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Asus-w.png"
                alt="Asus"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=DELL&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Dell.png"
                alt="Dell"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=%E6%8A%80%E5%98%89&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/gigabyte_白.png"
                alt="Gigabyte"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=HP&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/HP.png"
                alt="HP"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=MSI&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/msi_w.png"
                alt="MSI"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=RAZER&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Razer.png"
                alt="Razer"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ROG&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/rog.png"
                alt="ROG"
                width={50}
                height={50}
              />
            </Link>
          </div>

          <div className="home-icon home-marquee-content3">
            <Link
              href="https://www.acer.com/tw-zh"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Acer.png"
                alt="Acer"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ASUS&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Asus-w.png"
                alt="Asus"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=DELL&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Dell.png"
                alt="Dell"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=%E6%8A%80%E5%98%89&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/gigabyte_白.png"
                alt="Gigabyte"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=HP&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/HP.png"
                alt="HP"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=MSI&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/msi_w.png"
                alt="MSI"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=RAZER&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Razer.png"
                alt="Razer"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ROG&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/rog.png"
                alt="ROG"
                width={50}
                height={50}
              />
            </Link>
          </div>

          <div className="home-icon home-marquee-content3">
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ACER&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Acer.png"
                alt="Acer"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ASUS&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Asus-w.png"
                alt="Asus"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=DELL&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Dell.png"
                alt="Dell"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=%E6%8A%80%E5%98%89&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/gigabyte_白.png"
                alt="Gigabyte"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=HP&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/HP.png"
                alt="HP"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=MSI&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/msi_w.png"
                alt="MSI"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=RAZER&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Razer.png"
                alt="Razer"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ROG&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/rog.png"
                alt="ROG"
                width={50}
                height={50}
              />
            </Link>
          </div>

          <div className="home-icon home-marquee-content3">
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ACER&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Acer.png"
                alt="Acer"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ASUS&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Asus-w.png"
                alt="Asus"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=DELL&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Dell.png"
                alt="Dell"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=%E6%8A%80%E5%98%89&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/gigabyte_白.png"
                alt="Gigabyte"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=HP&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/HP.png"
                alt="HP"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=MSI&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/msi_w.png"
                alt="MSI"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=RAZER&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/Razer.png"
                alt="Razer"
                width={50}
                height={50}
              />
            </Link>
            <Link
              href="/product/list?page=1&category=product_brand&category_value=ROG&search=&price="
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/index/icon/rog.png"
                alt="ROG"
                width={50}
                height={50}
              />
            </Link>
          </div>
        </div>

        <div className="home-container-body">
          {/* <section className="home-section3">
            <div className="home-pic-body">
              <div className="title-body">
                <div className="home-title-diamond">◇</div>
                <title className="home-title">新品介紹</title>
              </div>
              <div className="home-pic">
                <div className="home-pic-box1">
                  <div className="home-content">
                    <h3>產品標題</h3>
                    <p>產品描述內容</p>
                  </div>
                </div>
                <div className="home-pic-box2">
                  <div className="home-content">
                    <h3>產品標題 2</h3>
                    <p>產品描述內容 2</p>
                  </div>
                </div>
                <div className="home-pic-box3">
                  <div className="home-content">
                    <h3>產品標題 3</h3>
                    <p>產品描述內容 3</p>
                  </div>
                </div>
                <div className="home-pic-box4">
                  <div className="home-content">
                    <h3>產品標題 4</h3>
                    <p>產品描述內容 4</p>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
          <NewProducts />

          {/* <section className="home-section4">
            <div className="home-pic-body2">
              <title className="home-title">◇熱門商品</title>
              <div className="home-card1">
                <div className="home-card2">
                  <div className="home-slider-container">
                    <div className="home-slider-content">
                      <div className="home-laptop-item"></div>
                      <div className="home-nav-arrows">
                        <button className="home-arrow-left">
                          <div className="home-triangle-left" />
                        </button>
                        <button className="home-arrow-right">
                          <div className="home-triangle-right" />
                        </button>
                      </div>
                    </div>
                  </div>
                                     <div className="home-pic2">
                     <span />
                     <Image src="/images/index/banner_05.jpg" alt="banner 5" width={300} height={200} />
                   </div>
                   <div className="home-pic1">
                     <span />
                     <Image src="/images/index/banner_06.jpg" alt="banner 6" width={300} height={200} />
                   </div>
                   <div className="home-pic3">
                     <span />
                     <Image src="/images/index/banner_07.jpg" alt="banner 7" width={300} height={200} />
                   </div>
                </div>
                <p className="home-font">
                  Find your style in a unique collection
                </p>
              </div>
            </div>
          </section> */}
          <HotProducts />

          <ArticleSlider />
        </div>

        <div className="home-activity-section6">
          <div className="title-body">
            <div className="home-title-diamond">◇</div>
            <title className="home-title">活動資訊</title>
          </div>
          <div className="home-activity-div">
            <div className="home-activity-container">
              <div className="home-activity-card-1">
                <div className="home-activity-frame home-activity-frame-left">
                  <h2 className="home-activity-card-title">
                    APEX - INTOVOID娛樂賽
                  </h2>
                  <div className="home-activity-card-content1">
                    <p>
                      INTOVOID娛樂賽 SDLP
                      Community主辦的第四届娛樂賽,開放給各位玩家報名
                    </p>
                  </div>
                  <div className="home-activity-card-footer1">
                    <Link
                      href="/event/eventDetail/1"
                      className="home-activity-btn"
                    >
                      <Image
                        src="/images/index/arrow.svg"
                        alt="arrow"
                        width={20}
                        height={20}
                      />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="home-activity-card-2">
                <div className="home-activity-frame home-activity-frame-right">
                  <h2 className="home-activity-card-title">
                    The Updraft W3 Powered by PLANET9
                  </h2>
                  <div className="home-activity-card-content1">
                    <p>輔仁大學與DINOGAMEHOUSE合辦的特戰英豪比賽</p>
                  </div>
                  <div className="home-activity-card-footer1">
                    <Link
                      href="/event/eventDetail/9"
                      className="home-activity-btn"
                    >
                      <Image
                        src="/images/index/arrow.svg"
                        alt="arrow"
                        width={20}
                        height={20}
                      />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="home-activity-card-3">
                <div className="home-activity-frame home-activity-frame-top">
                  <h2 className="home-activity-card-title">
                    爬瓦盃 POWER CHAMPION CUP
                  </h2>
                  <div className="home-activity-card-content1">
                    <p>
                      爬瓦盃是由輔仁大學資管系與DINOGAMEHOUSE一起合辦的特戰英豪比賽
                      滿15歲以上便可報名
                    </p>
                  </div>
                  <div className="home-activity-card-footer2">
                    <Link
                      href="/event/eventDetail/11"
                      className="home-activity-btn"
                    >
                      <Image
                        src="/images/index/arrow.svg"
                        alt="arrow"
                        width={20}
                        height={20}
                      />
                    </Link>
                  </div>
                </div>
                <div className="home-activity-frame home-activity-frame-bottom">
                  <h2 className="home-activity-card-title">
                    AfreecaTV TFT The Chosen One TW&HK (S11) 海選賽
                  </h2>
                  <div className="home-activity-card-content1">
                    <p>
                      這次比賽為《AfreecaTV TFT The Chosen One TW&HK》的海選賽
                      (第一階段及第二階段)
                    </p>
                  </div>
                  <div className="home-activity-card-footer2">
                    <Link
                      href="/event/eventDetail/13"
                      className="home-activity-btn"
                    >
                      <Image
                        src="/images/index/arrow.svg"
                        alt="arrow"
                        width={20}
                        height={20}
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="home-activity-container2">
              <div className="home-activity-card3 home-activity-card3-left">
                <h2 className="home-activity-card-title">
                  2023長佳電競盃-板橋區域賽
                </h2>
                <div className="home-activity-card-content2">
                  <p>
                    化身可可愛愛的蛋仔，奔跑、跳躍、翻滾、碰撞～
                    在歡樂的派對中，你能不能脫穎而出成為奪冠者？
                  </p>
                </div>
                <div className="home-activity-card-footer3">
                  <Link href="/event/eventDetail/37" className="home-activity-btn">
                    <Image
                      src="/images/index/arrow.svg"
                      alt="arrow"
                      width={20}
                      height={20}
                    />
                  </Link>
                </div>
              </div>
              <div className="home-activity-card3 home-activity-card3-right">
                <h2 className="home-activity-card-title">
                  AOPEN x Fire Legend Championships
                </h2>
                <div className="home-activity-card-content2">
                  <p>
                    促進台灣APEX社群ARENA高端對局的交流，並同時讓玩家們來一場刺激的競賽。
                  </p>
                </div>
                <div className="home-activity-card-footer3">
                  <Link href="/event/eventDetail/10" className="home-activity-btn">
                    <Image
                      src="/images/index/arrow.svg"
                      alt="arrow"
                      width={20}
                      height={20}
                    />
                  </Link>
                </div>
              </div>
              <div className="home-activity-card4">
                <h2 className="home-activity-card-title">更多資訊</h2>
                <div className="home-activity-card-content2">
                  <p />
                </div>
                <div className="home-activity-card-footer3">
                  <Link href="/event" className="home-activity-btn">
                    <Image
                      src="/images/index/arrow.svg"
                      alt="arrow"
                      width={20}
                      height={20}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="position-relative frontpage-footer ">
          <MyFooter />
        </div>
        <BackToTop />
      </div>
    </>
  )
}
