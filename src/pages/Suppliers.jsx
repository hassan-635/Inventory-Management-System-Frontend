import { useState } from 'react';
import { Search, Plus, MoreVertical, Truck } from 'lucide-react';
import './Suppliers.css';

const MOCK_SUPPLIERS = [
    { id: 1, name: 'National Paints Co.', contact: '+92 300 1112233', lastSupply: 'Oct 22, 2023', pending: 150000, status: 'Overdue' },
    { id: 2, name: 'Lahore Steel Mills', contact: '+92 321 4445566', lastSupply: 'Oct 20, 2023', pending: 50000, status: 'Pending' },
    { id: 3, name: 'Pak Cables Ltd.', contact: '+92 333 7778899', lastSupply: 'Oct 15, 2023', pending: 0, status: 'Clear' },
    { id: 4, name: 'Bright Hardware Distributors', contact: '+92 311 9990011', lastSupply: 'Oct 25, 2023', pending: 25000, status: 'Pending' },
];

const Suppliers = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSuppliers = MOCK_SUPPLIERS.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPending = filteredSuppliers.reduce((sum, s) => sum + s.pending, 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Suppliers Directory</h1>
                    <p className="page-subtitle">Manage distributors and pending payables</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    <span>Add Supplier</span>
                </button>
            </div>

            <div className="stats-row">
                <div className="stat-card glass-panel flex-1">
                    <div className="stat-icon-wrapper danger-glow">
                        <Truck size={24} className="stat-icon-danger" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Pending Payables</p>
                        <h2 className="stat-value text-danger">Rs. {totalPending.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            <div className="table-container glass-panel">
                <div className="table-header-controls">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Supplier Name</th>
                                <th>Contact</th>
                                <th>Last Supply Date</th>
                                <th>Pending Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(supplier => (
                                <tr key={supplier.id} className="animate-fade-in">
                                    <td>
                                        <div className="supplier-name-cell">
                                            <div className="supplier-avatar">
                                                <Truck size={18} />
                                            </div>
                                            <span className="font-medium text-primary">{supplier.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="text-secondary">{supplier.contact}</span></td>
                                    <td><span className="text-secondary">{supplier.lastSupply}</span></td>
                                    <td>
                                        <span className="font-bold text-gradient-accent">
                                            Rs. {supplier.pending.toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${supplier.status.toLowerCase()}`}>
                                            {supplier.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="icon-btn-small">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredSuppliers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-muted">
                                        No suppliers found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Suppliers;
