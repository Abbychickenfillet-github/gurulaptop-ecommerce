import React, { useState, useRef } from 'react';

const ArticleSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const articlesPerView = 1;
  
  const articles = [
    {
      id: 1,
      image: '/images/index/banner_08.jpg',
      title: '文章開頭 1',
      text: '經過上述討論，dbfdf的發生...'
    },
    {
      id: 2,
      image: '/images/index/banner_09.jpg', 
      title: '文章開頭 2',
      text: '經過上述討論，dbfdf的發生...'
    },
    {
      id: 3,
      image: '/images/index/banner_09.jpg',
      title: '文章開頭 3', 
      text: '經過上述討論，dbfdf的發生...'
    }
  ];

  const handleNext = () => {
    if (currentIndex < articles.length - articlesPerView) {
      setCurrentIndex(prev => prev + 1);
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(-${(currentIndex + 1) * 400}px)`;
      }
    } else {
      // 回到第一篇
      setCurrentIndex(0);
      if (containerRef.current) {
        containerRef.current.style.transform = 'translateY(0)';
      }
    }
  };

  return (
    <section className="home-section5">
      <title className="home-title">◇品牌文章</title>
      <div className="home-article-container">
        <div 
          ref={containerRef} 
          className="home-articles-wrapper"
          style={{
            transition: 'transform 0.5s ease-in-out'
          }}
        >
          {articles.map((article, index) => (
            <article key={article.id} className="home-article">
              <div className="home-article-body">
                <div className="home-article-img">
                  <img src={article.image} alt={`Article ${index + 1}`} />
                </div>
                <div className="home-article-content">
                  <div className="home-article-title2">
                    <span>{article.title}</span>
                  </div>
                  <p className="home-article-text">{article.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button className="home-article-btn" onClick={handleNext}>
          <img src="/images/index/arrow.svg" alt="Next" />
        </button>
      </div>
    </section>
  );
};

export default ArticleSlider;