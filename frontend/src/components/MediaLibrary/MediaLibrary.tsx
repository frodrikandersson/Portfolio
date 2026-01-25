import { useState, useRef } from 'react';
import { useMediaLibrary } from '../../hooks/useMediaLibrary';
import { ResponsiveImage } from '../ResponsiveImage/ResponsiveImage';
import type { IMediaFrontend, IMediaUsageRef } from '../../models/MediaInterface';
import classes from './MediaLibrary.module.css';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export const MediaLibrary = () => {
  const {
    media,
    selectedId,
    setSelectedId,
    selectedMedia,
    loading,
    uploading,
    error,
    success,
    handleUpload,
    handleUpdate,
    handleDelete,
    handleSync,
  } = useMediaLibrary();

  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; usageRefs?: IMediaUsageRef[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (m: IMediaFrontend) => {
    setSelectedId(m._id);
    setEditTitle(m.title);
    setEditAltText(m.altText);
  };

  const handleSave = () => {
    if (selectedId) {
      handleUpdate(selectedId, { title: editTitle, altText: editAltText });
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedId) return;
    const result = await handleDelete(selectedId, false);
    if (!result.success && result.usageRefs) {
      setDeleteDialog({ id: selectedId, usageRefs: result.usageRefs });
    }
  };

  const handleForceDelete = async () => {
    if (!deleteDialog) return;
    await handleDelete(deleteDialog.id, true);
    setDeleteDialog(null);
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

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h3>Media Library</h3>
        <div className={classes.headerActions}>
          <button
            className={classes.uploadBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            className={classes.syncBtn}
            onClick={handleSync}
            disabled={loading}
          >
            Sync Existing
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={classes.hiddenInput}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {error && <div className={classes.error}>{error}</div>}
      {success && <div className={classes.success}>{success}</div>}

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

      {loading && media.length === 0 ? (
        <div className={classes.loading}>Loading media...</div>
      ) : media.length === 0 ? (
        <div className={classes.empty}>
          No media yet. Upload an image or click "Sync Existing" to import existing images.
        </div>
      ) : (
        <div className={classes.content}>
          <div className={classes.grid}>
            {media.map((m) => (
              <div
                key={m._id}
                className={`${classes.thumbnail} ${selectedId === m._id ? classes.thumbnailSelected : ''}`}
                onClick={() => handleSelect(m)}
              >
                <ResponsiveImage
                  coverImage={m}
                  alt={m.altText || m.title}
                  className={classes.thumbnailImage}
                  sizes="140px"
                />
              </div>
            ))}
          </div>

          {selectedMedia && (
            <div className={classes.panel}>
              <ResponsiveImage
                coverImage={selectedMedia}
                alt={selectedMedia.altText || selectedMedia.title}
                className={classes.panelImage}
                sizes="300px"
              />

              <div className={classes.panelSection}>
                <label className={classes.panelLabel}>Title</label>
                <input
                  type="text"
                  className={classes.panelInput}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div className={classes.panelSection}>
                <label className={classes.panelLabel}>Alt Text</label>
                <input
                  type="text"
                  className={classes.panelInput}
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Describe the image for accessibility"
                />
              </div>

              <div className={classes.panelSection}>
                <label className={classes.panelLabel}>File Info</label>
                <div className={classes.panelInfo}>
                  <div className={classes.panelInfoItem}>
                    <span>File:</span>
                    <span>{selectedMedia.originalFilename}</span>
                  </div>
                  <div className={classes.panelInfoItem}>
                    <span>Size:</span>
                    <span>{formatFileSize(selectedMedia.fileSize)}</span>
                  </div>
                  <div className={classes.panelInfoItem}>
                    <span>Dimensions:</span>
                    <span>{selectedMedia.dimensions.width} x {selectedMedia.dimensions.height}</span>
                  </div>
                  <div className={classes.panelInfoItem}>
                    <span>Variants:</span>
                    <span>{selectedMedia.widths.length > 0 ? selectedMedia.widths.join(', ') + 'px' : 'None'}</span>
                  </div>
                  <div className={classes.panelInfoItem}>
                    <span>Uploaded:</span>
                    <span>{formatDate(selectedMedia.createdAt)}</span>
                  </div>
                </div>
              </div>

              {selectedMedia.usageRefs.length > 0 && (
                <div className={classes.panelSection}>
                  <label className={classes.panelLabel}>Used By</label>
                  <div className={classes.usageList}>
                    {selectedMedia.usageRefs.map((ref, i) => (
                      <div key={i} className={classes.usageItem}>
                        {ref.entityType} ({ref.field})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={classes.panelActions}>
                <button className={classes.saveBtn} onClick={handleSave}>
                  Save
                </button>
                <button className={classes.deleteBtn} onClick={handleDeleteClick}>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {deleteDialog && (
        <div className={classes.dialog}>
          <div className={classes.dialogContent}>
            <div className={classes.dialogTitle}>Image In Use</div>
            <div className={classes.dialogText}>
              This image is currently used in {deleteDialog.usageRefs?.length} place(s):
            </div>
            {deleteDialog.usageRefs && deleteDialog.usageRefs.length > 0 && (
              <div className={classes.usageList}>
                {deleteDialog.usageRefs.map((ref, i) => (
                  <div key={i} className={classes.usageItem}>
                    {ref.entityType} - {ref.field}
                  </div>
                ))}
              </div>
            )}
            <div className={classes.dialogText} style={{ marginTop: '0.75rem' }}>
              Deleting it will cause broken images. Delete anyway?
            </div>
            <div className={classes.dialogActions}>
              <button
                className={classes.dialogCancelBtn}
                onClick={() => setDeleteDialog(null)}
              >
                Cancel
              </button>
              <button
                className={classes.dialogDeleteBtn}
                onClick={handleForceDelete}
              >
                Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
