import { useState } from 'react';
import classes from '../BlogPostCreator/BlogPostCreator.module.css';
import { MediaPickerModal } from '../MediaPickerModal/MediaPickerModal';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import type { IMediaFrontend } from '../../models/MediaInterface';

type BlogPostFormProps = {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  excerpt: string;
  setExcerpt: (value: string) => void;
  coverImageFile: File | null;
  setCoverImageFile: (file: File | null) => void;
  selectedMedia: IMediaFrontend | null;
  setSelectedMedia: (media: IMediaFrontend | null) => void;
  tags: string;
  setTags: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  isPublished: boolean;
  setIsPublished: (value: boolean) => void;
  commentsEnabled: boolean;
  setCommentsEnabled: (value: boolean) => void;
  onSubmit: () => void;
  submitLabel: string;
};

export const BlogPostForm = ({
  title,
  setTitle,
  content,
  setContent,
  excerpt,
  setExcerpt,
  coverImageFile,
  setCoverImageFile,
  selectedMedia,
  setSelectedMedia,
  tags,
  setTags,
  category,
  setCategory,
  isPublished,
  setIsPublished,
  commentsEnabled,
  setCommentsEnabled,
  onSubmit,
  submitLabel,
}: BlogPostFormProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleMediaSelect = (media: IMediaFrontend) => {
    setSelectedMedia(media);
    setCoverImageFile(null);
  };

  const handleClearMedia = () => {
    setSelectedMedia(null);
  };

  return (
    <div className={classes.CreatorContainer}>
      <div className={classes.Field}>
        <label className={classes.Label}>Title</label>
        <input
          className={classes.Input}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter post title"
        />
      </div>

      <div className={classes.Field}>
        <label className={classes.Label}>Content</label>
        <textarea
          className={classes.Input}
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={8}
          placeholder="Write your post content..."
        />
      </div>

      <div className={classes.Field}>
        <label className={classes.Label}>Excerpt</label>
        <textarea
          className={classes.Input}
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Short summary for previews"
        />
      </div>

      <div className={classes.FieldRow}>
        <div className={classes.Field}>
          <label className={classes.Label}>Category</label>
          <input
            className={classes.Input}
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="e.g. tutorial, update"
          />
        </div>
        <div className={classes.Field}>
          <label className={classes.Label}>Tags (comma-separated)</label>
          <input
            className={classes.Input}
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="react, typescript, vscode"
          />
        </div>
      </div>

      <div className={classes.Field}>
        <label className={classes.Label}>Cover Image</label>
        {selectedMedia ? (
          <div className={classes.mediaPreview}>
            <ResponsiveImage
              coverImage={selectedMedia}
              alt={selectedMedia.title}
              className={classes.mediaPreviewImage}
              sizes="60px"
            />
            <span className={classes.mediaPreviewInfo}>{selectedMedia.title}</span>
            <button
              type="button"
              className={classes.mediaPreviewClear}
              onClick={handleClearMedia}
            >
              &times;
            </button>
          </div>
        ) : coverImageFile ? (
          <div className={classes.mediaPreview}>
            <span className={classes.mediaPreviewInfo}>{coverImageFile.name}</span>
            <button
              type="button"
              className={classes.mediaPreviewClear}
              onClick={() => setCoverImageFile(null)}
            >
              &times;
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={classes.mediaPickerBtn}
            onClick={() => setPickerOpen(true)}
          >
            Select Cover Image
          </button>
        )}
      </div>

      <div className={classes.CheckboxRow}>
        <label className={classes.CheckboxLabel}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={e => setIsPublished(e.target.checked)}
          />
          Publish
        </label>
        <label className={classes.CheckboxLabel}>
          <input
            type="checkbox"
            checked={commentsEnabled}
            onChange={e => setCommentsEnabled(e.target.checked)}
          />
          Comments
        </label>
      </div>

      <div className={classes.Buttons}>
        <button className={classes.Button} onClick={onSubmit}>
          {submitLabel}
        </button>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleMediaSelect}
        title="Select Cover Image"
      />
    </div>
  );
};
