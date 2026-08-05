import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute({ children }) {
    const { token } = useAuth();

    return token ? (
        <Navigate to="/dashboard" replace />
    ) : (
        children
    );
}