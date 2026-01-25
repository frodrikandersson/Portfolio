import { useState, useRef, useEffect } from 'react';
import { adminGetAllMedia, adminUploadMedia } from '../../services/mediaService';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import type { IMediaFrontend } from '../../models/MediaInterface';
import classes from './MediaPickerModal.module.css';

type MediaPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: IMediaFrontend) => void;
  title?: string;
};

export const MediaPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Image',
}: MediaPickerModalProps) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [media, setMedia] = useState<IMediaFrontend[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedId(null);
      setError('');
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await adminGetAllMedia();
      setMedia(data.media);
      setError('');
    } catch {
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const newMedia = await adminUploadMedia(file);
      setMedia(prev => [newMedia, ...prev]);
      setSelectedId(newMedia._id);
      setActiveTab('library');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSelect = () => {
    const selected = media.find(m => m._id === selectedId);
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={classes.overlay} onClick={handleOverlayClick}>
      <div className={classes.modal}>
        <div className={classes.header}>
          <h3>{title}</h3>
          <button className={classes.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={classes.tabs}>
          <button
            className={`${classes.tab} ${activeTab === 'library' ? classes.tabActive : ''}`}
            onClick={() => setActiveTab('library')}
          >
            Media Library
          </button>
          <button
            className={`${classes.tab} ${activeTab === 'upload' ? classes.tabActive : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload New
          </button>
        </div>

        <div className={classes.content}>
          {activeTab === 'library' && (
            <>
              {loading ? (
                <div className={classes.loading}>Loading media...</div>
              ) : media.length === 0 ? (
                <div className={classes.empty}>
                  No media yet. Switch to "Upload New" to add images.
                </div>
              ) : (
                <div className={classes.grid}>
                  {media.map((m) => (
                    <div
                      key={m._id}
                      className={`${classes.thumbnail} ${selectedId === m._id ? classes.thumbnailSelected : ''}`}
                      onClick={() => setSelectedId(m._id)}
                    >
                      <ResponsiveImage
                        coverImage={m}
                        alt={m.altText || m.title}
                        className={classes.thumbnailImage}
                        sizes="120px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'upload' && (
            <div className={classes.uploadTab}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={classes.hiddenInput}
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              {uploading ? (
                <div className={classes.uploading}>Uploading...</div>
              ) : (
                <div
                  className={`${classes.dropzone} ${isDragging ? classes.dropzoneActive : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={classes.dropzoneText}>
                    {isDragging ? 'Drop image here' : 'Drag & drop an image or click to upload'}
                  </div>
                  <div className={classes.dropzoneHint}>JPEG, PNG, WebP (max 5MB)</div>
                </div>
              )}
            </div>
          )}

          {error && <div className={classes.error}>{error}</div>}
        </div>

        <div className={classes.footer}>
          <button className={classes.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={classes.selectBtn}
            onClick={handleSelect}
            disabled={!selectedId}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};
