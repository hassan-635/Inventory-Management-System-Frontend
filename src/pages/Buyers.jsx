import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, MoreVertical, CreditCard, Edit, Trash2, X } from 'lucide-react';
import './Buyers.css';

const Buyers = () => {
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchBuyers();
    }, []);

    const fetchBuyers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('inventory_token');
            const response = await axios.get('/api/buyers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBuyers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching buyers:', err);
            setError('Failed to load buyers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this buyer?')) return;
        try {
            const token = localStorage.getItem('inventory_token');
            await axios.delete(`/api/buyers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBuyers(buyers.filter(b => b.id !== id));
        } catch (err) {
            console.error('Error deleting buyer:', err);
            alert('Failed to delete buyer.');
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ id: null, name: '', phone: '', address: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (buyer) => {
        setModalMode('edit');
        setFormData({
            id: buyer.id,
            name: buyer.name,
            phone: buyer.phone || '',
            address: buyer.address || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('inventory_token');
            const payload = {
                name: formData.name,
                phone: formData.phone,
                address: formData.address
            };

            if (modalMode === 'add') {
                await axios.post('/api/buyers', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`/api/buyers/${formData.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchBuyers();
            closeModal();
        } catch (err) {
            console.error('Error saving buyer:', err);
            alert(err.response?.data?.error || 'Failed to save buyer.');
        }
    };

    const filteredBuyers = buyers.filter(buyer =>
        buyer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Note: Udhaar/Outstanding logic is disabled as the backend schema uses `buyer_transactions` for math, 
    // requiring join or aggregate not currently fetched by `/api/buyers`. UI placeholder maintained.

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Buyers Directory</h1>
                    <p className="page-subtitle">Track credit sales (Udhaar) and collections</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openAddModal}>
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
                        <h2 className="stat-value">Rs. 0</h2>
                    </div>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

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
                    {loading ? (
                        <div className="loading-state text-center py-8">Loading buyers...</div>
                    ) : (
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Buyer Name</th>
                                    <th>Contact</th>
                                    <th>Address</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBuyers.map(buyer => (
                                    <tr key={buyer.id} className="animate-fade-in">
                                        <td>
                                            <div className="buyer-name-cell">
                                                <div className="buyer-avatar">
                                                    {buyer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-primary">{buyer.name}</span>
                                            </div>
                                        </td>
                                        <td><span className="text-secondary">{buyer.phone || '-'}</span></td>
                                        <td><span className="text-secondary">{buyer.address || '-'}</span></td>
                                        <td><span className="text-secondary">{new Date(buyer.created_at).toLocaleDateString()}</span></td>
                                        <td>
                                            <div className="action-buttons flex gap-2">
                                                <button
                                                    className="icon-btn-small text-accent"
                                                    title="Edit"
                                                    onClick={() => openEditModal(buyer)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn-small text-danger"
                                                    title="Delete"
                                                    onClick={() => handleDelete(buyer.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredBuyers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-muted">
                                            No buyers found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal for Add / Edit */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel animate-fade-in">
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Add New Buyer' : 'Edit Buyer'}</h2>
                            <button className="icon-btn-small" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="modal-body">
                            <div className="input-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Phone / Contact</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'add' ? 'Save Buyer' : 'Update Buyer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Buyers;
