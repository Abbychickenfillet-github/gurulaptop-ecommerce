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

  const buttonStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '50px',
    height: '50px',
    backgroundColor: '#8B00FF',
    color: 'white',
    border: 'none',
    borderRadius: '100px',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.52)',
    boxShadow: '0px 0px 20px 2px #6854C7',
    backdropFilter: 'blur(5px)',
    display: isVisible ? 'block' : 'none',
  }

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
