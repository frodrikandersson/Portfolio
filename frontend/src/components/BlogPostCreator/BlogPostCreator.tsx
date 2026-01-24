import { useBlog } from '../../contexts/BlogContext';
import { BlogPostForm } from '../BlogPostForm/BlogPostForm';
import { useBlogPostEditor } from '../../hooks/useBlogPostEditor';
import classes from './BlogPostCreator.module.css';

export const BlogPostCreator = () => {
  const { addPost, updatePost } = useBlog();
  const {
    editingPostId,
    title,
    content,
    excerpt,
    coverImage,
    tags,
    category,
    isPublished,
    commentsEnabled,
    setEditorState,
  } = useBlogPostEditor();

  const set = (field: string) => (value: unknown) =>
    setEditorState((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setEditorState({
      editingPostId: null,
      title: '',
      content: '',
      excerpt: '',
      coverImage: '',
      tags: '',
      category: '',
      isPublished: true,
      commentsEnabled: true,
    });
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;

    const newPost = {
      title,
      content,
      slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      excerpt,
      coverImage,
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      category,
      authorId: 'admin',
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      views: 0,
      commentsEnabled,
    };

    try {
      await addPost(newPost);
      resetForm();
    } catch {
      // Error state handled by BlogContext
    }
  };

  const handleUpdate = async () => {
    if (!editingPostId || !title.trim() || !content.trim()) return;

    const updatedPost = {
      title,
      content,
      excerpt,
      coverImage,
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      category,
      isPublished,
      commentsEnabled,
      slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      updatedAt: new Date(),
    };

    try {
      await updatePost(editingPostId, updatedPost);
      resetForm();
    } catch {
      // Error state handled by BlogContext
    }
  };

  return (
    <>
      <h3 className={classes.Title}>
        {editingPostId ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h3>
      <BlogPostForm
        title={title}
        setTitle={set('title')}
        content={content}
        setContent={set('content')}
        excerpt={excerpt}
        setExcerpt={set('excerpt')}
        coverImage={coverImage}
        setCoverImage={set('coverImage')}
        tags={tags}
        setTags={set('tags')}
        category={category}
        setCategory={set('category')}
        isPublished={isPublished}
        setIsPublished={set('isPublished')}
        commentsEnabled={commentsEnabled}
        setCommentsEnabled={set('commentsEnabled')}
        onSubmit={editingPostId ? handleUpdate : handleCreate}
        submitLabel={editingPostId ? 'Save Changes' : 'Create Post'}
      />
    </>
  );
};
