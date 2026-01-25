const RECENCY_THRESHOLD_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type PostBadge = 'new' | 'updated' | null;

export interface PostDateInfo {
  badge: PostBadge;
  relativeDate: string;
  fullDate: string;
  updatedFullDate?: string;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / ONE_DAY_MS);
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  // For older posts, show the date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return diffMs < days * ONE_DAY_MS;
}

export function getPostDateInfo(
  publishedAt: Date | string | null | undefined,
  updatedAt?: Date | string | null,
  createdAt?: Date | string | null
): PostDateInfo {
  // Use publishedAt, fall back to createdAt
  const published = publishedAt ? new Date(publishedAt) : createdAt ? new Date(createdAt) : null;
  const updated = updatedAt ? new Date(updatedAt) : null;

  if (!published) {
    return {
      badge: null,
      relativeDate: 'Draft',
      fullDate: 'Not published',
    };
  }

  const fullDate = published.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Determine badge
  let badge: PostBadge = null;
  let displayDate = published;

  const isNewPost = isWithinDays(published, RECENCY_THRESHOLD_DAYS);

  // Check if updated significantly after publishing (more than 1 day difference)
  const wasUpdated = updated &&
    (updated.getTime() - published.getTime() > ONE_DAY_MS) &&
    isWithinDays(updated, RECENCY_THRESHOLD_DAYS);

  if (isNewPost) {
    badge = 'new';
  } else if (wasUpdated) {
    badge = 'updated';
    displayDate = updated;
  }

  const result: PostDateInfo = {
    badge,
    relativeDate: getRelativeTime(displayDate),
    fullDate,
  };

  if (updated && updated.getTime() - published.getTime() > ONE_DAY_MS) {
    result.updatedFullDate = updated.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return result;
}
