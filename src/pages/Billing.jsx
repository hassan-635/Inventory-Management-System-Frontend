import { useState } from 'react';
import { Plus, Trash2, Printer, Search, Receipt, Calculator } from 'lucide-react';
import './Billing.css';

const MOCK_PRODUCTS = [
    { id: 1, name: 'Premium Emulsion Paint', price: 4500 },
    { id: 2, name: 'Weather-Resistant Exterior', price: 6500 },
    { id: 3, name: 'Steel Claw Hammer', price: 1850 },
    { id: 4, name: 'Copper Wire Bundle (50m)', price: 4000 },
];

const Billing = () => {
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [billType, setBillType] = useState('original');
    const [customerName, setCustomerName] = useState('');

    const addToCart = () => {
        if (!selectedProduct) return;

        const product = MOCK_PRODUCTS.find(p => p.id === parseInt(selectedProduct));
        if (product) {
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                setCart(cart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + parseInt(quantity) } : item
                ));
            } else {
                setCart([...cart, { ...product, quantity: parseInt(quantity) }]);
            }
            setSelectedProduct('');
            setQuantity(1);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = billType === 'original' ? subtotal * 0.18 : 0; // 18% tax for original, 0 for dummy
    const total = subtotal + tax;

    return (
        <div className="billing-container">
            {/* Left Panel: Entry */}
            <div className="billing-entry-panel">
                <div className="panel-header">
                    <h1 className="page-title">Generate Bill</h1>
                    <p className="page-subtitle">Create a new invoice for customer</p>
                </div>

                <div className="form-section glass-panel">
                    <h3 className="section-title">Bill Details</h3>

                    <div className="form-grid">
                        <div className="input-group">
                            <label>Bill Type</label>
                            <select
                                className="input-field minimal-select"
                                value={billType}
                                onChange={(e) => setBillType(e.target.value)}
                            >
                                <option value="original">Original (With Tax)</option>
                                <option value="dummy">Dummy (Estimate/No Tax)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Customer Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter customer name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="divider"></div>

                    <h3 className="section-title">Add Items</h3>
                    <div className="add-item-row">
                        <div className="input-group flex-2">
                            <select
                                className="input-field minimal-select"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                            >
                                <option value="">Select a product...</option>
                                {MOCK_PRODUCTS.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - Rs. {p.price}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group flex-1">
                            <input
                                type="number"
                                className="input-field"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary add-btn" onClick={addToCart}>
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="cart-section glass-panel">
                    <h3 className="section-title flex items-center justify-between">
                        <span>Current Items</span>
                        <span className="item-count">{cart.length} items</span>
                    </h3>

                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <Receipt size={32} className="text-muted mb-2" />
                                <p>No items added yet</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="cart-item animate-fade-in">
                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <p>Rs. {item.price} x {item.quantity}</p>
                                    </div>
                                    <div className="item-total">
                                        <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                        <button className="icon-btn-danger" onClick={() => removeFromCart(item.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Receipt Preview */}
            <div className="billing-preview-panel">
                <div className="receipt glass-panel">
                    <div className="receipt-header">
                        <div className="receipt-logo">
                            <Calculator size={24} />
                        </div>
                        <h2>INVENTORY PRO</h2>
                        <p className="receipt-address">123 Market Street, Business District</p>
                        <p className="receipt-contact">Ph: +92 300 0000000</p>

                        <div className="receipt-type-badge">
                            {billType === 'dummy' ? 'ESTIMATE / DUMMY BILL' : 'TAX INVOICE'}
                        </div>
                    </div>

                    <div className="receipt-meta">
                        <div className="meta-row">
                            <span>Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="meta-row">
                            <span>Customer:</span>
                            <span>{customerName || 'Cash Customer'}</span>
                        </div>
                        <div className="meta-row">
                            <span>Invoice #:</span>
                            <span>INV-{Math.floor(100000 + Math.random() * 900000)}</span>
                        </div>
                    </div>

                    <div className="receipt-items-table">
                        <div className="receipt-table-header">
                            <span>Item</span>
                            <span>Qty</span>
                            <span>Total</span>
                        </div>
                        {cart.map(item => (
                            <div key={item.id} className="receipt-table-row">
                                <span className="item-name-col">{item.name}</span>
                                <span>{item.quantity}</span>
                                <span>{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="receipt-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>Rs. {subtotal.toLocaleString()}</span>
                        </div>
                        {billType === 'original' && (
                            <div className="summary-row">
                                <span>Tax (18%)</span>
                                <span>Rs. {tax.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="summary-row total">
                            <span>Total Amount</span>
                            <span>Rs. {total.toLocaleString()}</span>
                        </div>
                    </div>

                    <button className="btn-print mt-auto">
                        <Printer size={18} />
                        <span>Print Receipt</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
