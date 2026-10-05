import { useTabs } from '../../contexts/TabContext';
import { SEO } from '../SEO/SEO';
import { whiteoutTools, type WhiteoutTool } from '../../data/whiteoutTools';
import classes from './WhiteoutHub.module.css';

export const WhiteoutHub = () => {
  const { dispatch } = useTabs();

  const openTool = (tool: WhiteoutTool) => {
    dispatch({
      type: 'ADD_TAB',
      tab: { id: tool.tabId, title: tool.tabTitle, componentName: tool.componentName },
    });
    dispatch({ type: 'SET_ACTIVE', id: tool.tabId });
  };

  return (
    <div className={classes.container}>
      <SEO
        title="Whiteout Survival Tools"
        description="A battle simulator, spend-event calculators and a full skin wardrobe for Whiteout Survival. Built for fun by a player who thinks about this game far too much."
      />

      <header className={classes.hero}>
        <img
          className={classes.logo}
          src="/whiteout/whiteout_logo.webp"
          alt="Whiteout Survival"
          width={512}
          height={512}
          loading="eager"
        />
        <div className={classes.heroText}>
          <h1>Whiteout Tools</h1>
          <p className={classes.tagline}>
            A small pile of tools for a game I think about far more than I should.
          </p>
        </div>
      </header>

      <section className={classes.section}>
        <h2>Why this is here</h2>
        <p>
          This corner of the site has nothing to do with my work. Whiteout Survival is
          my obsession and how I pass the time, and somewhere along the way the two
          collided: I kept wanting numbers the game does not give you, so I started
          building them.
        </p>
        <p>
          Everything here is free, has no account requirement, and exists mainly because
          I wanted it to exist. If you play, help yourself. If you do not, this is
          probably the least interesting page on the site.
        </p>
      </section>

      <section className={classes.section}>
        <h2>The tools</h2>
        <p className={classes.sectionNote}>
          All three are still being built. The tiles work. The tools behind them
          are on their way.
        </p>
      </section>

      <ul className={classes.grid}>
        {whiteoutTools.map(tool => (
          <li key={tool.id} className={classes.gridItem}>
            <button type="button" className={classes.tile} onClick={() => openTool(tool)}>
              <span className={classes.thumb} aria-hidden="true">
                {tool.image ? (
                  <img className={classes.thumbImage} src={tool.image} alt="" loading="lazy" />
                ) : (
                  <span className={classes.thumbIcon}>{tool.icon}</span>
                )}
              </span>
              <span className={classes.tileBody}>
                <span className={classes.tileTitle}>
                  {tool.title}
                  {tool.status === 'planned' && (
                    <span className={classes.tileBadge}>Soon</span>
                  )}
                </span>
                <span className={classes.tileBlurb}>{tool.blurb}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className={classes.footnote}>
        Whiteout Survival is a game by Century Games. This is an unofficial fan project
        and is not affiliated with or endorsed by them.
      </p>
    </div>
  );
};
