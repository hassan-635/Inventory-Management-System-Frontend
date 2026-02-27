import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, MoreVertical, Truck, Edit, Trash2, X } from 'lucide-react';
import './Suppliers.css';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
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
        company_name: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('inventory_token');
            const response = await axios.get('/api/suppliers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuppliers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            setError('Failed to load suppliers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            const token = localStorage.getItem('inventory_token');
            await axios.delete(`/api/suppliers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuppliers(suppliers.filter(s => s.id !== id));
        } catch (err) {
            console.error('Error deleting supplier:', err);
            alert('Failed to delete supplier.');
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ id: null, name: '', phone: '', company_name: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (supplier) => {
        setModalMode('edit');
        setFormData({
            id: supplier.id,
            name: supplier.name,
            phone: supplier.phone || '',
            company_name: supplier.company_name || ''
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
                company_name: formData.company_name
            };

            if (modalMode === 'add') {
                await axios.post('/api/suppliers', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`/api/suppliers/${formData.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchSuppliers();
            closeModal();
        } catch (err) {
            console.error('Error saving supplier:', err);
            alert(err.response?.data?.error || 'Failed to save supplier.');
        }
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.company_name && supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Placeholder pending: requires aggregate of supplier_transactions not currently configured on base GET /suppliers
    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Suppliers Directory</h1>
                    <p className="page-subtitle">Manage distributors and pending payables</p>
                </div>
                <button className="btn-primary flex items-center gap-2" onClick={openAddModal}>
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
                        <h2 className="stat-value text-danger">Rs. 0</h2>
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
                            placeholder="Search suppliers..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state text-center py-8">Loading suppliers...</div>
                    ) : (
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Supplier / Company</th>
                                    <th>Contact</th>
                                    <th>Created At</th>
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
                                                <div>
                                                    <div className="font-medium text-primary">{supplier.name}</div>
                                                    {supplier.company_name && (
                                                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                                                            {supplier.company_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="text-secondary">{supplier.phone || '-'}</span></td>
                                        <td><span className="text-secondary">{new Date(supplier.created_at).toLocaleDateString()}</span></td>
                                        <td>
                                            <div className="action-buttons flex gap-2">
                                                <button
                                                    className="icon-btn-small text-accent"
                                                    title="Edit"
                                                    onClick={() => openEditModal(supplier)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn-small text-danger"
                                                    title="Delete"
                                                    onClick={() => handleDelete(supplier.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredSuppliers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-muted">
                                            No suppliers found matching your search.
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
                            <h2>{modalMode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}</h2>
                            <button className="icon-btn-small" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="modal-body">
                            <div className="input-group">
                                <label>Contact Person Name</label>
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
                                <label>Company Name (Optional)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleFormChange}
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
                                    required
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'add' ? 'Save Supplier' : 'Update Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
