import { useEffect, useState, useCallback } from 'react'
import styles from '@/styles/jumping-letters.module.css'

export const useJumpingLetters = () => {
  const [totalLetters, setTotalLetters] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isActive, setIsActive] = useState(true)  // 控制動畫開關

  // 自動跳動效果
  useEffect(() => {
    if (!isActive || totalLetters === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalLetters)
    }, 1000);  // 每200ms跳動一次

    return () => clearInterval(intervalId);
  }, [isActive, totalLetters]);

  const renderJumpingText = useCallback((text, className = '') => {
    let letterCount = 0;
    
    // 計算實際字母數（不包含空格）
    useEffect(() => {
      const count = text.split('').filter(char => char !== ' ').length;
      setTotalLetters(count);
    }, [text]);

    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.wordGroup}>
          {text.split(/(\s+)/).map((segment, segmentIndex) => {
            if (/\s+/.test(segment)) {
              return <span key={`space-${segmentIndex}`}>&nbsp;</span>;
            }
            
            return (
              <span key={segmentIndex} className={styles.wordWrap}>
                {segment.split('').map((letter, letterIndex) => {
                  const thisIndex = letterCount++;
                  return (
                    <span
                      key={`${segmentIndex}-${letterIndex}`}
                      className={`${styles.alphabet} ${
                        thisIndex === currentIndex ? styles.active : ''
                      }`}
                    >
                      {letter}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>
    );
  }, [currentIndex]);

  // 提供控制動畫的方法
  const toggleAnimation = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  return { 
    renderJumpingText, 
    isAnimating: isActive, 
    toggleAnimation 
  }
}