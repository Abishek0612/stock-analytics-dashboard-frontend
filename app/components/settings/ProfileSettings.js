"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  uploadProfilePhoto,
  removeProfilePhoto as apiRemoveProfilePhoto,
  deleteProfilePhoto,
  storePhotoLocally,
  notifyPhotoChange,
} from "./ProfilePhotoService";
import {
  FiUser,
  FiMail,
  FiSave,
  FiLoader,
  FiCheck,
  FiCamera,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
});

export default function ProfileSettings({ setError }) {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user) {
      const savedPhoto = localStorage.getItem(`profilePhoto_${user._id}`);
      if (savedPhoto) {
        setProfileImage(savedPhoto);
        setUser((prev) => ({
          ...prev,
          profilePhoto: savedPhoto,
        }));
      }
    }
  }, [user, setUser]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (localError && setError) {
      setError(localError);
    }
  }, [localError, setError]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSuccess(false);
    setLocalError("");
    if (setError) setError("");

    try {
      const response = await axios.patch(`${API_URL}/users/profile`, {
        name: data.name,
        email: data.email,
      });

      if (response.data.status === "success") {
        setUser({
          ...user,
          ...response.data.data.user,
          profilePhoto: profileImage,
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setLocalError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setLocalError("Please select an image file (JPEG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Image size should be less than 5MB");
      return;
    }

    setIsPhotoLoading(true);
    setLocalError("");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const photoData = e.target.result;
      setProfileImage(photoData);

      try {
        if (user) {
          localStorage.setItem(`profilePhoto_${user._id}`, photoData);
        }

        await axios.patch(`${API_URL}/users/profile-photo`, {
          photoData,
        });

        setUser({
          ...user,
          profilePhoto: photoData,
        });

        window.dispatchEvent(
          new StorageEvent("storage", {
            key: `profilePhoto_${user._id}`,
            newValue: photoData,
          })
        );

        setIsPhotoLoading(false);
      } catch (err) {
        console.error("Error saving profile photo:", err);
        setLocalError("Failed to update profile photo");
        setIsPhotoLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };
  const removeProfilePhoto = async () => {
    setIsPhotoLoading(true);
    setLocalError("");
    if (setError) setError("");

    try {
      setProfileImage("");

      storePhotoLocally(user?._id, null);

      const result = await apiRemoveProfilePhoto();

      if (!result.success) {
        console.warn("All API formats failed, trying delete method");

        const deleteResult = await deleteProfilePhoto(user?._id);

        if (!deleteResult.success) {
          console.warn("DELETE method also failed. Using workaround...");

          try {
            localStorage.setItem(`removePhoto_flag_${user?._id}`, "true");
          } catch (err) {
            console.error("Could not set localStorage flag:", err);
          }
        }
      }

      setUser({
        ...user,
        profilePhoto: "",
      });

      notifyPhotoChange(user?._id, null);

      setIsPhotoLoading(false);
    } catch (err) {
      console.error("Error in photo removal process:", err);
      setIsPhotoLoading(false);

      setUser({
        ...user,
        profilePhoto: "",
      });

      localStorage.setItem(`removePhoto_flag_${user?._id}`, "true");
    }
  };
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

      {localError && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {localError}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-start">
          <div className="relative mb-6 sm:mb-0 sm:mr-8">
            <div
              className={`h-32 w-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${
                isPhotoLoading ? "opacity-50" : ""
              }`}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <FiUser className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              )}
              {isPhotoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <FiLoader className="animate-spin h-8 w-8 text-white" />
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center space-x-2">
              <button
                type="button"
                onClick={handlePhotoClick}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                disabled={isPhotoLoading}
              >
                <FiCamera className="mr-2 h-4 w-4" />
                {profileImage ? "Change" : "Upload"}
              </button>

              {profileImage && (
                <button
                  type="button"
                  onClick={removeProfilePhoto}
                  disabled={isPhotoLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none disabled:opacity-50"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Remove
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="w-full sm:flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Update your personal information and email address.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    {...register("email")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : success ? (
                    <>
                      <FiCheck className="-ml-1 mr-2 h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <FiSave className="-ml-1 mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
