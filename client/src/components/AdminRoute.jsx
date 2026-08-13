import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AdminRoute — UI-layer route guard.
 *
 * Checks two things:
 *  1. Is the user authenticated? (token present)
 *  2. Does the user have the "admin" role?
 *
 * This is NOT a security mechanism — the backend enforces real auth.
 * This guard only controls what the frontend renders.
 *
 * Supports future roles: pass `allowedRoles` prop to extend beyond "admin".
 */
export default function AdminRoute({ children, allowedRoles = ["admin"] }) {
    const { token, user } = useAuth();

    // Step 1: Must be authenticated
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Step 2: Must have an allowed role
    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
