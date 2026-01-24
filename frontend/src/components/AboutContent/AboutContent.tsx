import { useTabs } from '../../contexts/TabContext';
import classes from './AboutContent.module.css';

export const AboutContent = () => {
  const { dispatch } = useTabs();

  const openSocialLinks = () => {
    dispatch({ type: 'ADD_TAB', tab: { id: 'social-links', title: 'Social Links', componentName: 'SocialLinksPage' } });
    dispatch({ type: 'SET_ACTIVE', id: 'social-links' });
  };

  return (
    <main className={classes.container}>
      <section className={classes.hero}>
        <img src="avatar/Popp.png" alt="QuilCount avatar" className={classes.avatar} loading="lazy" />
        <h1>Hi, I'm QuilCount</h1>
        <p className={classes.subtitle}>Full-Stack Developer Specializing in JavaScript & Plugin Development</p>
        <button className={classes.ctaButton} onClick={openSocialLinks}>Contact or Hire Me</button>
      </section>

      <section className={classes.section}>
        <h2>About Me</h2>
        <p>
          I'm a full-stack developer with a strong focus on anything JavaScript, especially React.js with TypeScript. I'm passionate
          about building tools that empower creators, businesses, and individuals alike.
        </p>
        <p>
          My approach always puts the user first: I prioritize intuitive UX, clear documentation, and robust admin tooling that
          lets users control and update their purchases with confidence.
        </p>
        <p>
          I'm also experienced with AI tools and workflows, and I enjoy taking on new technical challenges. If you're looking for
          something unique or not explicitly listed, I'm open-minded and ready to tailor my skills to fit your needs.
        </p>
        <p>
          I've created content and plugins for platforms like <strong>Twitch, WordPress, Figma, Notion, Discord</strong> and more,
          always with a focus on high quality and customer-first delivery.
        </p>
      </section>

      <section className={classes.section}>
        <h2>What People Say</h2>
        <div className={classes.reviewCards}>
          <p>Coming soon: Client reviews from VGen commissions!</p>
        </div>
      </section>
    </main>
  );
};
