import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    const location = useLocation();
    // Assume user is logged in for the Layout wrapper (Login is handled separately in App.jsx)

    return (
        <div className="layout-container animate-fade-in">
            <Sidebar />
            <main className="main-content">
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
