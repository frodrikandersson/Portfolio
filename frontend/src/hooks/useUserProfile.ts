import { useEffect, useState } from 'react';
import { privateGetCurrentUser, privateUpdateUser } from '../services/usersService';
import { fileToBase64 } from '../utils/fileToBase64';
import { useAsync } from './useAsync';
import type { IUser } from '../models/usersInterface';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  picture: string;
  pictureFile?: File;
}

export const useUserProfile = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    picture: '',
  });

  const { execute: updateUser, loading, error } = useAsync(privateUpdateUser);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await privateGetCurrentUser();
        if (data) {
          setUser(data);
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            picture: data.picture,
          });
        }
      } catch {
        // Failed to load profile
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async () => {
    let pictureData = formData.picture;
    if (formData.pictureFile) {
      pictureData = await fileToBase64(formData.pictureFile);
    }
    try {
      const updatedUser = await updateUser({
        ...formData,
        picture: pictureData,
      });
      setUser(updatedUser);
      setEditing(false);
    } catch {
      // Error displayed via useAsync error state
    }
  };

  return { user, editing, setEditing, formData, setFormData, loading, error, handleUpdate };
};
