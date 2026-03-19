import React from 'react';
import { useQuery } from 'react-query';
import { inventoryAPI } from '../../services/api';
import { format } from 'date-fns';
import Loading from '../Loading/Loading';
import './InventoryHistory.css';

const InventoryHistory = ({ productId }) => {
  const { data, isLoading } = useQuery(
    ['inventory-history', productId],
    () => inventoryAPI.getProductHistory(productId, 50),
    { enabled: !!productId }
  );

  const getMovementIcon = (type) => {
    switch (type) {
      case 'purchase':
        return '📥';
      case 'sale':
        return '📤';
      case 'adjustment':
        return '⚙️';
      case 'return':
        return '↩️';
      case 'damage':
        return '💥';
      case 'transfer':
        return '🔄';
      case 'initial':
        return '🏁';
      default:
        return '📋';
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'purchase':
      case 'return':
        return '#10b981'; // Green
      case 'sale':
      case 'damage':
        return '#ef4444'; // Red
      case 'adjustment':
        return '#3b82f6'; // Blue
      default:
        return '#6b7280'; // Gray
    }
  };

  if (isLoading) {
    return <Loading message="Loading inventory history..." />;
  }

  const history = data?.data?.data || [];

  if (history.length === 0) {
    return (
      <div className="inventory-history-empty">
        <p>No inventory history available</p>
      </div>
    );
  }

  return (
    <div className="inventory-history">
      <h3>Inventory History</h3>
      <div className="history-timeline">
        {history.map((movement, index) => (
          <div key={movement._id || index} className="history-item">
            <div
              className="history-icon"
              style={{ backgroundColor: getMovementColor(movement.movement_type) }}
            >
              {getMovementIcon(movement.movement_type)}
            </div>
            <div className="history-content">
              <div className="history-header">
                <span className="history-type">
                  {movement.movement_type.charAt(0).toUpperCase() + movement.movement_type.slice(1)}
                </span>
                <span className="history-date">
                  {format(new Date(movement.created_at), 'PPpp')}
                </span>
              </div>
              <div className="history-details">
                <div className="stock-change">
                  <span className="previous-stock">{movement.previous_stock}</span>
                  <span className="arrow">→</span>
                  <span className="new-stock">{movement.new_stock}</span>
                  <span className="quantity-change">
                    ({movement.quantity > 0 ? '+' : ''}{movement.quantity})
                  </span>
                </div>
                {movement.reason && (
                  <p className="history-reason">
                    <strong>Reason:</strong> {movement.reason}
                  </p>
                )}
                {movement.notes && (
                  <p className="history-notes">{movement.notes}</p>
                )}
                {movement.reference_id && (
                  <p className="history-reference">
                    <strong>Reference:</strong> {movement.reference_type} #{movement.reference_id}
                  </p>
                )}
                {movement.performed_by && (
                  <p className="history-performed-by">
                    <strong>Updated by:</strong>{' '}
                    {movement.performed_by?.first_name || 'System'}
                    {movement.is_automatic && <span className="auto-badge">Auto</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryHistory;
