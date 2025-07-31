import { createContext, useState } from 'react';

export const BlogPostEditorContext = createContext<any>(null);

const defaultEditorState = {
  editingPostId: null,
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  tags: '',
  category: '',
  isPublished: true,
  commentsEnabled: true,
};

export const BlogPostEditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [editorState, setEditorState] = useState<any>(defaultEditorState);

  const startEditing = (post: any) => {
    setEditorState({
      editingPostId: post._id ?? null,
      title: post.title ?? '',
      content: post.content ?? '',
      excerpt: post.excerpt ?? '',
      coverImage: post.coverImage ?? '',
      tags: (post.tags || []).join(', '),
      category: post.category ?? '',
      isPublished: post.isPublished ?? true,
      commentsEnabled: post.commentsEnabled ?? true,
    });
  };

  return (
    <BlogPostEditorContext.Provider value={{ ...editorState, setEditorState, startEditing }}>
      {children}
    </BlogPostEditorContext.Provider>
  );
};
