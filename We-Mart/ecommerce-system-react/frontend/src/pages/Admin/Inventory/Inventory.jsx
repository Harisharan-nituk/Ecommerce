import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { inventoryAPI, productsAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading/Loading';
import EmptyState from '../../../components/EmptyState/EmptyState';
import InventoryHistory from '../../../components/InventoryHistory/InventoryHistory';
import './Inventory.css';

const Inventory = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    quantity: '',
    movement_type: 'adjustment',
    reason: '',
    notes: '',
  });

  // Fetch inventory summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery(
    'inventory-summary',
    () => inventoryAPI.getSummary()
  );

  const [filter, setFilter] = useState('all');

  // Fetch inventory list
  const { data: inventoryData, isLoading: inventoryLoading, refetch } = useQuery(
    ['inventory-list', filter],
    () => {
      const params = { limit: 100 };
      if (filter === 'low_stock') params.low_stock = 'true';
      if (filter === 'out_of_stock') params.out_of_stock = 'true';
      return inventoryAPI.getList(params);
    }
  );

  // Fetch low stock products
  const { data: lowStockData } = useQuery(
    'low-stock-products',
    () => inventoryAPI.getLowStock(10)
  );

  // Update stock mutation
  const updateStockMutation = useMutation(
    ({ productId, data }) => inventoryAPI.updateStock(productId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory-list');
        queryClient.invalidateQueries('inventory-summary');
        queryClient.invalidateQueries('low-stock-products');
        toast.success('Stock updated successfully');
        setShowUpdateModal(false);
        setSelectedProduct(null);
        setUpdateForm({
          quantity: '',
          movement_type: 'adjustment',
          reason: '',
          notes: '',
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update stock');
      },
    }
  );

  const handleUpdateStock = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    updateStockMutation.mutate({
      productId: selectedProduct._id || selectedProduct.id,
      data: {
        quantity: parseInt(updateForm.quantity),
        movement_type: updateForm.movement_type,
        reason: updateForm.reason,
        notes: updateForm.notes,
      },
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (stock <= 10) return { label: 'Low Stock', class: 'low-stock' };
    if (stock <= 50) return { label: 'Medium Stock', class: 'medium-stock' };
    return { label: 'In Stock', class: 'in-stock' };
  };

  const summary = summaryData?.data?.data || {};
  const inventory = inventoryData?.data?.data || [];
  const lowStockProducts = lowStockData?.data?.data || [];

  if (summaryLoading || inventoryLoading) {
    return <Loading message="Loading inventory..." />;
  }

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="inventory-summary">
        <div className="summary-card total-products">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>{summary.totalProducts || 0}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="summary-card in-stock">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>{summary.inStock || 0}</h3>
            <p>In Stock</p>
          </div>
        </div>
        <div className="summary-card low-stock">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>{summary.lowStock || 0}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="summary-card out-of-stock">
          <div className="card-icon">❌</div>
          <div className="card-content">
            <h3>{summary.outOfStock || 0}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="summary-card total-value">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>₹{(summary.totalValue || 0).toLocaleString('en-IN')}</h3>
            <p>Total Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-alert">
          <h3>⚠️ Low Stock Alert</h3>
          <p>{lowStockProducts.length} product(s) are running low on stock</p>
          <div className="low-stock-list">
            {lowStockProducts.slice(0, 5).map((product) => (
              <span key={product._id || product.id} className="low-stock-item">
                {product.name} ({product.stock} left)
              </span>
            ))}
            {lowStockProducts.length > 5 && (
              <span>+{lowStockProducts.length - 5} more</span>
            )}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="inventory-table-section">
        <div className="table-header">
          <h2>Product Inventory</h2>
          <div className="table-filters">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Products</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {inventory.length === 0 ? (
          <EmptyState message="No products found" />
        ) : (
          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Total Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0);
                  return (
                    <tr key={product._id || product.id}>
                      <td className="product-name">{product.name || product.title}</td>
                      <td>{product.sku || 'N/A'}</td>
                      <td>{product.category_id?.name || product.category || 'N/A'}</td>
                      <td className="stock-amount">
                        <strong>{product.stock || 0}</strong>
                      </td>
                      <td>
                        <span className={`stock-status ${stockStatus.class}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td>₹{(product.price || 0).toLocaleString('en-IN')}</td>
                      <td className="total-value-cell">
                        ₹{((product.stock || 0) * (product.price || 0)).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-update-stock"
                            onClick={() => handleUpdateStock(product)}
                          >
                            Update Stock
                          </button>
                          <button
                            className="btn-view-history"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowHistoryModal(true);
                            }}
                          >
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Stock Modal */}
      {showUpdateModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Stock - {selectedProduct.name || selectedProduct.title}</h2>
              <button
                className="modal-close"
                onClick={() => setShowUpdateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate} className="update-stock-form">
              <div className="form-group">
                <label>Current Stock</label>
                <input
                  type="text"
                  value={selectedProduct.stock || 0}
                  disabled
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Movement Type *</label>
                <select
                  value={updateForm.movement_type}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, movement_type: e.target.value })
                  }
                  className="form-input"
                  required
                >
                  <option value="purchase">Purchase (Add Stock)</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="return">Return (Add Stock)</option>
                  <option value="damage">Damage (Remove Stock)</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={updateForm.quantity}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, quantity: e.target.value })
                  }
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  value={updateForm.reason}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, reason: e.target.value })
                  }
                  className="form-input"
                  placeholder="e.g., Restocked, Damaged items, etc."
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={updateForm.notes}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, notes: e.target.value })
                  }
                  className="form-input"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={updateStockMutation.isLoading}
                >
                  {updateStockMutation.isLoading ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory History Modal */}
      {showHistoryModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Inventory History - {selectedProduct.name || selectedProduct.title}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedProduct(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <InventoryHistory productId={selectedProduct._id || selectedProduct.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
