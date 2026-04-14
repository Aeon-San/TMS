import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../library/api.js";
import toast from "react-hot-toast";

const AuthContext = createContext();

const resolveAuthErrorMessage = (error, fallbackMessage) => {
    if (!error.response) {
        return "Unable to reach server. Please check if backend is running.";
    }

    return error.response?.data?.message || fallbackMessage;
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
        const message = resolveAuthErrorMessage(error, "Signup failed!");
        toast.error(message);
        throw new Error(message);
        }

    }, [refreshUser]);

    const login = useCallback(async (email, password) => {
        try {
            await API.post("/login", { email, password });
            await refreshUser();
  
            toast.success("Login successful!");
        } catch (error) {
            const message = resolveAuthErrorMessage(error, "Invalid credentials!!!");
            toast.error(message);
            throw new Error(message);
        }
    }, [refreshUser]);

    const logout = useCallback(async () => {

        try {
            await API.post("/logout");
            setUser(null);
            toast.success("Logged out successfully!");
        } catch (error) {
            toast.error("Failed to logout!");
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
