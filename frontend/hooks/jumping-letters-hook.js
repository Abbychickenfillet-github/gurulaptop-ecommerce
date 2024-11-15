import { useState, useCallback } from 'react'
import styles from '@/styles/jumping-letters.module.css'

export const useJumpingLetters = () => {
  const [activeLetters, setActiveLetters] = useState(new Set())

  const handleMouseEnter = useCallback((index) => {
    setActiveLetters((prev) => new Set(prev).add(index))
  }, [])

  const handleAnimationEnd = useCallback((index) => {
    setActiveLetters((prev) => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }, [])

  const renderJumpingText = useCallback(
    (text, className = '') => {
      // 用來追蹤總字母數
      let globalLetterIndex = 0;
      
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
                    const currentIndex = globalLetterIndex++;
                    return (
                      <span
                        key={`${segmentIndex}-${letterIndex}`}
                        className={`${styles.alphabet} ${
                          activeLetters.has(currentIndex) ? styles.active : ''
                        }`}
                        onMouseEnter={() => handleMouseEnter(currentIndex)}
                        onAnimationEnd={() => handleAnimationEnd(currentIndex)}
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
    },
    [activeLetters, handleMouseEnter, handleAnimationEnd]
  );

  return { renderJumpingText }
}