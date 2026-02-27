import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="layout-container">
            {/* Sidebar / Navbar placeholder */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
