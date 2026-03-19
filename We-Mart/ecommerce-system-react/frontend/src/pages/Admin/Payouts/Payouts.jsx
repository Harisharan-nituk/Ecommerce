import React from 'react';
import { useQuery } from 'react-query';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import './Payouts.css';

const Payouts = () => {
  // TODO: Replace with actual API call
  const { data: payoutsData, isLoading } = useQuery('admin-payouts', async () => {
    // Placeholder - implement actual API call
    return { data: { data: [] } };
  });

  const payouts = payoutsData?.data?.data || [];

  const stats = {
    total: payouts.length,
    pending: payouts.filter(p => p.status === 'pending').length,
    approved: payouts.filter(p => p.status === 'approved').length,
    rejected: payouts.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="admin-payouts">
      <div className="page-header">
        <h1>
          <FiDollarSign className="header-icon" />
          Manage Payouts
        </h1>
        <p className="page-description">Review and manage seller payout requests</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>Total Payouts</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>Approved</h3>
            <p className="stat-value">{stats.approved}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected">
            <FiXCircle />
          </div>
          <div className="stat-content">
            <h3>Rejected</h3>
            <p className="stat-value">{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Payout Requests</h2>
          <div className="filters">
            <select className="filter-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading payouts...</div>
        ) : payouts.length === 0 ? (
          <div className="empty-state">
            <FiAlertCircle className="empty-icon" />
            <p>No payout requests found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="payouts-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Seller</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Request Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout._id}>
                    <td>{payout.payout_id}</td>
                    <td>{payout.seller_id?.name || 'N/A'}</td>
                    <td>${payout.amount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`status-badge status-${payout.status}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td>{new Date(payout.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-primary">View</button>
                        {payout.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-success">Approve</button>
                            <button className="btn btn-sm btn-danger">Reject</button>
                          </>
                        )}
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

export default Payouts;

