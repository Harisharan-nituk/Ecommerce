import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiTrendingUp, FiDollarSign, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import { sellerAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import './Reports.css';

const EarningsReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');

  const { data, isLoading, error } = useQuery(
    ['seller-earnings-report', startDate, endDate, groupBy],
    () => sellerAPI.getEarningsReport({ start_date: startDate, end_date: endDate, group_by: groupBy }),
    { enabled: true, refetchOnWindowFocus: false }
  );

  const report = data?.data?.data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="seller-reports">
      <div className="report-header">
        <h1>
          <FiTrendingUp className="header-icon" />
          Earnings Report
        </h1>
        <p className="header-description">View your earnings and transaction history</p>
      </div>

      {/* Filters */}
      <div className="report-filters">
        <div className="filter-group">
          <label>
            <FiCalendar />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>
            <FiCalendar />
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Group By</label>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon total">
            <FiDollarSign />
          </div>
          <div className="summary-content">
            <h3>Total Earnings</h3>
            <p className="summary-value">
              ₹{report.summary?.total_earnings?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon available">
            <FiCheckCircle />
          </div>
          <div className="summary-content">
            <h3>Available Balance</h3>
            <p className="summary-value">
              ₹{report.summary?.available_balance?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon pending">
            <FiClock />
          </div>
          <div className="summary-content">
            <h3>Pending Balance</h3>
            <p className="summary-value">
              ₹{report.summary?.pending_balance?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon paid">
            <FiTrendingUp />
          </div>
          <div className="summary-content">
            <h3>Total Paid</h3>
            <p className="summary-value">
              ₹{report.summary?.total_paid?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Period Summary */}
      {report.period_summary && (
        <div className="report-section">
          <h2>Period Summary</h2>
          <div className="period-stats">
            <div className="stat-item">
              <span className="stat-label">Period Earnings:</span>
              <span className="stat-value">
                ₹{report.period_summary.total_earnings?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Transactions:</span>
              <span className="stat-value">{report.period_summary.transaction_count || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Available:</span>
              <span className="stat-value">
                ₹{report.period_summary.earnings_by_status?.available?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending:</span>
              <span className="stat-value">
                ₹{report.period_summary.earnings_by_status?.pending?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Earnings by Period */}
      {report.period_summary?.earnings_by_period && report.period_summary.earnings_by_period.length > 0 && (
        <div className="report-section">
          <h2>Earnings by Period</h2>
          <div className="period-chart">
            {report.period_summary.earnings_by_period.map((period, index) => (
              <div key={index} className="period-bar">
                <div className="period-label">{period.period}</div>
                <div className="period-bar-container">
                  <div
                    className="period-bar-fill"
                    style={{
                      width: `${(period.total_amount / report.period_summary.total_earnings) * 100}%`
                    }}
                  />
                </div>
                <div className="period-value">₹{period.total_amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="report-section">
        <h2>Recent Transactions</h2>
        {report.recent_transactions && report.recent_transactions.length > 0 ? (
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {report.recent_transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{new Date(transaction.created_at).toLocaleDateString()}</td>
                    <td>{transaction.description || 'Transaction'}</td>
                    <td>{transaction.reference_type}</td>
                    <td className="amount credit">+₹{transaction.amount?.toFixed(2) || '0.00'}</td>
                    <td>₹{transaction.balance_after?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No transactions found</div>
        )}
      </div>
    </div>
  );
};

export default EarningsReport;

