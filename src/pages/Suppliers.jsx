import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, MoreVertical, Truck, Edit, Trash2, X } from 'lucide-react';
import './Suppliers.css';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [productsList, setProductsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalPayables, setTotalPayables] = useState(0);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        phone: '',
        company_name: '',
        product_id: '',
        quantity: '',
        total_amount: '',
        paid_amount: '',
        purchase_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchSuppliers();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('inventory_token');
            const response = await axios.get('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProductsList(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('inventory_token');
            const response = await axios.get('/api/suppliers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data;
            setSuppliers(data);

            // Calculate total payables
            let payables = 0;
            data.forEach(supplier => {
                if (supplier.supplier_transactions && supplier.supplier_transactions.length > 0) {
                    supplier.supplier_transactions.forEach(txn => {
                        payables += (Number(txn.total_amount || 0) - Number(txn.paid_amount || 0));
                    });
                }
            });
            setTotalPayables(payables);

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
        setFormData({
            id: null,
            name: '',
            phone: '',
            company_name: '',
            product_id: '',
            quantity: '',
            total_amount: '',
            paid_amount: '0',
            purchase_date: new Date().toISOString().split('T')[0]
        });
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
                const supplierRes = await axios.post('/api/suppliers', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const newSupplier = supplierRes.data.data?.[0];

                if (newSupplier && formData.product_id && Number(formData.quantity) > 0) {
                    const purchasePayload = {
                        supplier_id: newSupplier.id,
                        product_id: formData.product_id,
                        quantity: Number(formData.quantity),
                        total_amount: Number(formData.total_amount),
                        paid_amount: Number(formData.paid_amount || 0),
                        purchase_date: formData.purchase_date
                    };

                    await axios.post('/api/purchases', purchasePayload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
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

    const flattenedData = [];
    filteredSuppliers.forEach(supplier => {
        if (supplier.supplier_transactions && supplier.supplier_transactions.length > 0) {
            supplier.supplier_transactions.forEach(txn => {
                flattenedData.push({ ...supplier, txn });
            });
        } else {
            flattenedData.push({ ...supplier, txn: null });
        }
    });
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
                        <h2 className="stat-value text-danger">Rs. {totalPayables.toLocaleString()}</h2>
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
                                    <th>ID</th>
                                    <th>Supplier / Company</th>
                                    <th>Contact</th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Total Amt</th>
                                    <th>Paid Amt</th>
                                    <th>Remaining (Payable)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flattenedData.map((row, idx) => {
                                    const { txn } = row;
                                    const remainingPayable = txn ? (Number(txn.total_amount || 0) - Number(txn.paid_amount || 0)) : 0;
                                    return (
                                        <tr key={txn ? `txn-${txn.id}` : `supplier-${row.id}`} className="animate-fade-in">
                                            <td>{row.id}</td>
                                            <td>
                                                <div className="supplier-name-cell">
                                                    <div className="supplier-avatar">
                                                        <Truck size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-primary">{row.name}</div>
                                                        {row.company_name && (
                                                            <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                                                                {row.company_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="text-secondary">{row.phone || '-'}</span></td>

                                            {txn ? (
                                                <>
                                                    <td><span className="font-medium">{txn.products?.name || `Product ID: ${txn.product_id}`}</span></td>
                                                    <td>{txn.quantity}</td>
                                                    <td>Rs. {txn.total_amount}</td>
                                                    <td>Rs. {txn.paid_amount}</td>
                                                    <td>
                                                        <span className={`qty-badge ${remainingPayable > 0 ? 'low-stock text-danger' : 'in-stock'}`}>
                                                            Rs. {remainingPayable}
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <td colSpan="5" className="text-secondary text-center italic">No transactions</td>
                                            )}

                                            <td>
                                                <div className="action-buttons flex gap-2">
                                                    <button
                                                        className="icon-btn-small text-accent"
                                                        title="Edit Supplier"
                                                        onClick={() => openEditModal(row)}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-btn-small text-danger"
                                                        title="Delete Supplier"
                                                        onClick={() => handleDelete(row.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {flattenedData.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="text-center py-8 text-muted">
                                            No suppliers or payable records found matching your search.
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

                            {/* Only show transaction fields for Add Mode */}
                            {modalMode === 'add' && (
                                <>
                                    <hr className="my-4 border-gray-700" />
                                    <h3 className="text-lg font-medium text-gray-200 mb-4">Purchase / Payables Details (Optional)</h3>

                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label>Select Product</label>
                                            <select
                                                className="input-field"
                                                name="product_id"
                                                value={formData.product_id}
                                                onChange={handleFormChange}
                                            >
                                                <option value="">-- Choose Product --</option>
                                                {productsList.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>Purchase Quantity</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleFormChange}
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label>Total Amount (Rs)</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                name="total_amount"
                                                value={formData.total_amount}
                                                onChange={handleFormChange}
                                                min="0"
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Paid Amount (Rs)</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                name="paid_amount"
                                                value={formData.paid_amount}
                                                onChange={handleFormChange}
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label>Purchase Date</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            name="purchase_date"
                                            value={formData.purchase_date}
                                            onChange={handleFormChange}
                                        />
                                    </div>
                                </>
                            )}

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
