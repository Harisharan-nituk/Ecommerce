import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiPercent, FiShoppingBag, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { sellerAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import './Reports.css';

const CommissionReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, error } = useQuery(
    ['seller-commission-report', startDate, endDate],
    () => sellerAPI.getCommissionReport({ start_date: startDate, end_date: endDate }),
    { enabled: true, refetchOnWindowFocus: false }
  );

  const report = data?.data?.data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="seller-reports">
      <div className="report-header">
        <h1>
          <FiPercent className="header-icon" />
          Commission Report
        </h1>
        <p className="header-description">View your commission breakdown by orders and rules</p>
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
      </div>

      {/* Summary */}
      {report.summary && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <FiShoppingBag />
            </div>
            <div className="summary-content">
              <h3>Total Orders</h3>
              <p className="summary-value">{report.summary.total_orders || 0}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <h3>Total Order Value</h3>
              <p className="summary-value">
                ₹{report.summary.total_order_value?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiTrendingUp />
            </div>
            <div className="summary-content">
              <h3>Total Commission</h3>
              <p className="summary-value">
                ₹{report.summary.total_commission?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <h3>Net Payout</h3>
              <p className="summary-value">
                ₹{report.summary.total_net_payout?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Commission by Rule */}
      {report.commission_by_rule && report.commission_by_rule.length > 0 && (
        <div className="report-section">
          <h2>Commission by Rule</h2>
          <div className="rules-grid">
            {report.commission_by_rule.map((rule, index) => (
              <div key={index} className="rule-card">
                <h3>{rule.rule_name}</h3>
                <div className="rule-details">
                  <div className="rule-detail-item">
                    <span>Type:</span>
                    <span>{rule.rule_type}</span>
                  </div>
                  <div className="rule-detail-item">
                    <span>Orders:</span>
                    <span>{rule.count}</span>
                  </div>
                  <div className="rule-detail-item">
                    <span>Total Commission:</span>
                    <span className="amount">₹{rule.total_commission?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      {report.orders && report.orders.length > 0 && (
        <div className="report-section">
          <h2>Recent Orders</h2>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date</th>
                  <th>Order Value</th>
                  <th>Platform Fee</th>
                  <th>Seller Earning</th>
                  <th>Commission</th>
                  <th>Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {report.orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.order_number || order._id}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>₹{order.total_amount?.toFixed(2) || '0.00'}</td>
                    <td>₹{order.platform_fee?.toFixed(2) || '0.00'}</td>
                    <td>₹{order.seller_earning?.toFixed(2) || '0.00'}</td>
                    <td className="amount">₹{order.commission?.toFixed(2) || '0.00'}</td>
                    <td className="amount net">₹{order.net_payout?.toFixed(2) || '0.00'}</td>
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

export default CommissionReport;

