import { useTabs } from '../../contexts/TabContext';
import { SEO } from '../SEO/SEO';
import classes from './WhiteoutComingSoon.module.css';

interface WhiteoutComingSoonProps {
  title: string;
  blurb: string;
  planned: string[];
}

export const WhiteoutComingSoon = ({ title, blurb, planned }: WhiteoutComingSoonProps) => {
  const { dispatch } = useTabs();

  const openHub = () => {
    dispatch({
      type: 'ADD_TAB',
      tab: { id: 'whiteout-tools', title: 'WhiteoutTools.tsx', componentName: 'WhiteoutToolsPage' },
    });
    dispatch({ type: 'SET_ACTIVE', id: 'whiteout-tools' });
  };

  return (
    <div className={classes.container}>
      <SEO title={`${title} - Whiteout Survival`} description={blurb} />

      <header className={classes.header}>
        <span className={classes.badge}>In progress</span>
        <h1>{title}</h1>
        <p className={classes.blurb}>{blurb}</p>
      </header>

      <section className={classes.section}>
        <h2>What it will do</h2>
        <ul className={classes.plannedList}>
          {planned.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <button type="button" className={classes.backButton} onClick={openHub}>
        Back to Whiteout Tools
      </button>
    </div>
  );
};
