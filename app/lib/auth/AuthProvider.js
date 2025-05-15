"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/lib/config";
import { setupAxiosInterceptors } from "@/lib/api/axiosConfig";

const setupAxiosDefaults = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setupAxiosInterceptors();

    const token = Cookies.get("token");
    setupAxiosDefaults(token);

    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthStatus = async () => {
    const token = Cookies.get("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.status === "success") {
        const userData = data.data.user;

        if (userData._id) {
          const storedPhoto = localStorage.getItem(
            `profilePhoto_${userData._id}`
          );
          if (storedPhoto) {
            userData.profilePhoto = storedPhoto;
          }

          const removalFlag = localStorage.getItem(
            `removePhoto_flag_${userData._id}`
          );
          if (removalFlag === "true") {
            console.log("Found photo removal flag, applying it");
            userData.profilePhoto = "";

            localStorage.removeItem(`removePhoto_flag_${userData._id}`);

            try {
              await axios.patch(`${API_URL}/users/profile-photo`, {
                photoData: null,
              });
            } catch (err) {
              console.warn(
                "Failed to update profile photo on server during auth check"
              );
            }
          }
        }

        setUser(userData);
      }
    } catch (error) {
      console.error("Auth error:", error.message);
      Cookies.remove("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (pathname !== "/auth/login") {
            logout();
          }
        }

        if (error.response && error.response.status === 429) {
          console.warn("Rate limited! Too many requests.");
          error.isRateLimited = true;
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [pathname]);

  useEffect(() => {
    if (loading) return;

    const publicRoutes = ["/auth/login", "/auth/signup", "/"];

    if (!user && !publicRoutes.includes(pathname)) {
      const timer = setTimeout(() => {
        router.push("/auth/login");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, user, pathname, router]);

  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) => {
      if (!prevUser) return newUserData;

      const updatedUser = { ...prevUser, ...newUserData };

      if (newUserData.profilePhoto !== undefined && prevUser._id) {
        if (newUserData.profilePhoto) {
          localStorage.setItem(
            `profilePhoto_${prevUser._id}`,
            newUserData.profilePhoto
          );
        } else {
          localStorage.removeItem(`profilePhoto_${prevUser._id}`);
          localStorage.setItem(`removePhoto_flag_${prevUser._id}`, "true");
        }

        window.dispatchEvent(
          new StorageEvent("storage", {
            key: `profilePhoto_${prevUser._id}`,
            newValue: newUserData.profilePhoto || null,
          })
        );
      }

      return updatedUser;
    });
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setAuthError(null);

      if (!email || !password) {
        return {
          success: false,
          message: "Please enter both email and password",
        };
      }

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (
        response.data &&
        response.data.status === "success" &&
        response.data.token
      ) {
        const userData = response.data.data.user;

        if (userData._id) {
          const storedPhoto = localStorage.getItem(
            `profilePhoto_${userData._id}`
          );
          if (storedPhoto) {
            userData.profilePhoto = storedPhoto;
          }

          const removalFlag = localStorage.getItem(
            `removePhoto_flag_${userData._id}`
          );
          if (removalFlag === "true") {
            console.log("Found photo removal flag during login, applying it");
            userData.profilePhoto = "";

            localStorage.removeItem(`removePhoto_flag_${userData._id}`);

            try {
              await axios.patch(`${API_URL}/users/profile-photo`, {
                photoData: null,
              });
            } catch (err) {
              console.warn(
                "Failed to update profile photo on server during login"
              );
              try {
                await axios.patch(`${API_URL}/users/profile-photo`, {
                  photoData: "",
                });
              } catch (err2) {
                console.warn(
                  "Second attempt to update profile photo also failed"
                );
              }
            }
          }
        }

        setUser(userData);

        Cookies.remove("token");

        Cookies.set("token", response.data.token, {
          expires: 7,
          path: "/",
          sameSite: "Lax",
        });

        setupAxiosDefaults(response.data.token);

        console.log("Authentication successful: Token stored and headers set");
        return { success: true };
      } else {
        console.error("Auth response missing token:", response.data);
        return {
          success: false,
          message: "Authentication failed. Please try again.",
        };
      }
    } catch (error) {
      if (
        error.isRateLimited ||
        (error.response && error.response.status === 429)
      ) {
        return {
          success: false,
          message:
            "Too many login attempts. Please try again after 15 minutes.",
          isRateLimited: true,
        };
      }

      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    try {
      setAuthError(null);

      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      if (response.data && response.data.status === "success") {
        const userData = response.data.data.user;
        setUser(userData);

        Cookies.set("token", response.data.token, {
          expires: 7,
          sameSite: "strict",
        });
        setupAxiosDefaults(response.data.token);
        return { success: true };
      }

      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    } catch (error) {
      if (
        error.isRateLimited ||
        (error.response && error.response.status === 429)
      ) {
        return {
          success: false,
          message:
            "Too many signup attempts. Please try again after 15 minutes.",
          isRateLimited: true,
        };
      }

      if (
        error.response &&
        error.response.data &&
        error.response.data.status === "success"
      ) {
        const responseData = error.response.data;
        const userData = responseData.data.user;
        setUser(userData);

        Cookies.set("token", responseData.token, {
          expires: 7,
          sameSite: "strict",
        });
        setupAxiosDefaults(responseData.token);
        return { success: true };
      }

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);

    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("profilePhoto_") &&
        !key.includes("removePhoto_flag")
      ) {
        localStorage.removeItem(key);
      }
    });

    Cookies.remove("token");
    delete axios.defaults.headers.common["Authorization"];

    router.push("/auth/login");
  }, [router]);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      signup,
      authError,
      setUser: updateUser,
    }),
    [user, loading, login, logout, signup, authError, updateUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
