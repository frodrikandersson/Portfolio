import { useEffect, useState } from 'react';
import { privateGetCurrentUser, privateUpdateUser, privateUploadAvatar } from '../services/usersService';
import type { IUser } from '../models/usersInterface';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  pictureFile?: File;
}

export const useUserProfile = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await privateGetCurrentUser();
        if (data) {
          setUser(data);
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
          });
        }
      } catch {
        // Failed to load profile
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await privateUpdateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (formData.pictureFile) {
        const { picture } = await privateUploadAvatar(formData.pictureFile);
        updatedUser.picture = picture;
      }

      setUser(updatedUser);
      setFormData({ firstName: updatedUser.firstName, lastName: updatedUser.lastName });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return { user, editing, setEditing, formData, setFormData, loading, error, handleUpdate };
};
