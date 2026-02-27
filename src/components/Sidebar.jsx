import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, FileText, Package, BarChart3 } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/products', name: 'Products', icon: <Package size={20} /> },
        { path: '/buyers', name: 'Buyers (Udhaar)', icon: <Users size={20} /> },
        { path: '/suppliers', name: 'Suppliers', icon: <Truck size={20} /> },
        { path: '/billing', name: 'Billing', icon: <FileText size={20} /> },
        { path: '/sales', name: 'Recent Sales', icon: <BarChart3 size={20} /> },
    ];

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <div className="logo-icon">
                    <LayoutDashboard size={28} color="var(--accent-primary)" />
                </div>
                <h2 className="logo-text text-gradient">Inventory<br /><span className="text-gradient-accent">Pro</span></h2>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <div className={`nav-icon ${location.pathname.startsWith(item.path) ? 'active-icon' : ''}`}>
                            {item.icon}
                        </div>
                        <span className="nav-text">{item.name}</span>
                        {location.pathname.startsWith(item.path) && <div className="active-indicator" />}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">RM</div>
                    <div className="user-info">
                        <p className="user-name">Salesman</p>
                        <p className="user-role">Retail Mode</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
