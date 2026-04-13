import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../library/api.js";
import toast from "react-hot-toast";

const AuthContext = createContext();

const getApiErrorMessage = (error, fallback) => {
    const details = error.response?.data?.details;
    if (Array.isArray(details) && details.length > 0) {
        return details[0]?.message || fallback;
    }

    return error.response?.data?.message || fallback;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const { data } = await API.get("/getuser");
            setUser(data);
            return data;
        } catch (error) {
            setUser(null);
            throw error;
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await refreshUser();
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const signup = useCallback(async (name, email, password) => {

        try {
        await API.post("/signup", { name, email, password });
        await refreshUser();
        toast.success("Signup successful! Welcome");
        } catch (error) {
        toast.error(getApiErrorMessage(error, "Signup failed!"));
        throw new Error("Invalid Credentials");
        }

    }, [refreshUser]);

    const login = useCallback(async (email, password) => {
        try {
            await API.post("/login", { email, password });
            await refreshUser();
  
            toast.success("Login successful!");
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Invalid credentials!!!"));
            throw new Error("Invalid Credentials");
        }
    }, [refreshUser]);

    const logout = useCallback(async () => {

        try {
            await API.post("/logout");
            setUser(null);
            toast.success("Logged out successfully!");
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to logout!"));
            throw new Error("Failed to logout!");
        }
    }, []);

    return (
        <AuthContext.Provider value={{ loading, signup, login, user, logout, setUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
