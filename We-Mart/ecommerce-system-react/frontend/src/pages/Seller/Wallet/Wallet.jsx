import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { FiCreditCard, FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { sellerAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import './Wallet.css';

const SellerWallet = () => {
  const { data: walletData, isLoading, error, refetch } = useQuery(
    'seller-wallet',
    () => sellerAPI.getWallet(),
    { refetchOnWindowFocus: false }
  );

  const { data: transactionsData } = useQuery(
    'seller-wallet-transactions',
    () => sellerAPI.getTransactions(),
    { refetchOnWindowFocus: false }
  );

  const wallet = walletData?.data?.data || {};
  const transactions = transactionsData?.data?.data || [];

  if (isLoading) return <Loading />;

  return (
    <div className="seller-wallet">
      <div className="wallet-header">
        <h1>
          <FiCreditCard className="header-icon" />
          My Wallet
        </h1>
        <p className="header-description">Manage your earnings and payouts</p>
      </div>

      {error && (
        <div className="error-banner">
          <FiAlertCircle />
          <span>{error.response?.data?.message || 'Failed to load wallet information'}</span>
        </div>
      )}

      {/* Wallet Balance Cards */}
      <div className="wallet-balance-grid">
        <div className="balance-card available">
          <div className="balance-icon">
            <FiDollarSign />
          </div>
          <div className="balance-content">
            <h3>Available Balance</h3>
            <p className="balance-amount">
              ₹{wallet.available_balance?.toFixed(2) || '0.00'}
            </p>
            <span className="balance-label">Ready for withdrawal</span>
          </div>
        </div>

        <div className="balance-card pending">
          <div className="balance-icon">
            <FiClock />
          </div>
          <div className="balance-content">
            <h3>Pending Balance</h3>
            <p className="balance-amount">
              ₹{wallet.pending_balance?.toFixed(2) || '0.00'}
            </p>
            <span className="balance-label">Awaiting order delivery</span>
          </div>
        </div>

        <div className="balance-card total">
          <div className="balance-icon">
            <FiTrendingUp />
          </div>
          <div className="balance-content">
            <h3>Total Earnings</h3>
            <p className="balance-amount">
              ₹{wallet.total_earnings?.toFixed(2) || '0.00'}
            </p>
            <span className="balance-label">All-time earnings</span>
          </div>
        </div>

        <div className="balance-card paid">
          <div className="balance-icon">
            <FiCheckCircle />
          </div>
          <div className="balance-content">
            <h3>Total Paid</h3>
            <p className="balance-amount">
              ₹{wallet.total_paid?.toFixed(2) || '0.00'}
            </p>
            <span className="balance-label">Amount withdrawn</span>
          </div>
        </div>
      </div>

      {/* Wallet Actions */}
      <div className="wallet-actions">
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/seller/payouts'}
        >
          Request Payout
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => refetch()}
        >
          Refresh Balance
        </button>
      </div>

      {/* Reports Section */}
      <div className="reports-section">
        <h2>Reports & Analytics</h2>
        <div className="reports-grid">
          <Link to="/seller/reports/earnings" className="report-card">
            <div className="report-icon">
              <FiTrendingUp />
            </div>
            <h3>Earnings Report</h3>
            <p>View your earnings breakdown and trends</p>
          </Link>
          <Link to="/seller/reports/commissions" className="report-card">
            <div className="report-icon">
              <FiDollarSign />
            </div>
            <h3>Commission Report</h3>
            <p>View commission breakdown by orders</p>
          </Link>
          <Link to="/seller/reports/payouts" className="report-card">
            <div className="report-icon">
              <FiCheckCircle />
            </div>
            <h3>Payout Report</h3>
            <p>View payout history and status</p>
          </Link>
        </div>
      </div>

      {/* Transaction History */}
      <div className="transactions-section">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <div className="empty-transactions">
            <FiAlertCircle className="empty-icon" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="transaction-item">
                <div className="transaction-icon">
                  {transaction.transaction_type === 'credit' ? (
                    <FiTrendingUp className="credit" />
                  ) : (
                    <FiTrendingUp className="debit" style={{ transform: 'rotate(180deg)' }} />
                  )}
                </div>
                <div className="transaction-details">
                  <h4>{transaction.description || 'Transaction'}</h4>
                  <p className="transaction-meta">
                    {transaction.reference_type} • {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="transaction-amount">
                  <span className={`amount ${transaction.transaction_type}`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}
                    ₹{transaction.amount?.toFixed(2) || '0.00'}
                  </span>
                  <span className="balance-after">
                    Balance: ₹{transaction.balance_after?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerWallet;

