import React, { useEffect, useState } from 'react';
import { handleGetCurrentUserInfo, handleUpdateUser } from '../hooks/handleUsers';
import type { IUser } from '../models/usersInterface';
import { useAsync } from '../hooks/useAsync'; 
import classes from './Pages.module.css';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    picture: string;
    pictureFile?: File;
  }>({
    firstName: '',
    lastName: '',
    picture: '',
  });

  const { execute: updateUser, loading, error, data } = useAsync(handleUpdateUser);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await handleGetCurrentUserInfo();
        console.log('Fetched user data:', data);
        if (data) {
          setUser(data);
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            picture: data.picture,
          });
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    let pictureData = formData.picture;

    if (formData.pictureFile) {
      pictureData = await convertToBase64(formData.pictureFile);
    }

    try {
      const updatedUser = await updateUser({
        ...formData,
        picture: pictureData,
      });

      setUser(updatedUser);
      setEditing(false);
    } catch (err) {
      console.error('Error updating user profile:', err);
    }
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className={classes.profileContainer}>
      <h2 className={classes.profileTitle}>Profile Page</h2>

      <img
        src={formData.picture}
        alt="Profile"
        className={classes.profileImage}
      />

      {editing ? (
        <>
          <div className={classes.profileField}>
            <label className={classes.profileLabel}>First Name:</label>
            <input
              className={classes.profileInput}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div className={classes.profileField}>
            <label className={classes.profileLabel}>Last Name:</label>
            <input
              className={classes.profileInput}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className={classes.profileField}>
            <label className={classes.profileLabel}>Profile Picture URL:</label>
            <input
              className={classes.profileInput}
              type="text"
              value={formData.picture}
              onChange={(e) => setFormData({ ...formData, picture: e.target.value, pictureFile: undefined })}
              placeholder="Enter image URL"
            />
          </div>

          <div className={classes.profileField}>
            <label className={classes.profileLabel}>Or Upload Picture:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData((prev) => ({
                    ...prev,
                    pictureFile: file,
                    picture: URL.createObjectURL(file), // show preview
                  }));
                }
              }}
            />
          </div>

          {error && <p style={{ color: 'red' }}>Error: {error.toString()}</p>}

          <div className={classes.profileButtons}>
            <button className={classes.profileButton} onClick={handleUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button className={`${classes.profileButton} ${classes.profileCancelButton}`} onClick={() => setEditing(false)} disabled={loading}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p><strong>First Name:</strong> {user.firstName}</p>
          <p><strong>Last Name:</strong> {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <button className={classes.profileButton} onClick={() => setEditing(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );
};
