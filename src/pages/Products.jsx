import { useState } from 'react';
import { Search, Plus, Package, SlidersHorizontal } from 'lucide-react';
import './Products.css';

const MOCK_PRODUCTS = [
    { id: 1, name: 'Premium Emulsion Paint', category: 'Paint', price: '$45.00', stock: 120, status: 'In Stock' },
    { id: 2, name: 'Weather-Resistant Exterior', category: 'Paint', price: '$65.00', stock: 45, status: 'Low Stock' },
    { id: 3, name: 'Steel Claw Hammer', category: 'Hardware', price: '$18.50', stock: 200, status: 'In Stock' },
    { id: 4, name: 'Assorted Screws Box', category: 'Hardware', price: '$12.00', stock: 500, status: 'In Stock' },
    { id: 5, name: 'Industrial Power Drill', category: 'Hardware', price: '$180.00', stock: 12, status: 'Low Stock' },
    { id: 6, name: 'Copper Wire Bundle (50m)', category: 'Electricity', price: '$40.00', stock: 80, status: 'In Stock' },
    { id: 7, name: 'LED Bulbs (Pack of 4)', category: 'Electricity', price: '$15.00', stock: 300, status: 'In Stock' },
    { id: 8, name: 'Heavy Duty Circuit Breaker', category: 'Electricity', price: '$85.00', stock: 0, status: 'Out of Stock' },
];

const CATEGORIES = ['All', 'Paint', 'Hardware', 'Electricity'];

const Products = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = MOCK_PRODUCTS.filter(product => {
        const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Products Inventory</h1>
                    <p className="page-subtitle">Manage and track your supplies</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="controls-bar glass-panel">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="category-tabs">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            className={`tab-btn ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <button className="icon-btn" title="Filter options">
                    <SlidersHorizontal size={20} />
                </button>
            </div>

            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card glass-panel animate-fade-in">
                        <div className="product-image-placeholder">
                            <Package size={48} className="placeholder-icon" />
                            <span className={`status-badge ${product.status.replace(/ /g, '-').toLowerCase()}`}>
                                {product.status}
                            </span>
                        </div>
                        <div className="product-info">
                            <span className="product-category">{product.category}</span>
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-meta">
                                <span className="product-price">{product.price}</span>
                                <span className="product-stock">Stock: {product.stock}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <Package size={48} className="empty-icon" />
                        <h3>No products found</h3>
                        <p>Try adjusting your search or category filter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
