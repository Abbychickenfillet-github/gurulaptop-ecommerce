import React from 'react';
import styles from './glitch-text.module.scss';

const GlitchText = ({ children, className = '' }) => {
  return (
    <h1 className={`${styles.text} ${className}`} data-text={children}>
      {children}
    </h1>
  );
};

export default GlitchText;