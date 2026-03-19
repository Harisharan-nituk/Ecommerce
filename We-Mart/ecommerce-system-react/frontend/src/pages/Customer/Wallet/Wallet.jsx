import React from 'react';
import { useQuery } from 'react-query';
import { FiCreditCard, FiDollarSign, FiTrendingUp, FiTrendingDown, FiClock, FiAlertCircle } from 'react-icons/fi';
import { customerAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import './Wallet.css';

const CustomerWallet = () => {
  const { data: walletData, isLoading, error } = useQuery(
    'customer-wallet',
    () => customerAPI.getWalletSummary(),
    { refetchOnWindowFocus: false }
  );

  const { data: transactionsData } = useQuery(
    'customer-wallet-transactions',
    () => customerAPI.getWalletTransactions({ limit: 20 }),
    { refetchOnWindowFocus: false }
  );

  const wallet = walletData?.data?.data?.wallet || {};
  const transactions = transactionsData?.data?.data || [];

  if (isLoading) return <Loading />;

  return (
    <div className="customer-wallet">
      <div className="wallet-header">
        <h1>
          <FiCreditCard className="header-icon" />
          My Wallet
        </h1>
        <p className="header-description">Manage your wallet balance and transactions</p>
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
            <span className="balance-label">Ready to use</span>
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
            <span className="balance-label">Awaiting confirmation</span>
          </div>
        </div>

        <div className="balance-card total">
          <div className="balance-icon">
            <FiTrendingUp />
          </div>
          <div className="balance-content">
            <h3>Total Credited</h3>
            <p className="balance-amount">
              ₹{wallet.total_credited?.toFixed(2) || '0.00'}
            </p>
            <span className="balance-label">All-time credits</span>
          </div>
        </div>

        <div className="balance-card used">
          <div className="balance-icon">
            <FiTrendingDown />
          </div>
          <div className="balance-content">
            <h3>Total Used</h3>
            <p className="balance-amount">
              ₹{wallet.total_debited?.toFixed(2) || '0.00'}
            </p>
            <span className="balance-label">Amount spent</span>
          </div>
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
                    <FiTrendingDown className="debit" />
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

export default CustomerWallet;

