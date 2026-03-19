import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useHasPermission } from '../../../hooks/usePermissions';
import Loading from '../../../components/Loading/Loading';
import { toast } from 'react-toastify';
import './Products.css';

const SellerProducts = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const canManageProducts = useHasPermission('vendor.product.manage_own');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchProducts();
  }, [isAuthenticated, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getMyProducts();
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
      console.error('Products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await sellerAPI.deleteProduct(productId);
      if (response.data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleStatusChange = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await sellerAPI.updateProduct(productId, { status: newStatus });
      if (response.data.success) {
        toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product status');
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  if (!canManageProducts) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to manage products.</p>
        <p>Required permission: <strong>vendor.product.manage_own</strong></p>
        <p>Please contact admin to assign this permission.</p>
      </div>
    );
  }

  return (
    <div className="seller-products">
      <div className="products-header">
        <h1>My Products</h1>
        <button
          className="btn-primary"
          onClick={() => navigate('/seller/products/new')}
        >
          ➕ Add New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No products yet</h2>
          <p>Start selling by adding your first product!</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/seller/products/new')}
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id || product._id} className="product-card">
              <div className="product-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <div className={`status-badge ${product.status}`}>
                  {product.status}
                </div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">
                  {product.description || 'No description'}
                </p>
                <div className="product-details">
                  <div className="price">${product.price?.toFixed(2)}</div>
                  <div className="stock">
                    Stock: {product.stock || 0}
                    {product.stock < 10 && (
                      <span className="low-stock-warning"> ⚠️ Low Stock</span>
                    )}
                  </div>
                </div>
                <div className="product-actions">
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/seller/products/${product.id || product._id}/edit`)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className={`btn-status ${product.status === 'active' ? 'active' : 'inactive'}`}
                    onClick={() => handleStatusChange(product.id || product._id, product.status)}
                  >
                    {product.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(product.id || product._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;

