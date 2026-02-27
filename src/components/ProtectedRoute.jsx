import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('inventory_token');

    // If there's no token, redirect to the login page immediately
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If token exists, render the child routes (e.g., Layout and its sub-pages)
    return <Outlet />;
};

export default ProtectedRoute;
