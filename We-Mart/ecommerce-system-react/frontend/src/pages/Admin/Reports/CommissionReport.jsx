import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiPercent, FiTrendingUp, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import { adminAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import './AdminReports.css';

const AdminCommissionReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, error } = useQuery(
    ['admin-commission-report', startDate, endDate],
    () => adminAPI.getCommissionReport({ start_date: startDate, end_date: endDate }),
    { enabled: true, refetchOnWindowFocus: false }
  );

  const report = data?.data?.data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="admin-reports">
      <div className="report-header">
        <h1>
          <FiPercent className="header-icon" />
          Commission Report
        </h1>
        <p className="header-description">View commission breakdown across all sellers</p>
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
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <h3>Total Platform Fee</h3>
              <p className="summary-value">
                ₹{report.summary.total_platform_fee?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiPercent />
            </div>
            <div className="summary-content">
              <h3>Total Commission</h3>
              <p className="summary-value">
                ₹{report.summary.total_commission?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Commission by Rule */}
      {report.commission_by_rule && report.commission_by_rule.length > 0 && (
        <div className="report-section">
          <h2>Commission by Rule</h2>
          <div className="rules-table">
            <table>
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Rule Type</th>
                  <th>Order Count</th>
                  <th>Total Commission</th>
                </tr>
              </thead>
              <tbody>
                {report.commission_by_rule.map((rule, index) => (
                  <tr key={index}>
                    <td>{rule.rule_name}</td>
                    <td>{rule.rule_type}</td>
                    <td>{rule.order_count}</td>
                    <td className="amount">₹{rule.total_commission?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Sellers */}
      {report.top_sellers && report.top_sellers.length > 0 && (
        <div className="report-section">
          <h2>Top Sellers by Commission</h2>
          <div className="top-sellers-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Seller Name</th>
                  <th>Orders</th>
                  <th>Total Commission</th>
                  <th>Total Earning</th>
                </tr>
              </thead>
              <tbody>
                {report.top_sellers.map((seller, index) => (
                  <tr key={seller.seller_id}>
                    <td>#{index + 1}</td>
                    <td>{seller.seller_name || seller.seller_id}</td>
                    <td>{seller.order_count}</td>
                    <td className="amount">₹{seller.total_commission?.toFixed(2) || '0.00'}</td>
                    <td className="amount">₹{seller.total_earning?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {report.recent_orders && report.recent_orders.length > 0 && (
        <div className="report-section">
          <h2>Recent Orders</h2>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Seller</th>
                  <th>Date</th>
                  <th>Order Value</th>
                  <th>Platform Fee</th>
                  <th>Commission</th>
                  <th>Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {report.recent_orders.slice(0, 20).map((order) => (
                  <tr key={order._id}>
                    <td>{order.order_number || order._id}</td>
                    <td>
                      {order.seller_id?.first_name} {order.seller_id?.last_name}
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>₹{order.total_amount?.toFixed(2) || '0.00'}</td>
                    <td>₹{order.platform_fee?.toFixed(2) || '0.00'}</td>
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

export default AdminCommissionReport;

