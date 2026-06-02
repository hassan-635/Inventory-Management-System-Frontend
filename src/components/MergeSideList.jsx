import { X, GitMerge, CheckCircle, AlertTriangle } from 'lucide-react';
import './ProductSideList.css'; // Reusing the same CSS for consistency

const MergeSideList = ({ 
  isOpen, 
  onClose, 
  onToggle,
  pendingMerges, 
  onRemoveMerge, 
  onClearAll, 
  onProcessMerges,
  isProcessing 
}) => {

  return (
    <>
      {/* Side List */}
      <div className={`product-side-list ${isOpen ? 'open' : ''}`}>
        <div className="side-list-header">
          <h3>Pending Merges</h3>
          <button className="close-side-list" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="side-list-content">
          {pendingMerges.length === 0 ? (
            <div className="empty-side-list">
              <GitMerge size={48} />
              <h4>No pending merges</h4>
              <p>Confirm a merge pair to add it to this list.</p>
            </div>
          ) : (
            pendingMerges.map((merge) => (
              <div key={merge.id} className="side-list-item delete" style={{ borderColor: 'var(--accent-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="item-header">
                  <span className="item-name" style={{ color: 'var(--accent-primary)' }}>{merge.final_values.name}</span>
                  <span className="item-action" style={{ backgroundColor: 'var(--accent-primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    MERGE
                  </span>
                </div>
                
                <div className="item-details" style={{ marginTop: 8 }}>
                  <div><strong>From:</strong> {merge.left_name}</div>
                  <div><strong>And:</strong> {merge.right_name}</div>
                  <div style={{ marginTop: 6, borderTop: '1px solid var(--border-color)', paddingTop: 6 }}>
                    <strong>Final Product:</strong>
                    <div>Category: {merge.final_values.category || 'N/A'}</div>
                    <div>Price: Rs. {merge.final_values.price}</div>
                    <div>Total Qty: {merge.preview_total_qty} {merge.final_values.quantity_unit}</div>
                  </div>
                </div>

                <button 
                  className="remove-item"
                  onClick={() => onRemoveMerge(merge.id)}
                  title="Remove from pending list"
                >
                  <X size={16} /> Undo Merge
                </button>
              </div>
            ))
          )}
        </div>

        {pendingMerges.length > 0 && (
          <div className="side-list-footer">
            <div className="side-list-summary">
              <span className="summary-count">
                {pendingMerges.length} pair(s) to merge
              </span>
              <div className="summary-actions">
                <button className="btn-clear" onClick={onClearAll}>
                  Clear All
                </button>
                <button 
                  className="btn-process"
                  onClick={onProcessMerges}
                  disabled={isProcessing}
                  style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}
                >
                  {isProcessing ? 'Processing...' : 'Process All'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      {pendingMerges.length > 0 && (
          <button 
            className={`side-list-toggle ${pendingMerges.length > 0 ? 'has-items' : ''}`}
            onClick={onToggle || onClose} 
            title={`Pending merges (${pendingMerges.length})`}
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <GitMerge size={24} color="white" />
            <span className="toggle-badge" style={{ backgroundColor: 'var(--danger)' }}>{pendingMerges.length}</span>
          </button>
      )}
    </>
  );
};

export default MergeSideList;
