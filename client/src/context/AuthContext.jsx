import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [captionFlowUser, setUser] = useState(null);
    const [captionFlowToken, setToken] = useState(
        localStorage.getItem("captionFlowToken") ||
        sessionStorage.getItem("captionFlowToken") ||
        null,
    );

    useEffect(() => {
        const storedUser =
            localStorage.getItem("captionFlowUser") ||
            sessionStorage.getItem("captionFlowUser");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData, jwt, rememberMe = false) => {
        const storage = rememberMe ? localStorage : sessionStorage;

        setUser(userData);
        setToken(jwt);

        storage.setItem("captionFlowUser", JSON.stringify(userData));
        storage.setItem("captionFlowToken", jwt);
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("captionFlowUser");
        localStorage.removeItem("captionFlowToken");
        sessionStorage.removeItem("captionFlowUser");
        sessionStorage.removeItem("captionFlowToken");
    };

    useEffect(() => {
        const handleExpired = () => {
            logout();
            window.location.href = "/login";
        };
        window.addEventListener("auth:expired", handleExpired);
        return () => window.removeEventListener("auth:expired", handleExpired);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user: captionFlowUser,
                token: captionFlowToken,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
