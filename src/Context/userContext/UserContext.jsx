import axios from "axios";
import UserContext from "./createContext.js";
import { useEffect, useState } from "react";

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    setIsAuthenticated(!!userId);
    
    // Fetch user data if there's a userId in localStorage
    if (userId) {
      const fetchUser = async () => {
        try {
          const response = await axios.get('/api/auth/me', {
            withCredentials: true
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If authentication fails, clear storage
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("role_name");
            localStorage.removeItem("user_id");
            localStorage.removeItem("university_id");
            localStorage.removeItem("society_id");
            setIsAuthenticated(false);
          }
        }
      };
      
      fetchUser();
    }
  }, []);

  const login = async (cred) => {
    try {
      const response = await axios.post(
        "api/auth/login",
        {
          email: cred.email,
          password: cred.password,
        },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("user_id", response.data.id);
      localStorage.setItem("role_name", response.data.role_name);

      if (response.data.university_id)
        localStorage.setItem("university_id", response.data.university_id);

      if (response.data.society_id)
        localStorage.setItem("society_id", response.data.society_id);

      setIsAuthenticated(true);
      
      // Fetch user data after successful login
      try {
        const userResponse = await axios.get('/api/auth/me', {
          withCredentials: true
        });
        setUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching user data after login:', error);
      }
      
      return response.status;
    } catch (error) {
      return error.response ? error.response.status : 500;
    }
  };

  const signup = async (cred) => {
    try {
      // Create payload with required fields
      const payload = {
        username: cred.username,
        password: cred.password,
        email: cred.email,
      };

      // Only add university_id if student selected a university and it's a non-empty string
      if (
        cred.isStudent &&
        cred.university_id &&
        cred.university_id.trim() !== ""
      ) {
        // Make sure it's a valid number before sending
        const uniId = parseInt(cred.university_id);
        if (!isNaN(uniId)) {
          payload.university_id = uniId;
        }
      }

      const response = await axios.post("api/auth/signup", payload, {
        withCredentials: true,
      });

      return response.status;
    } catch (error) {
      console.error("Signup error:", error);

      // Return a consistent error object
      if (error.response) {
        return {
          error: error.response.data.error || "Signup failed",
          status: error.response.status,
        };
      }
      return {
        error: "Network error or server unavailable",
        status: 500,
      };
    }
  };

  const logOut = async () => {
    try {
      const response = await axios.post(
        "api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("role_name");
      localStorage.removeItem("user_id");
      localStorage.removeItem("university_id");
      localStorage.removeItem("society_id");

      return response.status;
    } catch (error) {
      return error.response ? error.response.status : 500;
    }
  };

  return (
    <UserContext.Provider
      value={{
        login,
        signup,
        logOut,
        isAuthenticated,
        user
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
