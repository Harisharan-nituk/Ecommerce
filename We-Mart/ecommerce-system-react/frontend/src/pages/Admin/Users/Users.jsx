import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiCheck,
  FiX,
  FiEye,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiBriefcase,
} from 'react-icons/fi';
import { usersAPI, rolesAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading/Loading';
import './Users.css';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [showSellerApps, setShowSellerApps] = useState(true);
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['users', statusFilter, roleFilter, searchTerm],
    () => usersAPI.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined, role: roleFilter !== 'all' ? roleFilter : undefined, search: searchTerm }),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch roles
  const { data: rolesData } = useQuery('roles', () => rolesAPI.getAll());

  const users = usersData?.data?.data || [];
  const roles = rolesData?.data?.data || [];

  // Approve seller application mutation
  const approveSellerMutation = useMutation(
    ({ applicationId, roleId }) => usersAPI.approveSellerApplication(applicationId, roleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Seller application approved with role assigned!');
        setSelectedUser(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve application');
      },
    }
  );

  // Reject seller application mutation
  const rejectSellerMutation = useMutation(
    ({ applicationId, reason }) => usersAPI.rejectSellerApplication(applicationId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Seller application rejected');
        setSelectedUser(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject application');
      },
    }
  );

  // Update user status mutation
  const updateStatusMutation = useMutation(
    ({ userId, status }) => usersAPI.updateStatus(userId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      },
    }
  );

  // Assign role mutation
  const assignRoleMutation = useMutation(
    ({ userId, roleId }) => usersAPI.assignRole(userId, roleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Role assigned successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to assign role');
      },
    }
  );

  // Remove role mutation
  const removeRoleMutation = useMutation(
    ({ userId, roleId }) => usersAPI.removeRole(userId, roleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Role removed successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove role');
      },
    }
  );

  // Update user roles mutation (bulk update)
  const updateUserRolesMutation = useMutation(
    ({ userId, roleIds }) => usersAPI.updateUserRoles(userId, roleIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User roles updated successfully');
        setSelectedUser(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update roles');
      },
    }
  );

  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingApplicationId, setPendingApplicationId] = useState(null);
  const [selectedRoleForApproval, setSelectedRoleForApproval] = useState('');

  const handleApproveSeller = (applicationId) => {
    setPendingApplicationId(applicationId);
    setShowRoleSelection(true);
  };

  const confirmApproveWithRole = () => {
    if (!selectedRoleForApproval) {
      toast.error('Please select a role to assign');
      return;
    }
    approveSellerMutation.mutate({ applicationId: pendingApplicationId, roleId: selectedRoleForApproval });
    setShowRoleSelection(false);
    setSelectedRoleForApproval('');
    setPendingApplicationId(null);
  };

  const handleRejectSeller = (applicationId) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason !== null) {
      rejectSellerMutation.mutate({ applicationId, reason });
    }
  };

  // Filter users with seller applications
  const usersWithSellerApps = showSellerApps
    ? users.filter(u => u.seller_application)
    : users;

  // Filter by seller application status
  const filteredUsers = usersWithSellerApps.filter(user => {
    if (showSellerApps && user.seller_application) {
      return user.seller_application.status === 'pending' || !statusFilter || statusFilter === 'all';
    }
    return true;
  });

  const pendingSellerApps = users.filter(u => 
    u.seller_application && u.seller_application.status === 'pending'
  );

  if (usersLoading) return <Loading message="Loading users..." />;

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h1>
            <FiUsers />
            User Management
          </h1>
          <p>Manage users and seller applications</p>
        </div>
        {pendingSellerApps.length > 0 && (
          <div className="pending-badge">
            <FiBriefcase />
            {pendingSellerApps.length} Pending Seller Applications
          </div>
        )}
      </div>

      <div className="users-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search users by name, email, or business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <FiFilter />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>
        <div className="toggle-seller-apps">
          <label>
            <input
              type="checkbox"
              checked={showSellerApps}
              onChange={(e) => setShowSellerApps(e.target.checked)}
            />
            Show Seller Applications Only
          </label>
        </div>
      </div>

      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <FiUsers />
            <h3>No users found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              className={`user-card ${user.seller_application?.status === 'pending' ? 'pending-seller' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <div className="user-card-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <div>
                    <h3>{user.full_name}</h3>
                    <p className="user-email">{user.email}</p>
                    {user.phone && <p className="user-phone">{user.phone}</p>}
                  </div>
                </div>
                <div className="user-status">
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                  {user.seller_application && (
                    <span className={`seller-app-badge ${user.seller_application.status}`}>
                      {user.seller_application.status === 'pending' && '⏳'}
                      {user.seller_application.status === 'approved' && '✅'}
                      {user.seller_application.status === 'rejected' && '❌'}
                      Seller App: {user.seller_application.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="user-details">
                <div className="user-roles">
                  <FiShield />
                  <span>Roles: </span>
                  {user.roles.length > 0 ? (
                    user.roles.map((role, idx) => (
                      <span key={idx} className="role-tag">{role}</span>
                    ))
                  ) : (
                    <span className="no-role">No roles assigned</span>
                  )}
                </div>

                {user.seller_application && (
                  <div className="seller-application-info">
                    <div className="seller-app-header">
                      <FiBriefcase />
                      <strong>Seller Application</strong>
                    </div>
                    <div className="seller-app-details">
                      <p><strong>Business:</strong> {user.seller_application.business_name}</p>
                      <p><strong>Address:</strong> {user.seller_application.business_address}</p>
                      {user.seller_application.business_pincode && (
                        <p><strong>Pincode:</strong> {user.seller_application.business_pincode}</p>
                      )}
                      <p><strong>Description:</strong> {user.seller_application.business_description}</p>
                      {user.seller_application.pan_card && (
                        <p><strong>PAN Card:</strong> {user.seller_application.pan_card}</p>
                      )}
                      {user.seller_application.aadhaar && (
                        <p><strong>Aadhaar:</strong> {user.seller_application.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 **** $3')}</p>
                      )}
                      {user.seller_application.account_number && (
                        <p><strong>Account Number:</strong> {user.seller_application.account_number.replace(/(\d{4})(\d+)(\d{4})/, '$1 **** $3')}</p>
                      )}
                      {user.seller_application.tax_id && (
                        <p><strong>Tax ID:</strong> {user.seller_application.tax_id}</p>
                      )}
                      <p className="app-date">
                        Applied: {new Date(user.seller_application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="user-actions">
                  <button
                    className="btn-view"
                    onClick={() => {
                      setSelectedUser(user);
                      // Initialize selectedRoleIds with user's current roles
                      const userRoleIds = roles
                        .filter(role => user.roles?.includes(role.name))
                        .map(role => role.id || role._id);
                      setSelectedRoleIds(userRoleIds);
                    }}
                  >
                    <FiEye />
                    View Details
                  </button>
                  {user.seller_application?.status === 'pending' && (
                    <>
                      <button
                        className="btn-approve"
                        onClick={() => handleApproveSeller(user.seller_application.id)}
                        disabled={approveSellerMutation.isLoading}
                      >
                        <FiCheck />
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleRejectSeller(user.seller_application.id)}
                        disabled={rejectSellerMutation.isLoading}
                      >
                        <FiX />
                        Reject
                      </button>
                    </>
                  )}
                  {user.status === 'active' ? (
                    <button
                      className="btn-suspend"
                      onClick={() => updateStatusMutation.mutate({ userId: user.id, status: 'suspended' })}
                    >
                      <FiUserX />
                      Suspend
                    </button>
                  ) : (
                    <button
                      className="btn-activate"
                      onClick={() => updateStatusMutation.mutate({ userId: user.id, status: 'active' })}
                    >
                      <FiUserCheck />
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="user-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              className="user-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>User Details</h2>
                <button onClick={() => {
                  setSelectedUser(null);
                  setSelectedRoleIds([]);
                }}>✕</button>
              </div>
              <div className="modal-content">
                <div className="detail-group">
                  <label>Name</label>
                  <p>{selectedUser.full_name}</p>
                </div>
                <div className="detail-group">
                  <label>Email</label>
                  <p>{selectedUser.email}</p>
                </div>
                <div className="detail-group">
                  <label>Phone</label>
                  <p>{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Status</label>
                  <p>{selectedUser.status}</p>
                </div>
                <div className="detail-group">
                  <label>Roles Management</label>
                  <div className="roles-section">
                    <div className="roles-current">
                      <strong>Current Roles:</strong>
                      {selectedUser.roles && selectedUser.roles.length > 0 ? (
                        <div className="roles-list">
                          {selectedUser.roles.map((role, idx) => {
                            const roleObj = roles.find(r => r.name === role || r._id === role);
                            const roleId = roleObj?.id || roleObj?._id || role;
                            return (
                              <span key={idx} className="role-tag">
                                {role}
                                {roleObj && (
                                  <button
                                    className="remove-role-btn"
                                    onClick={() => {
                                      if (window.confirm(`Remove ${role} role from this user?`)) {
                                        removeRoleMutation.mutate({ userId: selectedUser.id, roleId });
                                      }
                                    }}
                                    disabled={removeRoleMutation.isLoading}
                                    title="Remove role"
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="no-role">No roles assigned</span>
                      )}
                    </div>

                    <div className="roles-actions">
                      <div className="assign-role-section">
                        <label>Quick Assign:</label>
                        <select
                          className="role-select"
                          onChange={(e) => {
                            const roleId = e.target.value;
                            if (roleId && roleId !== '') {
                              if (window.confirm(`Assign this role to ${selectedUser.full_name}?`)) {
                                assignRoleMutation.mutate({ userId: selectedUser.id, roleId });
                                e.target.value = '';
                              }
                            }
                          }}
                          disabled={assignRoleMutation.isLoading}
                        >
                          <option value="">Assign Role...</option>
                          {roles
                            .filter(role => !selectedUser.roles?.includes(role.name))
                            .map(role => {
                              const roleId = role.id || role._id;
                              return (
                                <option key={roleId} value={roleId}>
                                  {role.name}
                                </option>
                              );
                            })}
                        </select>
                      </div>

                      <div className="bulk-update-section">
                        <label>Bulk Update (Select Multiple):</label>
                        <div className="roles-multiselect">
                          {roles.map(role => {
                            const roleId = role.id || role._id;
                            const isSelected = selectedRoleIds.includes(roleId);
                            return (
                              <label key={roleId} className="role-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRoleIds([...selectedRoleIds, roleId]);
                                    } else {
                                      setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId));
                                    }
                                  }}
                                />
                                <span>{role.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        <button
                          className="btn-update-roles"
                          onClick={() => {
                            if (window.confirm(`Update all roles for ${selectedUser.full_name}? This will replace all current roles.`)) {
                              updateUserRolesMutation.mutate({ userId: selectedUser.id, roleIds: selectedRoleIds });
                            }
                          }}
                          disabled={updateUserRolesMutation.isLoading}
                        >
                          {updateUserRolesMutation.isLoading ? 'Updating...' : 'Update All Roles'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {selectedUser.seller_application && (
                  <div className="detail-group">
                    <label>Seller Application</label>
                    <div className="seller-app-full">
                      <p><strong>Business Name:</strong> {selectedUser.seller_application.business_name}</p>
                      <p><strong>Address:</strong> {selectedUser.seller_application.business_address}</p>
                      {selectedUser.seller_application.business_pincode && (
                        <p><strong>Pincode:</strong> {selectedUser.seller_application.business_pincode}</p>
                      )}
                      <p><strong>Description:</strong> {selectedUser.seller_application.business_description}</p>
                      {selectedUser.seller_application.pan_card && (
                        <p><strong>PAN Card:</strong> {selectedUser.seller_application.pan_card}</p>
                      )}
                      {selectedUser.seller_application.aadhaar && (
                        <p><strong>Aadhaar:</strong> {selectedUser.seller_application.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 **** $3')}</p>
                      )}
                      {selectedUser.seller_application.account_number && (
                        <p><strong>Account Number:</strong> {selectedUser.seller_application.account_number.replace(/(\d{4})(\d+)(\d{4})/, '$1 **** $3')}</p>
                      )}
                      {selectedUser.seller_application.tax_id && (
                        <p><strong>Tax ID:</strong> {selectedUser.seller_application.tax_id}</p>
                      )}
                      <p><strong>Status:</strong> {selectedUser.seller_application.status}</p>
                      {selectedUser.seller_application.reviewed_by && (
                        <p><strong>Reviewed by:</strong> {selectedUser.seller_application.reviewed_by}</p>
                      )}
                      {selectedUser.seller_application.rejection_reason && (
                        <p><strong>Rejection Reason:</strong> {selectedUser.seller_application.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Selection Modal for Seller Approval */}
      <AnimatePresence>
        {showRoleSelection && (
          <motion.div
            className="user-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowRoleSelection(false);
              setSelectedRoleForApproval('');
              setPendingApplicationId(null);
            }}
          >
            <motion.div
              className="user-modal role-selection-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Select Role for Seller</h2>
                <button onClick={() => {
                  setShowRoleSelection(false);
                  setSelectedRoleForApproval('');
                  setPendingApplicationId(null);
                }}>✕</button>
              </div>
              <div className="modal-content">
                <div className="detail-group">
                  <label>Select Role to Assign:</label>
                  <p className="help-text">The seller will receive all permissions associated with the selected role.</p>
                  <select
                    className="role-select"
                    value={selectedRoleForApproval}
                    onChange={(e) => setSelectedRoleForApproval(e.target.value)}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    <option value="">-- Select a Role --</option>
                    {roles
                      .filter(role => role.status === 'active')
                      .map(role => {
                        const roleId = role.id || role._id;
                        return (
                          <option key={roleId} value={roleId}>
                            {role.name} {role.description ? `- ${role.description}` : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowRoleSelection(false);
                      setSelectedRoleForApproval('');
                      setPendingApplicationId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-approve"
                    onClick={confirmApproveWithRole}
                    disabled={!selectedRoleForApproval || approveSellerMutation.isLoading}
                  >
                    {approveSellerMutation.isLoading ? 'Approving...' : 'Approve & Assign Role'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;

