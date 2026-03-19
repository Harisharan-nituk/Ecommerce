import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiTrendingUp, FiPlus, FiEdit, FiTrash2, FiAlertCircle, FiX, FiSave } from 'react-icons/fi';
import { adminAPI } from '../../../services/api';
import './CommissionRules.css';

const CommissionRules = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_type: 'percentage',
    description: '',
    commission_value: '',
    priority: 0,
    status: 'active',
    seller_tier: '',
    category_id: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    conditions: {
      min_order_value: '',
      max_order_value: '',
      seller_rating: '',
      product_tags: []
    },
    slab_ranges: []
  });
  const [slabInput, setSlabInput] = useState({ min: '', max: '', commission: '' });

  // Fetch commission rules
  const { data: rulesData, isLoading, error } = useQuery(
    'admin-commission-rules',
    async () => {
      const response = await adminAPI.getCommissionRules();
      return response.data;
    }
  );

  // Create mutation
  const createMutation = useMutation(
    (data) => adminAPI.createCommissionRule(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-commission-rules');
        setShowModal(false);
        resetForm();
      }
    }
  );

  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }) => adminAPI.updateCommissionRule(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-commission-rules');
        setShowModal(false);
        resetForm();
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id) => adminAPI.deleteCommissionRule(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-commission-rules');
      }
    }
  );

  const rules = rulesData?.data || [];

  const resetForm = () => {
    setFormData({
      rule_name: '',
      rule_type: 'percentage',
      description: '',
      commission_value: '',
      priority: 0,
      status: 'active',
      seller_tier: '',
      category_id: '',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      conditions: {
        min_order_value: '',
        max_order_value: '',
        seller_rating: '',
        product_tags: []
      },
      slab_ranges: []
    });
    setEditingRule(null);
    setSlabInput({ min: '', max: '', commission: '' });
  };

  const handleAddClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (rule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name || '',
      rule_type: rule.rule_type || 'percentage',
      description: rule.description || '',
      commission_value: rule.commission_value || '',
      priority: rule.priority || 0,
      status: rule.status || 'active',
      seller_tier: rule.seller_tier || '',
      category_id: rule.category_id || '',
      effective_from: rule.effective_from ? new Date(rule.effective_from).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      effective_to: rule.effective_to ? new Date(rule.effective_to).toISOString().split('T')[0] : '',
      conditions: {
        min_order_value: rule.conditions?.min_order_value || '',
        max_order_value: rule.conditions?.max_order_value || '',
        seller_rating: rule.conditions?.seller_rating || '',
        product_tags: rule.conditions?.product_tags || []
      },
      slab_ranges: rule.slab_ranges || []
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (rule) => {
    if (window.confirm(`Are you sure you want to delete the rule "${rule.rule_name}"?`)) {
      await deleteMutation.mutateAsync(rule._id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('conditions.')) {
      const conditionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          [conditionKey]: value === '' ? null : (isNaN(value) ? value : parseFloat(value))
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'priority' || name === 'commission_value' ? (value === '' ? '' : parseFloat(value)) : value
      }));
    }
  };

  const handleAddSlab = () => {
    if (slabInput.min && slabInput.max && slabInput.commission) {
      setFormData(prev => ({
        ...prev,
        slab_ranges: [
          ...prev.slab_ranges,
          {
            min: parseFloat(slabInput.min),
            max: parseFloat(slabInput.max),
            commission: parseFloat(slabInput.commission)
          }
        ]
      }));
      setSlabInput({ min: '', max: '', commission: '' });
    }
  };

  const handleRemoveSlab = (index) => {
    setFormData(prev => ({
      ...prev,
      slab_ranges: prev.slab_ranges.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      commission_value: formData.commission_value ? parseFloat(formData.commission_value) : undefined,
      priority: parseInt(formData.priority) || 0,
      seller_tier: formData.seller_tier || null,
      category_id: formData.category_id || null,
      effective_from: new Date(formData.effective_from),
      effective_to: formData.effective_to ? new Date(formData.effective_to) : null,
      conditions: {
        min_order_value: formData.conditions.min_order_value || null,
        max_order_value: formData.conditions.max_order_value || null,
        seller_rating: formData.conditions.seller_rating || null,
        product_tags: formData.conditions.product_tags || []
      }
    };

    // Remove empty fields for slab-based rules
    if (submitData.rule_type === 'slab-based') {
      delete submitData.commission_value;
    } else {
      delete submitData.slab_ranges;
    }

    // Remove null/empty condition fields
    Object.keys(submitData.conditions).forEach(key => {
      if (submitData.conditions[key] === null || submitData.conditions[key] === '') {
        delete submitData.conditions[key];
      }
    });

    if (editingRule) {
      await updateMutation.mutateAsync({ id: editingRule._id, data: submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-commission-rules">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FiTrendingUp className="header-icon" />
            Manage Commission Rules
          </h1>
          <p className="page-description">Configure commission calculation rules for sellers</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleAddClick}>
          <FiPlus />
          Add Rule
        </button>
      </div>

      <div className="content-card">
        {isLoading ? (
          <div className="loading-state">Loading commission rules...</div>
        ) : error ? (
          <div className="error-state">
            <FiAlertCircle className="error-icon" />
            <p>Failed to load commission rules: {error.message}</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="empty-state">
            <FiAlertCircle className="empty-icon" />
            <p>No commission rules found</p>
            <button className="btn btn-primary" onClick={handleAddClick}>Create First Rule</button>
          </div>
        ) : (
          <div className="rules-grid">
            {rules.map((rule) => (
              <div key={rule._id} className="rule-card">
                <div className="rule-header">
                  <h3>{rule.rule_name}</h3>
                  <div className="rule-actions">
                    <button 
                      className="btn-icon" 
                      title="Edit"
                      onClick={() => handleEditClick(rule)}
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="btn-icon btn-icon-danger" 
                      title="Delete"
                      onClick={() => handleDeleteClick(rule)}
                      disabled={deleteMutation.isLoading}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="rule-body">
                  <div className="rule-info">
                    <div className="info-item">
                      <span className="info-label">Type:</span>
                      <span className="info-value">{rule.rule_type || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">
                        {rule.rule_type === 'percentage' ? 'Rate:' : 'Amount:'}
                      </span>
                      <span className="info-value">
                        {rule.rule_type === 'percentage' 
                          ? `${rule.commission_value || 0}%`
                          : rule.rule_type === 'slab-based'
                          ? 'Slab-based'
                          : `₹${rule.commission_value || 0}`
                        }
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Priority:</span>
                      <span className="info-value">{rule.priority || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className={`status-badge status-${rule.status === 'active' ? 'active' : 'inactive'}`}>
                        {rule.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {rule.seller_tier && (
                      <div className="info-item">
                        <span className="info-label">Seller Tier:</span>
                        <span className="info-value">{rule.seller_tier}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Effective From:</span>
                      <span className="info-value">{formatDate(rule.effective_from)}</span>
                    </div>
                    {rule.effective_to && (
                      <div className="info-item">
                        <span className="info-label">Effective To:</span>
                        <span className="info-value">{formatDate(rule.effective_to)}</span>
                      </div>
                    )}
                  </div>
                  {rule.description && (
                    <div className="rule-description">
                      <p>{rule.description}</p>
                    </div>
                  )}
                  {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                    <div className="rule-conditions">
                      <h4>Conditions</h4>
                      <div className="conditions-list">
                        {rule.conditions.min_order_value && (
                          <div>Min Order Value: ₹{rule.conditions.min_order_value}</div>
                        )}
                        {rule.conditions.max_order_value && (
                          <div>Max Order Value: ₹{rule.conditions.max_order_value}</div>
                        )}
                        {rule.conditions.seller_rating && (
                          <div>Min Seller Rating: {rule.conditions.seller_rating}</div>
                        )}
                        {rule.conditions.product_tags && rule.conditions.product_tags.length > 0 && (
                          <div>Product Tags: {rule.conditions.product_tags.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}
                  {rule.slab_ranges && rule.slab_ranges.length > 0 && (
                    <div className="rule-slabs">
                      <h4>Slab Ranges</h4>
                      <div className="slabs-list">
                        {rule.slab_ranges.map((slab, idx) => (
                          <div key={idx} className="slab-item">
                            ₹{slab.min} - ₹{slab.max}: ₹{slab.commission}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRule ? 'Edit Commission Rule' : 'Add Commission Rule'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Rule Name *</label>
                <input
                  type="text"
                  name="rule_name"
                  value={formData.rule_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Standard Commission"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Rule description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rule Type *</label>
                  <select
                    name="rule_type"
                    value={formData.rule_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="slab-based">Slab-based</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {formData.rule_type !== 'slab-based' && (
                <div className="form-group">
                  <label>
                    {formData.rule_type === 'percentage' ? 'Commission Rate (%) *' : 'Commission Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    name="commission_value"
                    value={formData.commission_value}
                    onChange={handleInputChange}
                    required={formData.rule_type !== 'slab-based'}
                    step={formData.rule_type === 'percentage' ? '0.01' : '1'}
                    min="0"
                    placeholder={formData.rule_type === 'percentage' ? '5.0' : '100'}
                  />
                </div>
              )}

              {formData.rule_type === 'slab-based' && (
                <div className="form-group">
                  <label>Slab Ranges *</label>
                  <div className="slab-input-group">
                    <input
                      type="number"
                      placeholder="Min"
                      value={slabInput.min}
                      onChange={(e) => setSlabInput({ ...slabInput, min: e.target.value })}
                      step="1"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={slabInput.max}
                      onChange={(e) => setSlabInput({ ...slabInput, max: e.target.value })}
                      step="1"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Commission"
                      value={slabInput.commission}
                      onChange={(e) => setSlabInput({ ...slabInput, commission: e.target.value })}
                      step="1"
                      min="0"
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddSlab}>
                      Add Slab
                    </button>
                  </div>
                  {formData.slab_ranges.length > 0 && (
                    <div className="slabs-list">
                      {formData.slab_ranges.map((slab, idx) => (
                        <div key={idx} className="slab-item">
                          ₹{slab.min} - ₹{slab.max}: ₹{slab.commission}
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger"
                            onClick={() => handleRemoveSlab(idx)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Seller Tier</label>
                  <select
                    name="seller_tier"
                    value={formData.seller_tier}
                    onChange={handleInputChange}
                  >
                    <option value="">Any Tier</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Effective From *</label>
                  <input
                    type="date"
                    name="effective_from"
                    value={formData.effective_from}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Effective To</label>
                  <input
                    type="date"
                    name="effective_to"
                    value={formData.effective_to}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Conditions (Optional)</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Min Order Value (₹)</label>
                    <input
                      type="number"
                      name="conditions.min_order_value"
                      value={formData.conditions.min_order_value}
                      onChange={handleInputChange}
                      step="1"
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Order Value (₹)</label>
                    <input
                      type="number"
                      name="conditions.max_order_value"
                      value={formData.conditions.max_order_value}
                      onChange={handleInputChange}
                      step="1"
                      min="0"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Min Seller Rating</label>
                  <input
                    type="number"
                    name="conditions.seller_rating"
                    value={formData.conditions.seller_rating}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  <FiSave />
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionRules;
