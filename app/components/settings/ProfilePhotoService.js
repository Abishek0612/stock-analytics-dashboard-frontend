import axios from "axios";
import { API_URL } from "@/lib/config";

export const uploadProfilePhoto = async (photoData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/profile-photo`, {
      photoData: photoData,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to upload profile photo:", error);
    return { success: false, error };
  }
};

export const removeProfilePhoto = async () => {
  console.log("Attempting to remove profile photo with various formats");

  const formats = [
    { photoData: "" },
    { photoData: null },
    { photoData: undefined },
    {},
    { profilePhoto: "" },
    { profilePhoto: null },
    { image: null },
    { photo: null },
  ];

  for (const format of formats) {
    try {
      console.log(`Trying format:`, format);
      const response = await axios.patch(
        `${API_URL}/users/profile-photo`,
        format
      );
      if (response.status === 200 || response.data?.status === "success") {
        console.log("Successfully removed photo with format:", format);
        return { success: true, format };
      }
    } catch (error) {
      console.log(`Format ${JSON.stringify(format)} failed:`, error.message);
    }
  }

  console.error("All API formats failed for photo removal");
  return { success: false, error: new Error("All API formats failed") };
};

export const deleteProfilePhoto = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/users/profile-photo`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to delete profile photo:", error);
    return { success: false, error };
  }
};

export const storePhotoLocally = (userId, photoData) => {
  if (!userId) return false;

  try {
    if (photoData) {
      localStorage.setItem(`profilePhoto_${userId}`, photoData);
    } else {
      localStorage.removeItem(`profilePhoto_${userId}`);
    }
    return true;
  } catch (error) {
    console.error("Local storage error:", error);
    return false;
  }
};

export const getLocalPhoto = (userId) => {
  if (!userId) return null;
  try {
    return localStorage.getItem(`profilePhoto_${userId}`);
  } catch (error) {
    console.error("Failed to get local photo:", error);
    return null;
  }
};

export const notifyPhotoChange = (userId, newValue) => {
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `profilePhoto_${userId}`,
        newValue,
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to dispatch event:", error);
    return false;
  }
};
