import React from 'react';
import { useQuery } from 'react-query';
import { FiCreditCard, FiDollarSign, FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi';
import './SellerWallets.css';

const SellerWallets = () => {
  // TODO: Replace with actual API call
  const { data: walletsData, isLoading } = useQuery('admin-seller-wallets', async () => {
    // Placeholder - implement actual API call
    return { data: { data: [] } };
  });

  const wallets = walletsData?.data?.data || [];

  const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.available_balance || 0), 0);
  const totalPending = wallets.reduce((sum, wallet) => sum + (wallet.pending_balance || 0), 0);
  const totalEarnings = wallets.reduce((sum, wallet) => sum + (wallet.total_earnings || 0), 0);

  return (
    <div className="admin-seller-wallets">
      <div className="page-header">
        <h1>
          <FiCreditCard className="header-icon" />
          Manage Seller Wallets
        </h1>
        <p className="page-description">View and manage seller wallet balances and transactions</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiCreditCard />
          </div>
          <div className="stat-content">
            <h3>Total Balance</h3>
            <p className="stat-value">${totalBalance.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>Pending Balance</h3>
            <p className="stat-value">${totalPending.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon earnings">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">${totalEarnings.toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon sellers">
            <FiTrendingDown />
          </div>
          <div className="stat-content">
            <h3>Active Sellers</h3>
            <p className="stat-value">{wallets.length}</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Seller Wallets</h2>
          <input
            type="text"
            placeholder="Search sellers..."
            className="search-input"
          />
        </div>

        {isLoading ? (
          <div className="loading-state">Loading wallets...</div>
        ) : wallets.length === 0 ? (
          <div className="empty-state">
            <FiAlertCircle className="empty-icon" />
            <p>No seller wallets found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="wallets-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Available Balance</th>
                  <th>Pending Balance</th>
                  <th>Total Earnings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet._id}>
                    <td>
                      <div className="seller-info">
                        <div className="seller-avatar">
                          {wallet.seller_id?.first_name?.[0] || 'S'}
                        </div>
                        <div>
                          <div className="seller-name">
                            {wallet.seller_id?.first_name} {wallet.seller_id?.last_name}
                          </div>
                          <div className="seller-email">{wallet.seller_id?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="amount available">${wallet.available_balance?.toFixed(2) || '0.00'}</td>
                    <td className="amount pending">${wallet.pending_balance?.toFixed(2) || '0.00'}</td>
                    <td className="amount earnings">${wallet.total_earnings?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`status-badge status-${wallet.status || 'active'}`}>
                        {wallet.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary">View Details</button>
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

export default SellerWallets;

