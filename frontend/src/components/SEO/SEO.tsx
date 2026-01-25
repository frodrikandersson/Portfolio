import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'QuilCount - Full-Stack Developer';
const DEFAULT_DESCRIPTION =
  'Full-stack developer specializing in JavaScript, React, TypeScript, and plugin development for Twitch, WordPress, Figma, Notion, and Discord.';

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = '/favicon.png',
  type = 'website',
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | QuilCount` : DEFAULT_TITLE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
