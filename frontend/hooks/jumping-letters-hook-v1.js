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
      return (
        <div className={`${styles.container} ${className}`}>
          <div className={styles.wordGroup}>
            {text.split(' ').map((word, wordIndex) => (
              <span key={wordIndex} className={styles.wordWrap}>
                {word.split('').map((letter, letterIndex) => (
                  <span
                    key={`${wordIndex}-${letterIndex}`}
                    className={`${styles.alphabet} ${
                      activeLetters.has(`${wordIndex}-${letterIndex}`)
                        ? styles.active
                        : ''
                    }`}
                    onMouseEnter={() =>
                      handleMouseEnter(`${wordIndex}-${letterIndex}`)
                    }
                    onAnimationEnd={() =>
                      handleAnimationEnd(`${wordIndex}-${letterIndex}`)
                    }
                  >
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )
    },
    [activeLetters, handleMouseEnter, handleAnimationEnd]
  )

  return { renderJumpingText }
}