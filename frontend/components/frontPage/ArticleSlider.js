import React, { useState, useRef } from 'react'

const ArticleSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)
  const articlesPerView = 1

  const articles = [
    {
      id: 1,
      image: '/images/index/banner_08.jpg',
      title: '文章開頭',
      text: '經過上述討論，dbfdf的發生，到底需要如何做到...經過上述討論，dbfdf的發生，到底需要如何做到...',
      imageLeft: true,
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 2,
      image: '/images/index/banner_09.jpg',
      title: '文章開頭',
      text: '經過上述討論，dbfdf的發生，到底需要如何做到...',
      imageLeft: false,
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 3,
      image: '/images/index/banner_09.jpg',
      title: '文章開頭',
      text: '經過上述討論，dbfdf的發生，到底需要如何做到...',
      imageLeft: true,
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 4,
      image: '/images/index/banner_09.jpg',
      title: '文章開頭',
      text: '經過上述討論，dbfdf的發生，到底需要如何做到...',
      imageLeft: false,
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 5,
      image: '/images/index/banner_09.jpg',
      title: '文章開頭',
      text: '經過上述討論，dbfdf的發生，到底需要如何做到...',
      imageLeft: true,
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
    },
    {
      id: 6,
      image: '/images/index/banner_09.jpg',
      title: '文章開頭',
      text: '經過上述討論，dbfdf的發生，到底需要如何做到...',
      imageLeft: false,
      link: 'https://www.bilibili.com/video/BV1jkxyeVEG5/?spm_id_from=333.788.player.switch&vd_source=1b25005216ba454333811619f6788cea',
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
        <title className="home-title">品牌文章</title>
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
                          <span>{article.title}</span>
                        </div>
                        <p className="home-article-text">{article.text}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="home-article-content">
                        <div className="home-article-title2">
                          <span>{article.title}</span>
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
