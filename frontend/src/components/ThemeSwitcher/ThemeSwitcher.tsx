import React, { useState, useEffect } from 'react';
import classes from './ThemeSwitcher.module.css';

export const ThemeSwitcher: React.FC = () => {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsNight(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsNight(prefersDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isNight);
    document.documentElement.classList.toggle('light', !isNight);
    localStorage.setItem('theme', isNight ? 'dark' : 'light');
  }, [isNight]);

  const toggleTheme = () => {
    setIsNight((prev) => !prev);
  };

  return (
    <button
      className={`${classes.themeSwitcherGrid} ${isNight ? classes.nightTheme : ''}`}
      onClick={toggleTheme}
      aria-label="Switch theme"
    >
      <div className={classes.sun} aria-hidden="true"></div>
      <div className={classes.moonOverlay} aria-hidden="true"></div>
      <div className={`${classes.cloudBall} ${classes.ball1} ${isNight ? classes.nightBall1 : ''}`} aria-hidden="true" />
      <div className={`${classes.cloudBall} ${classes.ball2} ${isNight ? classes.nightBall2 : ''}`} aria-hidden="true" />
      <div className={`${classes.cloudBall} ${classes.ball3} ${isNight ? classes.nightBall3 : ''}`} aria-hidden="true" />
      <div className={`${classes.cloudBall} ${classes.ball4} ${isNight ? classes.nightBall4 : ''}`} aria-hidden="true" />
      <div className={`${classes.star} ${classes.star1} ${isNight ? classes.visibleStar : ''}`} />
      <div className={`${classes.star} ${classes.star2} ${isNight ? classes.visibleStar : ''}`} />
      <div className={`${classes.star} ${classes.star3} ${isNight ? classes.visibleStar : ''}`} />
      <div className={`${classes.star} ${classes.star4} ${isNight ? classes.visibleStar : ''}`} />
    </button>
  );
};
