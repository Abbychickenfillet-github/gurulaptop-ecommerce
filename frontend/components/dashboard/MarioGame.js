import React, { useState } from "react";
import styles from "@/styles/MarioGame.module.scss"; // Separate CSS file to keep styling modular

const MarioGame = () => {
  const [score, setScore] = useState(0);

  const handleCoinCollection = () => {
    setScore(score + 1); // Increment score on coin collection
  };

  return (
    <div className={`${styles.world}`}>
      <div className={`${styles.mario}`}>
        <div className={`${styles.walk}`}></div>
        <div className={`${styles.jump}`}></div>
      </div>
      <div className={`${styles.ground}`}></div>
      <div className={`${styles.blocks}`}>
        <div className={`${styles.brick}`}></div>
        <div className={`${styles.brick}`}></div>
        <div className={`${styles.questionblock}`} onClick={handleCoinCollection}>
          <div className={`${styles.coin}`}></div>
        </div>
        <div className={`${styles.brick}`}></div>
      </div>
      <div className={`${styles.scoredisplay}`}>Score: {score}</div>
    </div>
  );
};

export default MarioGame;
