import { useBlog } from '../../contexts/BlogContext';
import { BlogPostForm } from '../BlogPostForm/BlogPostForm';
import { useBlogPostEditor } from '../../hooks/useBlogPostEditor';
import { uploadBlogCover } from '../../services/blogService';
import { adminLinkMediaToEntity } from '../../services/mediaService';
import classes from './BlogPostCreator.module.css';

export const BlogPostCreator = () => {
  const { addPost, updatePost } = useBlog();
  const {
    editingPostId,
    title,
    content,
    excerpt,
    coverImageFile,
    selectedMedia,
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
      coverImageFile: null,
      selectedMedia: null,
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
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      category,
      authorId: 'admin',
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      views: 0,
      commentsEnabled,
    };

    try {
      const created = await addPost(newPost);
      if (created._id) {
        if (selectedMedia) {
          await adminLinkMediaToEntity(selectedMedia._id, 'blogpost', created._id, 'coverImage');
        } else if (coverImageFile) {
          await uploadBlogCover(created._id, coverImageFile);
        }
      }
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
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      category,
      isPublished,
      commentsEnabled,
      slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
    };

    try {
      await updatePost(editingPostId, updatedPost);
      if (selectedMedia) {
        await adminLinkMediaToEntity(selectedMedia._id, 'blogpost', editingPostId, 'coverImage');
      } else if (coverImageFile) {
        await uploadBlogCover(editingPostId, coverImageFile);
      }
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
        coverImageFile={coverImageFile}
        setCoverImageFile={set('coverImageFile')}
        selectedMedia={selectedMedia}
        setSelectedMedia={set('selectedMedia')}
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
