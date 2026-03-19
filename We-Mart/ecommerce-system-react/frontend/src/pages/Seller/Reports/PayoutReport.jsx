import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { sellerAPI } from '../../../services/api';
import Loading from '../../../components/Loading/Loading';
import './Reports.css';

const PayoutReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, error } = useQuery(
    ['seller-payout-report', startDate, endDate, statusFilter],
    () => sellerAPI.getPayoutReport({ 
      start_date: startDate, 
      end_date: endDate,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    { enabled: true, refetchOnWindowFocus: false }
  );

  const report = data?.data?.data || {};

  if (isLoading) return <Loading />;

  return (
    <div className="seller-reports">
      <div className="report-header">
        <h1>
          <FiDollarSign className="header-icon" />
          Payout Report
        </h1>
        <p className="header-description">View your payout history and status</p>
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
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      {report.summary && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <h3>Total Requests</h3>
              <p className="summary-value">{report.summary.total_requests || 0}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <h3>Total Requested</h3>
              <p className="summary-value">
                ₹{report.summary.total_requested?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiCheckCircle />
            </div>
            <div className="summary-content">
              <h3>Total Paid</h3>
              <p className="summary-value">
                ₹{report.summary.total_paid?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiClock />
            </div>
            <div className="summary-content">
              <h3>Total Pending</h3>
              <p className="summary-value">
                ₹{report.summary.total_pending?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payouts by Status */}
      {report.payouts_by_status && Object.keys(report.payouts_by_status).length > 0 && (
        <div className="report-section">
          <h2>Payouts by Status</h2>
          <div className="status-grid">
            {Object.entries(report.payouts_by_status).map(([status, data]) => (
              <div key={status} className="status-card">
                <h3>{status.toUpperCase()}</h3>
                <div className="status-stats">
                  <div>Count: {data.count}</div>
                  <div>Amount: ₹{data.total_amount?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payouts List */}
      {report.payouts && report.payouts.length > 0 ? (
        <div className="report-section">
          <h2>Payout History</h2>
          <div className="payouts-table">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Processing Fee</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                  <th>UTR</th>
                </tr>
              </thead>
              <tbody>
                {report.payouts.map((payout) => (
                  <tr key={payout._id}>
                    <td>{payout.request_id}</td>
                    <td>{new Date(payout.created_at).toLocaleDateString()}</td>
                    <td>₹{payout.amount?.toFixed(2) || '0.00'}</td>
                    <td>₹{payout.fees?.processing_fee?.toFixed(2) || '0.00'}</td>
                    <td className="amount net">₹{payout.fees?.net_amount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`status-badge status-${payout.status}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td>{payout.utr || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <FiAlertCircle className="empty-icon" />
          <p>No payouts found</p>
        </div>
      )}
    </div>
  );
};

export default PayoutReport;

