/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type Dispatch, type SetStateAction } from 'react';
import type { IBlogPost } from '../models/BlogPostInterface';

interface EditorState {
  editingPostId: string | null;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string;
  category: string;
  isPublished: boolean;
  commentsEnabled: boolean;
}

interface BlogPostEditorContextType extends EditorState {
  setEditorState: Dispatch<SetStateAction<EditorState>>;
  startEditing: (post: Partial<IBlogPost>) => void;
}

const defaultEditorState: EditorState = {
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

export const BlogPostEditorContext = createContext<BlogPostEditorContextType | null>(null);

export const BlogPostEditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [editorState, setEditorState] = useState<EditorState>(defaultEditorState);

  const startEditing = (post: Partial<IBlogPost>) => {
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
