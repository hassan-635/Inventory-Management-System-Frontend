import { useState } from 'react';
import { Search, Plus, MoreVertical, CreditCard } from 'lucide-react';
import './Buyers.css';

const MOCK_BUYERS = [
    { id: 1, name: 'Jinhoo Hardware', contact: '+92 300 1234567', lastPurchase: 'Oct 12, 2023', udhaar: 45000, status: 'Pending' },
    { id: 2, name: 'Ahmed Contractors', contact: '+92 321 9876543', lastPurchase: 'Oct 15, 2023', udhaar: 120000, status: 'High Alert' },
    { id: 3, name: 'Siddiqui Builders', contact: '+92 333 4567890', lastPurchase: 'Oct 10, 2023', udhaar: 0, status: 'Clear' },
    { id: 4, name: 'Al-Madina Traders', contact: '+92 311 2223344', lastPurchase: 'Oct 18, 2023', udhaar: 15500, status: 'Pending' },
    { id: 5, name: 'Rahim Electronics', contact: '+92 300 5556677', lastPurchase: 'Oct 20, 2023', udhaar: 89000, status: 'Warning' },
];

const Buyers = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBuyers = MOCK_BUYERS.filter(buyer =>
        buyer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalUdhaar = filteredBuyers.reduce((sum, buyer) => sum + buyer.udhaar, 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Buyers Directory</h1>
                    <p className="page-subtitle">Track credit sales (Udhaar) and collections</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    <span>Add Buyer</span>
                </button>
            </div>

            <div className="stats-row">
                <div className="stat-card glass-panel flex-1">
                    <div className="stat-icon-wrapper">
                        <CreditCard size={24} className="stat-icon" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Outstanding (Udhaar)</p>
                        <h2 className="stat-value">Rs. {totalUdhaar.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            <div className="table-container glass-panel">
                <div className="table-header-controls">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search buyers..."
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
                                <th>Buyer Name</th>
                                <th>Contact</th>
                                <th>Last Purchase</th>
                                <th>Outstanding (Udhaar)</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBuyers.map(buyer => (
                                <tr key={buyer.id} className="animate-fade-in">
                                    <td>
                                        <div className="buyer-name-cell">
                                            <div className="buyer-avatar">
                                                {buyer.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-primary">{buyer.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="text-secondary">{buyer.contact}</span></td>
                                    <td><span className="text-secondary">{buyer.lastPurchase}</span></td>
                                    <td>
                                        <span className="font-bold text-gradient-accent">
                                            Rs. {buyer.udhaar.toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${buyer.status.replace(' ', '-').toLowerCase()}`}>
                                            {buyer.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="icon-btn-small">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredBuyers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-muted">
                                        No buyers found matching your search.
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

export default Buyers;
