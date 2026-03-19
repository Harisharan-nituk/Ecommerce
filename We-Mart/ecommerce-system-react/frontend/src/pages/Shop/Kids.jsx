import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import { FiFilter, FiX } from 'react-icons/fi';
import './Shop.css';

const Kids = () => {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popularity');
  const selectedCategory = searchParams.get('category') || 'all';

  const { data, isLoading, error } = useQuery(
    ['kids-products', selectedCategory, priceRange, sortBy],
    () => {
      const params = {
        limit: 50,
        offset: 0,
        status: 'active',
        category: 'kids'
      };

      if (selectedCategory !== 'all') {
        params.subcategory = selectedCategory;
      }

      if (priceRange.min) params.min_price = priceRange.min;
      if (priceRange.max) params.max_price = priceRange.max;

      return productsAPI.getAll(params);
    }
  );

  const products = data?.data?.data || [];

  // Sort products
  const sortedProducts = React.useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-high':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  return (
    <div className="shop-page-myntra">
      <div className="shop-header-myntra">
        <div className="container-myntra">
          <h1 className="page-title-myntra">Kids</h1>
          <p className="page-subtitle-myntra">
            {selectedCategory !== 'all' ? selectedCategory : 'All Products'} - {sortedProducts.length} items
          </p>
        </div>
      </div>

      <div className="shop-container-myntra">
        <div className="container-myntra">
          <div className="shop-layout-myntra">
            {/* Filters Sidebar */}
            <aside className={`filters-sidebar-myntra ${showFilters ? 'open' : ''}`}>
              <div className="filters-header-myntra">
                <h3>Filters</h3>
                <button className="close-filters-btn" onClick={() => setShowFilters(false)}>
                  <FiX />
                </button>
              </div>

              <div className="filter-section-myntra">
                <h4 className="filter-title-myntra">Price</h4>
                <div className="price-filter-myntra">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="price-input-myntra"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="price-input-myntra"
                  />
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="products-main-myntra">
              <div className="products-toolbar-myntra">
                <button
                  className="filter-toggle-btn-myntra"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter /> Filters
                </button>
                <div className="sort-options-myntra">
                  <label>Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select-myntra"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <Loading message="Loading products..." />
              ) : error ? (
                <div className="error-message-myntra">
                  <p>Failed to load products. Please try again later.</p>
                </div>
              ) : sortedProducts.length === 0 ? (
                <EmptyState
                  icon="👶"
                  title="No products found"
                  message="Try adjusting your filters"
                />
              ) : (
                <div className="products-grid-myntra">
                  {sortedProducts.map((product, index) => (
                    <ProductCard key={product._id || product.id || index} product={product} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kids;
