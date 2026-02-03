import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);      // 👈 GLOBAL USER DATA
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8080/auth/status",
                    { withCredentials: true }
                );

                setIsAuthenticated(true);
                setUser(res.data.user); // 👈 store user from cookie
            } catch (err) {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                setIsAuthenticated,
                user,
                setUser,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
