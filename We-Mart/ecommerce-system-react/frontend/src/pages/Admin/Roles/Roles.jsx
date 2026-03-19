import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiShield,
  FiCheckSquare,
  FiSquare,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';
import { rolesAPI, permissionsAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading/Loading';
import './Roles.css';

const Roles = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery(
    'roles',
    () => rolesAPI.getAll(),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery(
    'permissions',
    () => permissionsAPI.getAll(),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const roles = rolesData?.data?.data || [];
  const permissions = permissionsData?.data?.data?.permissions || [];
  const groupedPermissions = permissionsData?.data?.data?.grouped || {};

  // Create role mutation
  const createRoleMutation = useMutation(
    (data) => rolesAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
        setIsCreating(false);
        setNewRole({ name: '', description: '' });
        toast.success('Role created successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create role');
      },
    }
  );

  // Update role mutation
  const updateRoleMutation = useMutation(
    ({ id, data }) => rolesAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
        setSelectedRole(null);
        toast.success('Role updated successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update role');
      },
    }
  );

  // Delete role mutation
  const deleteRoleMutation = useMutation(
    (id) => rolesAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
        if (selectedRole?.id === id) {
          setSelectedRole(null);
        }
        toast.success('Role deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete role');
      },
    }
  );

  // Assign permissions mutation
  const assignPermissionsMutation = useMutation(
    ({ roleId, permissions }) => rolesAPI.assignPermissions(roleId, permissions),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
        toast.success('Permissions assigned successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to assign permissions');
      },
    }
  );

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    createRoleMutation.mutate(newRole);
  };

  const handleUpdateRole = () => {
    if (!selectedRole.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    updateRoleMutation.mutate({
      id: selectedRole.id,
      data: {
        name: selectedRole.name,
        description: selectedRole.description,
      },
    });
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    if (!selectedRole) return;

    const currentPermissions = selectedRole.permissions.map(p => p.id);
    const isSelected = currentPermissions.includes(permissionId);

    const newPermissions = isSelected
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];

    setSelectedRole({
      ...selectedRole,
      permissions: newPermissions.map(id => {
        const perm = permissions.find(p => p.id === id);
        return perm || { id };
      }),
    });
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;

    const permissionIds = selectedRole.permissions.map(p => p.id);
    assignPermissionsMutation.mutate({
      roleId: selectedRole.id,
      permissions: permissionIds,
    });
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const modules = Object.keys(groupedPermissions);

  if (rolesLoading || permissionsLoading) {
    return <Loading message="Loading roles and permissions..." />;
  }

  return (
    <div className="roles-page">
      <div className="roles-header">
        <h1>
          <FiShield />
          Role Management
        </h1>
        <p>Manage roles and assign permissions to control access</p>
      </div>

      <div className="roles-container">
        {/* Roles List */}
        <div className="roles-sidebar">
          <div className="roles-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary btn-create"
            onClick={() => {
              setIsCreating(true);
              setSelectedRole(null);
            }}
          >
            <FiPlus />
            Create Role
          </button>

          <div className="roles-list">
            {filteredRoles.map((role) => (
              <motion.div
                key={role.id}
                className={`role-item ${selectedRole?.id === role.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRole(role);
                  setIsCreating(false);
                }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="role-item-header">
                  <h3>{role.name}</h3>
                  <span className="permission-count">
                    {role.permissions?.length || 0} permissions
                  </span>
                </div>
                <p className="role-description">{role.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Role Details */}
        <div className="roles-content">
          {isCreating ? (
            <motion.div
              className="role-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>Create New Role</h2>
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Content Manager"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Role description..."
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleCreateRole}
                  disabled={createRoleMutation.isLoading}
                >
                  <FiSave />
                  Create Role
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsCreating(false);
                    setNewRole({ name: '', description: '' });
                  }}
                >
                  <FiX />
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : selectedRole ? (
            <motion.div
              className="role-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="role-details-header">
                <div>
                  <h2>{selectedRole.name}</h2>
                  <p>{selectedRole.description}</p>
                </div>
                <div className="role-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedRole(null)}
                  >
                    <FiX />
                    Close
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteRole(selectedRole.id)}
                    disabled={deleteRoleMutation.isLoading}
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>
              </div>

              <div className="role-edit-section">
                <h3>Edit Role</h3>
                <div className="form-group">
                  <label>Role Name *</label>
                  <input
                    type="text"
                    value={selectedRole.name}
                    onChange={(e) =>
                      setSelectedRole({ ...selectedRole, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={selectedRole.description || ''}
                    onChange={(e) =>
                      setSelectedRole({ ...selectedRole, description: e.target.value })
                    }
                    rows="3"
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateRole}
                  disabled={updateRoleMutation.isLoading}
                >
                  <FiSave />
                  Save Changes
                </button>
              </div>

              <div className="permissions-section">
                <div className="permissions-header">
                  <h3>Assign Permissions</h3>
                  <div className="module-filter">
                    <FiFilter />
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                    >
                      <option value="all">All Modules</option>
                      {modules.map((module) => (
                        <option key={module} value={module}>
                          {module.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="permissions-list">
                  {Object.entries(groupedPermissions).map(([module, perms]) => {
                    if (selectedModule !== 'all' && selectedModule !== module) {
                      return null;
                    }
                    return (
                      <div key={module} className="permission-module">
                        <h4 className="module-title">{module.toUpperCase()}</h4>
                        <div className="permission-items">
                          {perms.map((permission) => {
                            const isSelected = selectedRole.permissions?.some(
                              p => p.id === permission.id
                            );
                            return (
                              <motion.label
                                key={permission.id}
                                className={`permission-item ${isSelected ? 'selected' : ''}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                />
                                <span className="checkmark">
                                  {isSelected ? <FiCheckSquare /> : <FiSquare />}
                                </span>
                                <div className="permission-info">
                                  <span className="permission-name">{permission.name}</span>
                                  <span className="permission-desc">{permission.description}</span>
                                </div>
                              </motion.label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="permissions-actions">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSavePermissions}
                    disabled={assignPermissionsMutation.isLoading}
                  >
                    <FiSave />
                    Save Permissions
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="empty-selection">
              <FiShield />
              <h3>Select a role to manage</h3>
              <p>Choose a role from the list to view and edit its permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roles;

