import React, { useState, useRef } from 'react'

const ArticleSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)
  const articlesPerView = 1

  const articles = [
    {
      id: 1,
      image: '/images/index/banner_20.jpg',
      title: '繪圖筆電使用心得',
      text: '選購了這台繪圖筆電，壓感精準，屏幕可360度翻轉，很適合設計工作。',
      imageLeft: true,
      link: 'http://localhost:3000/blog/blog-detail/51',
    },
    {
      id: 2,
      image: '/images/index/banner_21.jpg',
      title: 'AI筆電新品發表會',
      text: '參加了最新AI智能筆電發表會，整合多項AI功能，包括智能降噪和自動優化效能，令人期待。',
      imageLeft: false,
      link: 'http://localhost:3000/blog/blog-detail/48',
    },

    {
      id: 3,
      image: '/images/index/banner_08.jpg',
      title: '設計師筆電開箱與專業測試分享',
      text: '身為設計師，螢幕色彩表現是最重要的考量。這台筆電擁有100% DCI-P3色域，4K解析度帶來極致細節，觸控筆更是得心應手，完美符合創作需求。',
      imageLeft: true,
      link: 'http://localhost:3000/blog/blog-detail/5',
    },
    {
      id: 4,
      image: '/images/index/banner_09.jpg',
      title: '直播主專用筆電分享',
      text: '適合直播的筆電，內建優質收音和高畫質鏡頭，效能也足夠應付串流需求。',
      imageLeft: false,
      link: 'http://localhost:3000/blog/blog-detail/55',
    },
    {
      id: 5,
      image: '/images/index/banner_22.jpg',
      title: '電腦展筆電採購攻略與心得',
      text: '這次電腦展逛下來，發現不少好康。各家品牌都推出新款筆電，其中最吸引人的是AI智慧降噪功能，視訊會議品質大幅提升，加上促銷優惠，CP值相當高。',
      imageLeft: true,
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 6,
      image: '/images/index/banner_19.jpg',
      title: '創作者筆電開箱與效能實測',
      text: '身為影片創作者，挑選一台高效能筆電至關重要。這台配備最新RTX顯卡，剪輯4K影片毫無壓力，32GB記憶體讓多工處理更加流暢，極度推薦！',
      imageLeft: false,
      link: 'http://localhost:3000/blog/blog-detail/9',
    },
  ]

  const handleNext = () => {
    const mobileHeight = window.innerWidth <= 768 ? 600 : 400
    const articleHeight = window.innerWidth <= 480 ? 500 : mobileHeight
    const maxScroll = 1600 // 設定最大滾動距離

    if (currentIndex < articles.length - articlesPerView) {
      // 計算下一個滾動位置
      const nextScrollPosition = (currentIndex + 1) * articleHeight

      if (nextScrollPosition > maxScroll) {
        // 如果超過最大滾動距離，回到頂部
        setCurrentIndex(0)
        if (containerRef.current) {
          containerRef.current.style.transform = 'translateY(0)'
        }
      } else {
        // 否則繼續往下滾動
        setCurrentIndex((prev) => prev + 1)
        if (containerRef.current) {
          containerRef.current.style.transform = `translateY(-${nextScrollPosition}px)`
        }
      }
    } else {
      // 到達最後一篇文章時回到頂部
      setCurrentIndex(0)
      if (containerRef.current) {
        containerRef.current.style.transform = 'translateY(0)'
      }
    }
  }

  return (
    <section className="home-section5">
      <div className="title-body">
        <div className="home-title-diamond">◇</div>
        <title className="home-title">部落格文章</title>
      </div>
      <div className="home-article-container">
        <div ref={containerRef} className="home-articles-wrapper">
          {articles.map((article, index) => (
            <article key={article.id} className="home-article">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="home-article-link"
              >
                <div className="home-article-body">
                  {article.imageLeft ? (
                    <>
                      <div className="home-article-img">
                        <img src={article.image} alt={`Article ${index + 1}`} />
                      </div>
                      <div className="home-article-content">
                        <div className="home-article-title2">
                          <h3>{article.title}</h3>
                        </div>
                        <p className="home-article-text">{article.text}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="home-article-content">
                        <div className="home-article-title2">
                          <h3>{article.title}</h3>
                        </div>
                        <p className="home-article-text">{article.text}</p>
                      </div>
                      <div className="home-article-img">
                        <img src={article.image} alt={`Article ${index + 1}`} />
                      </div>
                    </>
                  )}
                </div>
              </a>
            </article>
          ))}
        </div>
        <button className="home-article-btn" onClick={handleNext}>
          <img src="/images/index/arrow.svg" alt="Next" />
        </button>
      </div>
    </section>
  )
}

export default ArticleSection
