import { useTabs } from "../../contexts/TabContext";
import { ResponsiveImage } from "../ResponsiveImage/ResponsiveImage";
import { SEO } from "../SEO/SEO";
import classes from "./AboutContent.module.css";

export const AboutContent = () => {
  const { dispatch } = useTabs();

  const openSocialLinks = () => {
    dispatch({
      type: "ADD_TAB",
      tab: {
        id: "social-links",
        title: "Social Links",
        componentName: "SocialLinksPage",
      },
    });
    dispatch({ type: "SET_ACTIVE", id: "social-links" });
  };

  return (
    <main className={classes.container}>
      <SEO
        title="About"
        description="Full-stack developer specializing in JavaScript, React, TypeScript, and plugin development for Twitch, WordPress, Figma, Notion, and Discord. Available for hire."
      />
      <section className={classes.hero}>
        <ResponsiveImage
          coverImage="https://files.quilcount.store/media/media-1769317381966-40269923.png"
          alt="QuilCount avatar"
          className={classes.avatar}
          sizes="150px"
        />
        <h1>Hi, I'm QuilCount</h1>
        <p className={classes.subtitle}>
          Full-Stack Developer Specializing in JavaScript & Plugin Development
        </p>
        <button className={classes.ctaButton} onClick={openSocialLinks}>
          Contact or Hire Me
        </button>
      </section>

      <section className={classes.section}>
        <h2>About Me</h2>
        <p>
          I'm a full-stack developer with a strong focus on anything JavaScript,
          especially React.js with TypeScript. I'm passionate about building
          tools that empower creators, businesses, and individuals alike.
        </p>
        <p>
          My approach always puts the user first: I prioritize intuitive UX,
          clear documentation, and robust admin tooling that lets users control
          and update their purchases with confidence.
        </p>
        <p>
          I'm also experienced with AI tools and workflows, and I enjoy taking
          on new technical challenges. If you're looking for something unique or
          not explicitly listed, I'm open-minded and ready to tailor my skills
          to fit your needs.
        </p>
        <p>
          I've created content and plugins for platforms like{" "}
          <strong>Twitch, WordPress, Figma, Notion, Discord</strong> and more,
          always with a focus on high quality and customer-first delivery.
        </p>
      </section>

    </main>
  );
};
