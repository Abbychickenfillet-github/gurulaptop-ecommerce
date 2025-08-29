import { useEffect, useState } from 'react'
import styles from '@/styles/BackToTop.module.css'

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])



  const scrollToTop = () => {
    // window.scrollTo({
    //   top: 0,
    //   behavior: 'smooth'
    // });
    document.querySelector('.main-body').scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  //   return (
  //     <button
  //       style={buttonStyle}
  //       onClick={scrollToTop}
  //       onMouseEnter={e => {
  //         e.target.style.backgroundColor = '#6900c7';
  //         e.target.style.transform = 'translateY(-3px)';
  //         e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  //       }}
  //       onMouseLeave={e => {
  //         e.target.style.backgroundColor = '#8B00FF';
  //         e.target.style.transform = 'translateY(0)';
  //         e.target.style.boxShadow = '0px 0px 20px 2px #6854C7';
  //       }}
  //     >
  //       ↑
  //     </button>
  //   );

  return (
    <button
      onClick={scrollToTop}
      className={`${styles.backToTop} ${isVisible ? styles.show : ''}`}
    >
      ↑
    </button>
  )
}

export default BackToTop
