import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('id');

    useEffect(() => {
        if (!role || !id) {
            localStorage.removeItem('role');
            localStorage.removeItem('id');
        }
    }, [role, id, location]); // Added all dependencies here

    if (!role || !id) {
        return <Navigate to="/signin" replace state={{ from: location }} />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;