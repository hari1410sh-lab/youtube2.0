import { createContext, useContext, useEffect, useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";

import axiosInstance from "./axiosinstance";
import { auth, provider } from "./firebase";

const userContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

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

  const saveUserWithBackendFallback = async (payload) => {
    try {
      const response = await axiosInstance.post("/auth/login", payload);
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
    <userContext.Provider value={{ user, login, logout, handlegoogleSignIn }}>
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
