import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiX } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popularity');

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'categories',
    () => categoriesAPI.getAll(),
    { staleTime: 10 * 60 * 1000 }
  );

  // Fetch products
  const { data, isLoading, error } = useQuery(
    ['products', selectedCategory, search, priceRange, sortBy],
    () => {
      const params = {
        limit: 50,
        offset: 0,
        status: 'active'
      };

      if (search) {
        params.search = search;
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (priceRange.min) {
        params.min_price = priceRange.min;
      }

      if (priceRange.max) {
        params.max_price = priceRange.max;
      }

      return productsAPI.getAll(params);
    },
    { staleTime: 2 * 60 * 1000 }
  );

  const products = data?.data?.data || [];
  const categories = categoriesData?.data?.data || [];

  // Sort products
  const sortedProducts = useMemo(() => {
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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (priceRange.min) newParams.set('min_price', priceRange.min);
    if (priceRange.max) newParams.set('max_price', priceRange.max);
    setSearchParams(newParams);
  };

  return (
    <div className="products-page-myntra">
      <div className="products-header-myntra">
        <div className="container-myntra">
          <h1 className="page-title-myntra">
            {search ? `Search Results for "${search}"` : 'All Products'}
          </h1>
          <p className="page-subtitle-myntra">
            {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="products-container-myntra">
        <div className="container-myntra">
          <div className="products-layout-myntra">
            {/* Sidebar Filters - Myntra Style */}
            <aside className={`filters-sidebar-myntra ${showFilters ? 'open' : ''}`}>
              <div className="filters-header-myntra">
                <h3>Filters</h3>
                <button
                  className="close-filters-btn"
                  onClick={() => setShowFilters(false)}
                >
                  <FiX />
                </button>
              </div>

              {/* Category Filter */}
              <div className="filter-section-myntra">
                <h4 className="filter-title-myntra">Category</h4>
                <div className="filter-options-myntra">
                  <button
                    className={`filter-option-myntra ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id || category.id}
                      className={`filter-option-myntra ${selectedCategory === category.name?.toLowerCase() ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category.name?.toLowerCase())}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>


              {/* Price Filter */}
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
                  <button
                    className="btn-apply-filter-myntra"
                    onClick={handlePriceFilter}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="products-main-myntra">
              {/* Toolbar */}
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

              {/* Products Grid */}
              {isLoading ? (
                <Loading message="Loading products..." />
              ) : error ? (
                <div className="error-message-myntra">
                  <p>Failed to load products. Please try again later.</p>
                </div>
              ) : sortedProducts.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="No products found"
                  message="Try adjusting your filters or search terms"
                />
              ) : (
                <div className="products-grid-myntra">
                  {sortedProducts.map((product, index) => (
                    <motion.div
                      key={product._id || product.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
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

export default Products;
