import { useUserProfile } from '../../hooks/useUserProfile';
import classes from './UserProfile.module.css';

export const UserProfile = () => {
  const { user, editing, setEditing, formData, setFormData, loading, error, handleUpdate } = useUserProfile();

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>Profile Page</h2>

      <img src={formData.picture} alt="Profile" className={classes.image} />

      {editing ? (
        <>
          <div className={classes.field}>
            <label className={classes.label}>First Name:</label>
            <input
              className={classes.input}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div className={classes.field}>
            <label className={classes.label}>Last Name:</label>
            <input
              className={classes.input}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className={classes.field}>
            <label className={classes.label}>Profile Picture URL:</label>
            <input
              className={classes.input}
              type="text"
              value={formData.picture}
              onChange={(e) => setFormData({ ...formData, picture: e.target.value, pictureFile: undefined })}
              placeholder="Enter image URL"
            />
          </div>
          <div className={classes.field}>
            <label className={classes.label}>Or Upload Picture:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData((prev) => ({
                    ...prev,
                    pictureFile: file,
                    picture: URL.createObjectURL(file),
                  }));
                }
              }}
            />
          </div>

          {error && <p className={classes.errorText}>Error: {error.toString()}</p>}

          <div className={classes.buttons}>
            <button className={classes.button} onClick={handleUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              className={`${classes.button} ${classes.cancelButton}`}
              onClick={() => setEditing(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p><strong>First Name:</strong> {user.firstName}</p>
          <p><strong>Last Name:</strong> {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button className={classes.button} onClick={() => setEditing(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );
};
