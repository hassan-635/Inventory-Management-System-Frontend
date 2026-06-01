import { useState } from 'react';
import { GitMerge, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { notifyError, notifySuccess, confirmAction } from '../utils/notifications';

const defaultForm = {
  name: '',
  category: 'Hardware',
  price: '',
  purchase_rate: '',
  quantity_unit: 'Per Piece',
};

export default function ProductMerge() {
  const [loading, setLoading] = useState(false);
  const [pairs, setPairs] = useState([]);
  const [providerStatus, setProviderStatus] = useState('rule_based');
  const [limitWarning, setLimitWarning] = useState('');
  const [selectedPair, setSelectedPair] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const [merging, setMerging] = useState(false);

  const analyzePairs = async () => {
    setLoading(true);
    setLimitWarning('');
    try {
      const { data } = await api.post('/api/products/merge-analyze', { use_groq: true });
      setPairs(Array.isArray(data?.pairs) ? data.pairs : []);
      setProviderStatus(data?.provider_status || 'rule_based');
      if (data?.limit_warning) setLimitWarning(data.limit_warning);
    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to analyze products.');
    } finally {
      setLoading(false);
    }
  };

  const openPair = async (pair) => {
    setSelectedPair(pair);
    setForm((prev) => ({ ...prev, name: pair.left_name || '' }));
    setPreview(null);
    await refreshPreview(pair, {
      ...defaultForm,
      name: pair.left_name || '',
    });
  };

  const refreshPreview = async (pair = selectedPair, formData = form) => {
    if (!pair) return;
    try {
      const { data } = await api.post('/api/products/merge-preview', {
        product_ids: [pair.left_product_id, pair.right_product_id],
        final_values: {
          name: formData.name,
          category: formData.category,
          price: Number(formData.price || 0),
          purchase_rate: formData.purchase_rate === '' ? null : Number(formData.purchase_rate),
          quantity_unit: formData.quantity_unit,
        }
      });
      setPreview(data?.preview || null);
    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to generate preview.');
    }
  };

  const executeMerge = async () => {
    if (!selectedPair) return;
    if (!form.name.trim() || !form.price) {
      notifyError('Final name and sale price are required.');
      return;
    }
    const ok = await confirmAction('Confirm Merge', 'Merge selected pair into one product?');
    if (!ok) return;

    setMerging(true);
    try {
      await api.post('/api/products/merge-execute', {
        product_ids: [selectedPair.left_product_id, selectedPair.right_product_id],
        survivor_product_id: selectedPair.left_product_id,
        provider_used: providerStatus,
        final_values: {
          name: form.name.trim(),
          category: form.category,
          price: Number(form.price),
          purchase_rate: form.purchase_rate === '' ? null : Number(form.purchase_rate),
          quantity_unit: form.quantity_unit || 'Per Piece',
        },
      });
      notifySuccess('Products merged successfully.');
      setSelectedPair(null);
      setPreview(null);
      setForm(defaultForm);
      analyzePairs();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Merge failed.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Product Merge</h1>
          <p className="page-subtitle">Analyze similar products then merge pair-to-one safely.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={analyzePairs} disabled={loading}>
          {loading ? <RefreshCw size={18} className="spin" /> : <GitMerge size={18} />}
          <span>Analyze Similar Products</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 14, marginBottom: 16 }}>
        <strong>Provider:</strong> {providerStatus === 'groq' ? 'Groq' : 'Rule-based'}
        {limitWarning ? <p style={{ color: '#fbbf24', marginTop: 6 }}>{limitWarning}</p> : null}
      </div>

      <div className="glass-panel" style={{ padding: 16 }}>
        {!pairs.length ? (
          <div className="empty-state">
            <GitMerge size={42} className="empty-icon" />
            <h3>No pairs yet</h3>
            <p>Click Analyze Similar Products to fetch two-product merge suggestions.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {pairs.map((pair) => (
              <div key={pair.pair_id} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Match Confidence</h3>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.2rem', padding: '4px 8px', background: 'var(--bg-primary)', borderRadius: 6 }}>{Math.round((pair.confidence || 0) * 100)}%</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <strong style={{ display: 'block', marginBottom: 12, color: 'var(--accent-primary)', fontSize: '1.05rem' }}>{pair.left_name}</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ID:</span> <span style={{ fontWeight: 500 }}>{pair.left_product?.id || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Category:</span> <span>{pair.left_product?.category || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Color:</span> <span>{pair.left_product?.color || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Sale Price:</span> <span>{pair.left_product?.price || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Purchase:</span> <span>{pair.left_product?.purchase_rate || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Stock:</span> <span>{pair.left_product?.remaining_quantity ?? '-'} / {pair.left_product?.total_quantity ?? '-'} {pair.left_product?.quantity_unit || ''}</span>
                    </div>
                  </div>

                  <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <strong style={{ display: 'block', marginBottom: 12, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{pair.right_name}</strong>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>ID:</span> <span style={{ fontWeight: 500 }}>{pair.right_product?.id || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Category:</span> <span>{pair.right_product?.category || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Color:</span> <span>{pair.right_product?.color || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Sale Price:</span> <span>{pair.right_product?.price || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Purchase:</span> <span>{pair.right_product?.purchase_rate || '-'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>Stock:</span> <span>{pair.right_product?.remaining_quantity ?? '-'} / {pair.right_product?.total_quantity ?? '-'} {pair.right_product?.quantity_unit || ''}</span>
                    </div>
                  </div>
                </div>

                <p style={{ margin: '12px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600 }}>Reason:</span> {(pair.reason_tokens || []).join(', ') || 'name similarity'}
                </p>
                
                {selectedPair?.pair_id === pair.pair_id ? (
                  <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <h3 style={{ marginTop: 0 }}>Finalize Merge</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Final Name *</label>
                        <input className="input-field" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label>Category</label>
                        <input className="input-field" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label>Sale Price *</label>
                        <input className="input-field" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label>Purchase Price</label>
                        <input className="input-field" type="number" value={form.purchase_rate} onChange={(e) => setForm((p) => ({ ...p, purchase_rate: e.target.value }))} />
                      </div>
                      <div className="input-group">
                        <label>Unit</label>
                        <input className="input-field" value={form.quantity_unit} onChange={(e) => setForm((p) => ({ ...p, quantity_unit: e.target.value }))} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn-secondary" onClick={() => setSelectedPair(null)}>Cancel</button>
                      <button className="btn-secondary" onClick={() => refreshPreview()}>Refresh Preview</button>
                      <button className="btn-primary" onClick={executeMerge} disabled={merging}>{merging ? 'Merging...' : 'Confirm Merge'}</button>
                    </div>

                    {preview ? (
                      <div style={{ marginTop: 12, border: '1px solid var(--border-color)', borderRadius: 10, padding: 10 }}>
                        <strong>Preview</strong>
                        <p style={{ margin: '8px 0 0' }}>Total Qty: {preview.total_quantity}</p>
                        <p style={{ margin: '4px 0 0' }}>Remaining Qty: {preview.remaining_quantity}</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <button className="btn-secondary" onClick={() => openPair(pair)}>Open Merge Form</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
