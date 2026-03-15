import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Wallet, Users, Truck, AlertTriangle, Building2, Banknote } from 'lucide-react';
import './MonthlyReport.css'; // Optional generic modern styling

const API_URL = '/api/reports/monthly';

const MonthlyReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    // Separate state for Year and Month
    const currentYearStr = new Date().getFullYear().toString();
    const currentMonthStr = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const [filterYear, setFilterYear] = useState(currentYearStr);
    const [filterMonth, setFilterMonth] = useState(currentMonthStr);

    useEffect(() => {
        fetchReport();
    }, [filterYear, filterMonth]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}?year=${filterYear}&month=${filterMonth}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('inventory_token')}` }
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Failed to fetch monthly report:', error);
            alert('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <RefreshCw className="spinner" size={40} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!reportData) return <div className="page-container">No Data Available</div>;

    const { summary, expense_breakdown, activity_lists, company_wise_summary } = reportData;

    return (
        <div className="report-container page-container fade-in" style={{ paddingBottom: '40px' }}>
            <header className="page-header" style={{ marginBottom: '30px' }}>
                <div>
                    <h1 className="page-title">Monthly Financial Report</h1>
                    <p className="page-subtitle">Complete overview of your business health</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Month selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Month</span>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="input-field minimal-select"
                                style={{ padding: '8px 36px 8px 12px', minWidth: '130px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500' }}
                            >
                                <option value="01">January</option>
                                <option value="02">February</option>
                                <option value="03">March</option>
                                <option value="04">April</option>
                                <option value="05">May</option>
                                <option value="06">June</option>
                                <option value="07">July</option>
                                <option value="08">August</option>
                                <option value="09">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '0.8rem' }}>▼</span>
                        </div>
                    </div>

                    {/* Year selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Year</span>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="input-field minimal-select"
                                style={{ padding: '8px 36px 8px 12px', minWidth: '90px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500' }}
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '0.8rem' }}>▼</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* KEY METRICS */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>

                {/* Net Cash Flow */}
                <div className="stat-card glass-panel flex-row">
                    <div className="stat-icon" style={{ background: summary.cash_flow_profit >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                        {summary.cash_flow_profit >= 0 ? <TrendingUp size={28} color="#22c55e" /> : <TrendingDown size={28} color="#ef4444" />}
                    </div>
                    <div className="stat-content">
                        <p className="stat-title">Cash Flow Profit (In hand)</p>
                        <h3 className="stat-value" style={{ color: summary.cash_flow_profit >= 0 ? '#22c55e' : '#ef4444' }}>
                            Rs. {summary.cash_flow_profit.toLocaleString()}
                        </h3>
                    </div>
                </div>

                {/* Accrual Profit */}
                <div className="stat-card glass-panel flex-row" title="Profit based on invoice totals, regardless of if cash was received">
                    <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
                        <Wallet size={28} color="#38bdf8" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-title">Gross Business Margin</p>
                        <h3 className="stat-value text-primary">Rs. {summary.accrual_profit.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Expenses */}
                <div className="stat-card glass-panel flex-row">
                    <div className="stat-icon" style={{ background: 'rgba(249, 115, 22, 0.1)' }}>
                        <DollarSign size={28} color="#f97316" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-title">Total Shop Expenses</p>
                        <h3 className="stat-value" style={{ color: '#f97316' }}>Rs. {summary.total_expenses.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Risk / Dues */}
                <div className="stat-card glass-panel flex-row">
                    <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                        <AlertTriangle size={28} color="#eab308" />
                    </div>
                    <div className="stat-content">
                        <p className="stat-title">All-Time Buyer Dues pending</p>
                        <h3 className="stat-value" style={{ color: '#eab308' }}>Rs. {summary.total_all_time_dues_from_buyers.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* DETAILED LEDGER SPLIT */}
            <div className="ledger-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>

                {/* INCOME SIDE */}
                <div className="ledger-section">
                    <h2 style={{ fontSize: '1.2rem', color: '#38bdf8', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={20} /> Income & Receivables
                    </h2>

                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Sales Invoices Made:</span>
                            <span style={{ fontWeight: '600' }}>Rs. {summary.total_sales_created_value.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#22c55e' }}>
                            <span>Cash Sales (Fully Paid):</span>
                            <span style={{ fontWeight: '600' }}>Rs. {(summary.total_cash_sales_this_month || 0).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#a78bfa' }}>
                            <span>Udhaar Installments Received:</span>
                            <span style={{ fontWeight: '600' }}>Rs. {summary.total_sales_collected_this_month.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#eab308', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
                            <span>New Credit Given This Month:</span>
                            <span style={{ fontWeight: '600' }}>Rs. {summary.total_credit_given_this_month.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Cash Sales by Salesman */}
                    <div className="glass-panel table-container" style={{ marginBottom: '20px' }}>
                        <h3 style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Banknote size={16} color="#22c55e" /> Cash Collected (by Salesman)
                        </h3>
                        {activity_lists.cash_sales_by_salesman.length === 0 ? (
                            <div className="empty-state" style={{ padding: '2rem' }}>
                                <p>No cash sales recorded this month.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Salesman / User</th>
                                        <th style={{ textAlign: 'center' }}>Bills</th>
                                        <th style={{ textAlign: 'right' }}>Cash Collected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activity_lists.cash_sales_by_salesman.map(s => (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight: '500' }}>{s.salesman_name}</td>
                                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{s.num_cash_bills}</td>
                                            <td style={{ textAlign: 'right', color: '#22c55e', fontWeight: '600' }}>+Rs. {s.total_cash_collected.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {/* Total row */}
                                    <tr style={{ borderTop: '2px solid var(--glass-border)', background: 'rgba(34,197,94,0.05)' }}>
                                        <td style={{ fontWeight: '700', color: '#22c55e' }}>Total</td>
                                        <td style={{ textAlign: 'center', fontWeight: '700' }}>
                                            {activity_lists.cash_sales_by_salesman.reduce((s, r) => s + r.num_cash_bills, 0)}
                                        </td>
                                        <td style={{ textAlign: 'right', color: '#22c55e', fontWeight: '700' }}>
                                            +Rs. {(summary.total_cash_sales_this_month || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Udhaar Installments received */}
                    <div className="glass-panel table-container">
                        <h3 style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} color="#a78bfa" /> Udhaar Installments Received
                        </h3>
                        {activity_lists.udhaar_payments_received.length === 0 ? (
                            <div className="empty-state" style={{ padding: '2rem' }}>
                                <p>No udhaar payments received this month.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th style={{ textAlign: 'right' }}>Received</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activity_lists.udhaar_payments_received.map(b => (
                                        <tr key={b.id}>
                                            <td>{b.name}</td>
                                            <td>{b.phone}</td>
                                            <td style={{ textAlign: 'right', color: '#a78bfa', fontWeight: '500' }}>+Rs. {b.amount_paid_this_month.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* OUTFLOW SIDE */}
                <div className="ledger-section">
                    <h2 style={{ fontSize: '1.2rem', color: '#ef4444', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={20} /> Expenses & Payables
                    </h2>

                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Purchase Invoices Made:</span>
                            <span style={{ fontWeight: '600' }}>Rs. {summary.total_purchases_created_value.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#ef4444' }}>
                            <span>Actual Cash Paid to Suppliers:</span>
                            <span style={{ fontWeight: '600' }}>Rs. {summary.total_purchases_paid_this_month.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f97316', paddingTop: '10px', borderTop: '1px solid var(--glass-border)', marginBottom: '10px' }}>
                            <span>Total Shop Expenses:</span>
                            <span style={{ fontWeight: '600' }}>Rs. {summary.total_expenses.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b5cf6', paddingTop: '10px', borderTop: '1px solid var(--glass-border)' }}>
                            <span>New Credit Taken This Month:</span>
                            <span style={{ fontWeight: '600' }}>Rs. {summary.total_credit_taken_this_month.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Breakdown of Expenses */}
                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem' }}>Expense Breakdown</h3>
                        {Object.keys(expense_breakdown).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No expenses recorded.</p>
                        ) : (
                            Object.entries(expense_breakdown).map(([category, amount]) => (
                                <div key={category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{category}</span>
                                    <span style={{ fontWeight: '500' }}>Rs. {amount.toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Payments to Suppliers */}
                    <div className="glass-panel table-container">
                        <h3 style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', margin: 0, fontSize: '1rem' }}>Payments Made to Suppliers</h3>
                        {activity_lists.payments_made_to_suppliers.length === 0 ? (
                            <div className="empty-state" style={{ padding: '2rem' }}>
                                <p>No payments to suppliers this month.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Supplier Name</th>
                                        <th style={{ textAlign: 'right' }}>Paid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activity_lists.payments_made_to_suppliers.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.name}</td>
                                            <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: '500' }}>-Rs. {s.amount_paid_this_month.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>

            {/* ===== COMPANY-WISE SUMMARY ===== */}
            <div className="glass-panel table-container" style={{ marginTop: '30px' }}>
                <h3 style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', margin: 0, fontSize: '1.1rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building2 size={20} /> Company-Wise Sales Summary (This Month)
                </h3>
                {company_wise_summary.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <p>No sales recorded this month.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th style={{ textAlign: 'center' }}>Transactions</th>
                                <th style={{ textAlign: 'right' }}>Total Sales</th>
                                <th style={{ textAlign: 'right' }}>Collected</th>
                                <th style={{ textAlign: 'right' }}>Outstanding</th>
                            </tr>
                        </thead>
                        <tbody>
                            {company_wise_summary.map((c, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: '600' }}>
                                        {c.company_name === 'Walk-in / No Company'
                                            ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{c.company_name}</span>
                                            : c.company_name
                                        }
                                    </td>
                                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{c.num_transactions}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '500' }}>Rs. {c.total_sales.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right', color: '#22c55e', fontWeight: '500' }}>Rs. {c.total_collected.toLocaleString()}</td>
                                    <td style={{ textAlign: 'right', color: c.total_outstanding > 0 ? '#ef4444' : '#22c55e', fontWeight: '600' }}>
                                        {c.total_outstanding > 0 ? `Rs. ${c.total_outstanding.toLocaleString()}` : '✓ Clear'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {/* Grand total row */}
                        <tfoot>
                            <tr style={{ borderTop: '2px solid var(--glass-border)', background: 'rgba(56,189,248,0.05)', fontWeight: '700' }}>
                                <td>Grand Total</td>
                                <td style={{ textAlign: 'center' }}>
                                    {company_wise_summary.reduce((s, c) => s + c.num_transactions, 0)}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    Rs. {company_wise_summary.reduce((s, c) => s + c.total_sales, 0).toLocaleString()}
                                </td>
                                <td style={{ textAlign: 'right', color: '#22c55e' }}>
                                    Rs. {company_wise_summary.reduce((s, c) => s + c.total_collected, 0).toLocaleString()}
                                </td>
                                <td style={{ textAlign: 'right', color: '#ef4444' }}>
                                    Rs. {company_wise_summary.reduce((s, c) => s + c.total_outstanding, 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>

            {/* Outdated / All Time Dues Section */}
            <div className="glass-panel table-container" style={{ marginTop: '30px' }}>
                <h3 style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', margin: 0, fontSize: '1.1rem', color: '#eab308' }}>
                    ⚠️ Action Required: Buyers with Outstanding Dues (All-Time)
                </h3>
                {activity_lists.all_time_buyers_with_dues.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <p style={{ color: '#22c55e', fontWeight: '500' }}>Great! No pending dues from any buyers.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Buyer Name</th>
                                <th>Phone Number</th>
                                <th style={{ textAlign: 'right' }}>Total Remaining Amount to Recover</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity_lists.all_time_buyers_with_dues.map(b => (
                                <tr key={b.id}>
                                    <td style={{ fontWeight: '500' }}>{b.name}</td>
                                    <td>
                                        <a href={`tel:${b.phone}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>{b.phone}</a>
                                    </td>
                                    <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>Rs. {b.remaining_due.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .flex-row { display: flex; align-items: center; gap: 15px; padding: 20px; border-radius: 16px; }
                .stat-icon { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 12px; }
                .stat-title { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 5px; font-weight: 500;}
                .stat-value { font-size: 1.6rem; margin: 0; font-weight: 700; }
                tfoot td { padding: 12px 16px; font-size: 0.9rem; }
            `}} />
        </div>
    );
};

export default MonthlyReport;
