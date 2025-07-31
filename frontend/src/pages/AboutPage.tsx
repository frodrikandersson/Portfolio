import classes from './Pages.module.css';

export const AboutPage = () => {
  return (
    <main className={classes.aboutContainer}>
      {/* Hero Section */}
      <section className={classes.aboutHero}>
        <img src="avatar/Popp.png" alt="QuilCount avatar" className={classes.aboutAvatar} />
        <h1>Hi, I’m QuilCount</h1>
        <p className={classes.aboutSubtitle}>Full-Stack Developer Specializing in JavaScript & Plugin Development</p>
        <a href="#contact" className={classes.aboutCtaButton}>Contact or Hire Me</a>
      </section>

      {/* About Content */}
      <section className={classes.aboutSection}>
        <h2>About Me</h2>
        <p>
          I'm a full-stack developer with a strong focus on anything JavaScript—especially React.js with TypeScript. I’m passionate
          about building tools that empower creators, businesses, and individuals alike.
        </p>
        <p>
          My approach always puts the user first: I prioritize intuitive UX, clear documentation, and robust admin tooling that
          lets users control and update their purchases with confidence.
        </p>
        <p>
          I'm also experienced with AI tools and workflows, and I enjoy taking on new technical challenges. If you're looking for
          something unique or not explicitly listed, I’m open-minded and ready to tailor my skills to fit your needs.
        </p>
        <p>
          I’ve created content and plugins for platforms like <strong>Twitch, WordPress, Figma, Notion, Discord</strong> and more—
          always with a focus on high quality and customer-first delivery.
        </p>
      </section>

      {/* Reviews / Testimonials Placeholder */}
      <section className={classes.aboutSection}>
        <h2>What People Say</h2>
        <div className={classes.aboutReviewCards}>
          {/* Placeholder for VGen reviews integration */}
          <p>⭐ Coming soon: Client reviews from VGen commissions!</p>
        </div>
      </section>
    </main>
  );
};
