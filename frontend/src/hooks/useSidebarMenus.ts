import { useAuth } from "../contexts/AuthContext";
import { useBlog } from "../contexts/BlogContext";
import type { SidebarMenuItem } from "../models/Sidebar";
import { getPostDateInfo } from "../utils/formatPostDate";

export const useSidebarMenus = (): {
  [key: string]: SidebarMenuItem[];
} => {
  const { isLoggedIn, role } = useAuth();
  const { blogPosts } = useBlog();

  return {
    home: [
      {
        id: "home",
        title: "Home.tsx",
        componentName: "HomePage",
        label: "Home",
      },
      {
        id: "about",
        title: "About.tsx",
        componentName: "AboutPage",
        label: "About",
      },
      {
        id: "terms-of-service",
        title: "TermsOfService.tsx",
        componentName: "TermsOfServicePage",
        label: "Terms of Service",
      },
    ],
    products: [
      {
        id: "products",
        title: "Products.tsx",
        componentName: "ProductsPage",
        label: "Standalone products",
      },
      {
        id: "product-package",
        title: "Product Package.tsx",
        componentName: "SubscriptionPage",
        label: "Subscription package",
      },
    ],
    blog: [
      ...(isLoggedIn && role === "admin"
        ? [
            {
              id: "new-blog-post",
              title: "NewBlogPost.tsx",
              componentName: "AdminPage",
              label: "+ New Blog Post",
            },
          ]
        : []),
      ...blogPosts.map((post) => {
        const dateInfo = getPostDateInfo(post.publishedAt, post.updatedAt, post.createdAt);
        return {
          id: `blog-${post._id}`,
          title: `${post.title}.tsx`,
          componentName: "BlogPostPage",
          label: post.title,
          props: { postId: post._id },
          badge: dateInfo.badge,
          relativeDate: dateInfo.relativeDate,
        };
      }),
    ],
    support: [
      {
        id: "support",
        title: "Support-FAQ.tsx",
        componentName: "SupportPage",
        label: "Support / FAQ",
      },
      {
        id: "social-links",
        title: "SocialLinks.tsx",
        componentName: "SocialLinksPage",
        label: "Social links",
      },
    ],
    profile: [
      {
        id: "auth",
        title: "Authentication.tsx",
        componentName: "AuthPanel",
        label: isLoggedIn ? "Log out" : "Log in",
      },
      ...(!isLoggedIn
        ? [
            {
              id: "register",
              title: "Register.tsx",
              componentName: "RegisterPage",
              label: "Register",
            },
          ]
        : []),
      ...(isLoggedIn
        ? [
            {
              id: "library",
              title: "Library.tsx",
              componentName: "LibraryPage",
              label: "My Library",
            },
          ]
        : []),
      ...(isLoggedIn
        ? [
            {
              id: "profile-page",
              title: "Profile.tsx",
              componentName: "ProfilePage",
              label: "Profile page",
            },
          ]
        : []),
      ...(role === "admin"
        ? [
            {
              id: "admin-page",
              title: "Admin.tsx",
              componentName: "AdminPage",
              label: "Admin page",
            },
          ]
        : []),
    ],
  };
};
