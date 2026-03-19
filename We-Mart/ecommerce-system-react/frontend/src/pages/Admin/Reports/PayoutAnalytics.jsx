import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiTrendingUp, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { adminAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import './AdminReports.css';

const PayoutAnalytics = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');

  const { data, isLoading, error } = useQuery(
    ['admin-payout-analytics', startDate, endDate, groupBy],
    () => adminAPI.getPayoutAnalytics({ start_date: startDate, end_date: endDate, group_by: groupBy }),
    { enabled: true, refetchOnWindowFocus: false }
  );

  const analytics = data?.data?.data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="admin-reports">
      <div className="report-header">
        <h1>
          <FiBarChart2 className="header-icon" />
          Payout Analytics
        </h1>
        <p className="header-description">Comprehensive payout analytics and insights</p>
      </div>

      {/* Filters */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
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

      {/* Summary */}
      {analytics.summary && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <h3>Total Payouts</h3>
              <p className="summary-value">{analytics.summary.total_payouts || 0}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <h3>Total Amount</h3>
              <p className="summary-value">
                ₹{analytics.summary.total_amount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiTrendingUp />
            </div>
            <div className="summary-content">
              <h3>Average Payout</h3>
              <p className="summary-value">
                ₹{analytics.summary.average_payout?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <h3>Total Fees</h3>
              <p className="summary-value">
                ₹{analytics.summary.total_fees?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payouts by Period */}
      {analytics.payouts_by_period && analytics.payouts_by_period.length > 0 && (
        <div className="report-section">
          <h2>Payouts by Period</h2>
          <div className="period-chart">
            {analytics.payouts_by_period.map((period, index) => (
              <div key={index} className="period-bar">
                <div className="period-label">{period.period}</div>
                <div className="period-bar-container">
                  <div
                    className="period-bar-fill"
                    style={{
                      width: `${(period.total_amount / analytics.summary.total_amount) * 100}%`
                    }}
                  />
                </div>
                <div className="period-value">
                  ₹{period.total_amount?.toFixed(2) || '0.00'} ({period.count})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payouts by Method */}
      {analytics.payouts_by_method && analytics.payouts_by_method.length > 0 && (
        <div className="report-section">
          <h2>Payouts by Method</h2>
          <div className="method-grid">
            {analytics.payouts_by_method.map((method, index) => (
              <div key={index} className="method-card">
                <h3>{method.method.replace('_', ' ').toUpperCase()}</h3>
                <div className="method-stats">
                  <div>Count: {method.count}</div>
                  <div>Amount: ₹{method.total_amount?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Sellers */}
      {analytics.top_sellers && analytics.top_sellers.length > 0 && (
        <div className="report-section">
          <h2>Top Sellers by Payout</h2>
          <div className="top-sellers-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Seller ID</th>
                  <th>Payout Count</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {analytics.top_sellers.map((seller, index) => (
                  <tr key={seller.seller_id}>
                    <td>#{index + 1}</td>
                    <td>{seller.seller_id}</td>
                    <td>{seller.count}</td>
                    <td className="amount">₹{seller.total_amount?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutAnalytics;

