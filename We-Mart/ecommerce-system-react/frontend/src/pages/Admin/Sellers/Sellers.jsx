import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiUsers, FiUserCheck, FiUserX, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { usersAPI } from '../../../services/api';
import './Sellers.css';

const Sellers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch sellers - users with seller roles
  const { data: sellersData, isLoading, error } = useQuery(
    ['admin-sellers', statusFilter, searchTerm],
    async () => {
      // Filter for seller roles
      const sellerRoles = ['Vendor/Seller', 'Seller', 'seller', 'Vendor', 'vendor'];
      const allUsers = await usersAPI.getAll({ 
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm 
      });
      
      // Filter users who have any seller role
      const sellers = allUsers.data.data.filter(user => 
        user.roles && user.roles.some(role => 
          sellerRoles.includes(role)
        )
      );
      
      return { data: { data: sellers } };
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const sellers = sellersData?.data?.data || [];

  const stats = {
    total: sellers.length,
    active: sellers.filter(s => s.status === 'active').length,
    inactive: sellers.filter(s => s.status === 'inactive').length,
  };

  return (
    <div className="admin-sellers">
      <div className="page-header">
        <h1>
          <FiUsers className="header-icon" />
          Manage Sellers
        </h1>
        <p className="page-description">View and manage seller accounts</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>Total Sellers</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FiUserCheck />
          </div>
          <div className="stat-content">
            <h3>Active</h3>
            <p className="stat-value">{stats.active}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <FiUserX />
          </div>
          <div className="stat-content">
            <h3>Inactive</h3>
            <p className="stat-value">{stats.inactive}</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Sellers List</h2>
          <div className="header-actions">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search sellers..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading sellers...</div>
        ) : error ? (
          <div className="error-state">
            <FiAlertCircle className="error-icon" />
            <p>Failed to load sellers: {error.message}</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="empty-state">
            <FiAlertCircle className="empty-icon" />
            <p>No sellers found</p>
            {searchTerm && <p className="empty-hint">Try adjusting your search or filters</p>}
          </div>
        ) : (
          <div className="table-container">
            <table className="sellers-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller._id}>
                    <td>
                      <div className="seller-info">
                        <div className="seller-avatar">
                          {seller.first_name?.[0] || 'S'}
                        </div>
                        <div>
                          <div className="seller-name">
                            {seller.first_name} {seller.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{seller.email}</td>
                    <td>{seller.phone || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${seller.status || 'active'}`}>
                        {seller.status || 'Active'}
                      </span>
                    </td>
                    <td>{seller.created_at ? new Date(seller.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => window.location.href = `/admin/users/${seller.id}`}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sellers;

