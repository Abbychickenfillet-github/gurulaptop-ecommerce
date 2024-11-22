import React from 'react';
import styles from '@/styles/LoadingAnimation.module.css'

const LoadingAnimation = () => {
  return (
    <div className={styles.backdrop}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.glow}></div>
          <div className={styles.ring}></div>
          <div className={styles.text}>LOADING</div>
          <div className={styles.dot}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;