import { createContext, useContext, useEffect, useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";

import axiosInstance from "./axiosinstance";
import { auth, provider } from "./firebase";

const userContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (user?.theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [user?.theme]);

  const login = (userdata) => {
    setUser(userdata);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userdata));
    }
  };

  const logout = async () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
    await signOut(auth);
  };

  const toggleTheme = async () => {
    if (!user?._id) return;
    const newTheme = user.theme === "light" ? "dark" : "light";
    try {
      const response = await axiosInstance.patch(`/user/theme/${user._id}`, {
        theme: newTheme,
      });
      login(response.data.result);
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  const saveUserWithBackendFallback = async (payload) => {
    try {
      const response = await axiosInstance.post("/user/login", payload);
      login(response.data.result);
    } catch (error) {
      console.error(error);
      login(payload);
    }
  };

  const handlegoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      await saveUserWithBackendFallback({
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseuser) => {
      if (!firebaseuser) {
        return;
      }

      await saveUserWithBackendFallback({
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL,
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <userContext.Provider value={{ user, login, logout, handlegoogleSignIn, toggleTheme }}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(userContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};
