import { useState, useEffect } from 'react';
import { GitMerge, RefreshCw, X, Eye, Trash2, AlertTriangle, Check, ListChecks } from 'lucide-react';
import api from '../utils/api';
import { notifyError, notifySuccess, confirmAction } from '../utils/notifications';
import CustomDropdown from '../components/CustomDropdown';
import MergeSideList from '../components/MergeSideList';

const defaultForm = {
  name: '',
  category: 'Hardware',
  color: '',
  price: '',
  purchase_rate: '',
  quantity_unit: 'Piece',
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

  // --- Pending Merges Local State ---
  const [pendingMerges, setPendingMerges] = useState(() => {
    try {
      const stored = localStorage.getItem('inventory_pending_merges');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSideListOpen, setIsSideListOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem('inventory_pending_merges', JSON.stringify(pendingMerges));
  }, [pendingMerges]);
  // ----------------------------------

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
    setForm((prev) => ({ 
      ...prev, 
      name: pair.left_name || '',
      category: pair.left_product?.category || 'Hardware',
      color: pair.left_product?.color || '',
      price: pair.left_product?.price || '',
      purchase_rate: pair.left_product?.purchase_rate || '',
      quantity_unit: pair.left_product?.quantity_unit || 'Piece'
    }));
    setPreview(null);
    await refreshPreview(pair, {
      ...defaultForm,
      name: pair.left_name || '',
      category: pair.left_product?.category || 'Hardware',
      color: pair.left_product?.color || '',
      price: pair.left_product?.price || '',
      purchase_rate: pair.left_product?.purchase_rate || '',
      quantity_unit: pair.left_product?.quantity_unit || 'Piece'
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
          color: formData.color,
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
    
    const newPendingMerge = {
      id: Date.now().toString(),
      pair_id: selectedPair.pair_id,
      left_product_id: selectedPair.left_product_id,
      right_product_id: selectedPair.right_product_id,
      left_name: selectedPair.left_name,
      right_name: selectedPair.right_name,
      survivor_product_id: selectedPair.left_product_id,
      provider_used: providerStatus,
      final_values: {
        name: form.name.trim(),
        category: form.category,
        color: form.color,
        price: Number(form.price),
        purchase_rate: form.purchase_rate === '' ? null : Number(form.purchase_rate),
        quantity_unit: form.quantity_unit || 'Piece',
      },
      preview_total_qty: preview?.total_quantity || 0,
      preview_remaining_qty: preview?.remaining_quantity || 0,
    };

    setPendingMerges(prev => [...prev, newPendingMerge]);
    notifySuccess('Merge added to pending list.');
    setSelectedPair(null);
    setPreview(null);
    setForm(defaultForm);
    setIsSideListOpen(true);
  };

  const removePendingMerge = (id) => {
    setPendingMerges(prev => prev.filter(m => m.id !== id));
  };

  const processPendingMerges = async () => {
    if (pendingMerges.length === 0) return;
    const ok = await confirmAction(
      'Process All Merges?', 
      'WARNING: This action is permanent and cannot be undone. All selected merges will be permanently written to the database. Proceed?'
    );
    if (!ok) return;

    setIsProcessing(true);
    let successCount = 0;
    let errors = [];

    for (const merge of pendingMerges) {
      try {
        await api.post('/api/products/merge-execute', {
          product_ids: [merge.left_product_id, merge.right_product_id],
          survivor_product_id: merge.survivor_product_id,
          provider_used: merge.provider_used,
          final_values: merge.final_values,
        });
        successCount++;
      } catch (err) {
        errors.push(`Merge ${merge.left_name} + ${merge.right_name} failed: ${err.response?.data?.error || err.message}`);
      }
    }

    if (errors.length > 0) {
      notifyError(`Processed ${successCount} merges. ${errors.length} failed:\\n` + errors.join('\\n'));
    } else {
      notifySuccess(`Successfully processed ${successCount} merges!`);
    }

    setPendingMerges([]);
    setIsSideListOpen(false);
    setIsProcessing(false);
    analyzePairs();
  };

  const filteredPairs = pairs.filter(pair => {
    const isPending = pendingMerges.some(m => 
      m.left_product_id === pair.left_product_id || 
      m.left_product_id === pair.right_product_id ||
      m.right_product_id === pair.left_product_id || 
      m.right_product_id === pair.right_product_id
    );
    return !isPending;
  });

  const [syncing, setSyncing] = useState(false);
  const [missingCount, setMissingCount] = useState(0);

  useEffect(() => {
    analyzePairs();
  }, []);

  const syncAiNames = async () => {
    try {
      // First check if there are any missing products
      const { data: missingData } = await api.get('/api/products/missing-ai-count');
      const missingCount = missingData.missing_count;

      const { data: allData } = await api.get('/api/products/missing-ai-count?forceAll=true');
      const allCount = allData.missing_count;

      let forceAll = false;
      let countToSync = missingCount;

      if (missingCount === 0) {
        // No missing products. Ask if they want to force regenerate all.
        const ok = await confirmAction('Force Regenerate All', `All products already have AI names. Do you want to FORCE REGENERATE AI names for all ${allCount} products? This will use AI quota and take some time.`);
        if (!ok) return;
        forceAll = true;
        countToSync = allCount;
      } else {
        // Ask if they want to sync only missing or all
        const ok = await confirmAction('Sync AI Names', `Found ${missingCount} products missing AI names. Click OK to sync only missing products, or Cancel if you want to force regenerate all.`);
        if (ok) {
          forceAll = false;
          countToSync = missingCount;
        } else {
          const forceOk = await confirmAction('Force Regenerate All', `WARNING: You chose to skip syncing missing only. Do you want to FORCE REGENERATE ALL ${allCount} products?`);
          if (!forceOk) return;
          forceAll = true;
          countToSync = allCount;
        }
      }
      
      setMissingCount(countToSync);
      setSyncing(true);

      await api.post('/api/products/backfill-ai-names', { forceAll });
      notifySuccess(`Started ${forceAll ? 'force regenerating all' : 'syncing missing'} products in the background.`);

      // Poll for progress every 3 seconds
      const interval = setInterval(async () => {
        try {
          // If forceAll is true, missing-ai-count endpoint won't help us track progress easily unless we track how many are processed. 
          // But actually, getMissingAiCount with forceAll=true just returns total count. It won't decrease!
          // So if forceAll is true, we can't poll progress using getMissingAiCount easily.
          // To fix this, we will just poll the normal missing count if forceAll is false.
          // If forceAll is true, we might just have to stop syncing visually after a timeout or let the user refresh manually.
          if (!forceAll) {
            const { data } = await api.get('/api/products/missing-ai-count');
            setMissingCount(data.missing_count);
            if (data.missing_count === 0) {
              clearInterval(interval);
              setSyncing(false);
              notifySuccess('Sync completed successfully!');
              analyzePairs(); 
            }
          } else {
            // For forceAll, just show it's running and don't poll count. We will just auto-stop after 5 minutes or they can refresh.
            // Let's just clear interval and keep it spinning until they refresh.
          }
        } catch (err) {
          console.error('Error polling missing AI count:', err);
        }
      }, 3000);

      // Auto stop syncing state after 30 seconds for forceAll just as a fallback
      if (forceAll) {
        setTimeout(() => {
          setSyncing(false);
          notifySuccess('Force regeneration triggered. Please wait a few minutes and refresh the page to see updated pairs.');
        }, 15000);
      }

    } catch (err) {
      notifyError(err.response?.data?.error || 'Failed to start AI sync.');
      setSyncing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Product Merge</h1>
          <p className="page-subtitle">Analyze similar products then merge pair-to-one safely.</p>
        </div>
        <button className="btn-secondary flex items-center gap-2" onClick={analyzePairs} disabled={loading}>
          {loading ? <RefreshCw size={18} className="spin" /> : <RefreshCw size={18} />}
          <span>Refresh List</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 14, marginBottom: 16 }}>
        <strong>Provider:</strong> {providerStatus === 'ai' ? '🧠 AI Verified' : providerStatus === 'vector' ? '🔍 Vector Search' : '📏 Rule-based'}
        {limitWarning ? <p style={{ color: '#fbbf24', marginTop: 6 }}>{limitWarning}</p> : null}
      </div>

      <div className="glass-panel" style={{ padding: 16, marginBottom: 16 }}>
        {!filteredPairs.length ? (
          <div className="empty-state">
            <GitMerge size={42} className="empty-icon" />
            <h3>No pairs found</h3>
            <p>Your inventory is fully optimized! No duplicate products found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filteredPairs.map((pair) => (
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
                        <CustomDropdown
                          className="minimal-select"
                          value={form.category}
                          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                          options={[
                            { value: 'Paint', label: 'Paint' },
                            { value: 'Electric', label: 'Electric' },
                            { value: 'Hardware', label: 'Hardware' }
                          ]}
                        />
                      </div>
                      <div className="input-group">
                        <label>Color</label>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {(() => {
                            const colors = [...new Set([selectedPair?.left_product?.color, selectedPair?.right_product?.color].filter(c => c && c.trim() !== ''))];
                            if (colors.length === 0) {
                              return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No colors in source products</span>;
                            }
                            return colors.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setForm(p => ({ ...p, color: c }))}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  padding: '6px 12px', borderRadius: '20px',
                                  background: form.color === c ? 'var(--bg-secondary)' : 'transparent',
                                  border: form.color === c ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                  cursor: 'pointer', transition: 'all 0.2s',
                                  color: 'var(--text-primary)'
                                }}
                              >
                                <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: c, border: '1px solid rgba(255,255,255,0.2)' }}></span>
                                <span style={{ fontSize: '0.85rem', fontWeight: form.color === c ? 600 : 400 }}>{c}</span>
                              </button>
                            ));
                          })()}
                          {form.color && (
                            <button
                              type="button"
                              onClick={() => setForm(p => ({ ...p, color: '' }))}
                              style={{ fontSize: '0.8rem', color: 'var(--danger-color, #ef4444)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '4px' }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
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
                        <CustomDropdown
                          className="minimal-select"
                          value={form.quantity_unit}
                          onChange={(e) => setForm((p) => ({ ...p, quantity_unit: e.target.value }))}
                          options={[
                            { value: 'Piece', label: 'Piece' },
                            { value: 'Dozen', label: 'Dozen' },
                            { value: 'Box', label: 'Box' },
                            { value: 'Ft', label: 'Ft' },
                            { value: 'Meter', label: 'Meter' },
                            { value: 'Liter', label: 'Liter' },
                            { value: 'Gallon', label: 'Gallon' },
                            { value: 'Bucket', label: 'Bucket / Balti' },
                            { value: '250 Gram', label: '250 Gram' },
                            { value: 'Kg', label: 'Kg' },
                            { value: 'Gram', label: 'Gram' },
                            { value: 'Inch', label: 'Inch' },
                            { value: 'Millimeter', label: 'Millimeter' },
                            { value: 'Pair', label: 'Pair' },
                            { value: 'Set', label: 'Set' },
                            { value: 'Strip', label: 'Strip' },
                            { value: 'Roll', label: 'Roll' },
                            { value: 'Bag', label: 'Bag' },
                            { value: 'Coil', label: 'Coil' }
                          ]}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                      <button 
                        onClick={() => setSelectedPair(null)}
                        style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <X size={16} /> Cancel
                      </button>
                      <button 
                        onClick={() => refreshPreview()}
                        style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                      >
                        <Eye size={16} /> Preview
                      </button>
                      <button 
                        className="btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '8px' }}
                        onClick={executeMerge} 
                        disabled={merging}
                      >
                        {merging ? <RefreshCw size={16} className="spin" /> : <GitMerge size={16} />}
                        {merging ? 'Merging...' : 'Confirm Merge'}
                      </button>
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
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button 
                      className="btn-primary" 
                      style={{ borderRadius: '50%', width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--accent-glow)' }} 
                      onClick={() => openPair(pair)}
                      title="Open Merge Form"
                    >
                      <GitMerge size={22} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: 20, textAlign: 'center' }}>
        <h3>Missing AI Sync</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Sync older products with the new AI Vector system to find hidden duplicates.
        </p>
        {!syncing ? (
          <button className="btn-primary" onClick={syncAiNames}>
            <RefreshCw size={16} style={{ display: 'inline', marginRight: 8 }} />
            Sync Old Products with AI
          </button>
        ) : (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--accent-primary)', marginBottom: 12 }}>
              <RefreshCw size={20} className="spin" />
              <span style={{ fontWeight: 600 }}>Syncing in Background...</span>
            </div>
            <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', background: 'var(--bg-secondary)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div className="progress-bar-animated" style={{ width: '100%', height: '100%', background: 'var(--accent-primary)', animation: 'indeterminate 1.5s infinite linear' }} />
            </div>
            <p style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Remaining products: <strong style={{ color: 'var(--text-primary)' }}>{missingCount}</strong>
            </p>
          </div>
        )}
      </div>

      <MergeSideList 
        isOpen={isSideListOpen}
        onClose={() => setIsSideListOpen(false)}
        onToggle={() => setIsSideListOpen(!isSideListOpen)}
        pendingMerges={pendingMerges}
        onRemoveMerge={removePendingMerge}
        onClearAll={() => {
          if (window.confirm('Clear all pending merges?')) setPendingMerges([]);
        }}
        onProcessMerges={processPendingMerges}
        isProcessing={isProcessing}
      />
    </div>
  );
}
