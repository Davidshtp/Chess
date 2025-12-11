import api from './api';

/**
 * Sube la foto de perfil del usuario
 */
export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/fotos/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Elimina la foto de perfil del usuario
 */
export const deleteProfilePicture = async () => {
  try {
    const response = await api.delete('/fotos/profile-picture');
    return response.data;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};

export default {
  uploadProfilePicture,
  deleteProfilePicture,
};
