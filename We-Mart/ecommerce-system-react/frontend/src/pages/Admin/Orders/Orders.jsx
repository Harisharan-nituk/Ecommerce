import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ordersAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import './Orders.css';

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('admin-orders', () =>
    ordersAPI.getAllAdmin({ limit: 50 })
  );

  const updateStatusMutation = useMutation(
    ({ id, status }) => ordersAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-orders');
        toast.success('Order status updated');
      },
      onError: () => {
        toast.error('Failed to update order status');
      },
    }
  );

  const orders = data?.data?.data || [];

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <div className="admin-orders">
      <div className="container">
        <h1>Manage Orders</h1>

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      {order.first_name} {order.last_name}
                    </td>
                    <td>${order.total_amount}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{format(new Date(order.created_at), 'MMM dd, yyyy')}</td>
                    <td>
                      <button className="btn btn-secondary">View</button>
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

export default AdminOrders;

