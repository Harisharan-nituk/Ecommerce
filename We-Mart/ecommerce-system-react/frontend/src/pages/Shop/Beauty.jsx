import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './Shop.css';

// Beauty subcategories structure
const beautySubcategories = [
  {
    title: 'Makeup',
    items: [
      'Lipstick',
      'Lip Gloss',
      'Lip Liner',
      'Mascara',
      'Eyeliner',
      'Kajal',
      'Eyeshadow',
      'Foundation',
      'Primer',
      'Concealer',
      'Compact',
      'Nail Polish'
    ]
  },
  {
    title: 'Skincare, Bath & Body',
    items: [
      'Face Moisturiser',
      'Cleanser',
      'Masks & Peel',
      'Sunscreen',
      'Serum',
      'Face Wash',
      'Eye Cream',
      'Lip Balm',
      'Body Lotion',
      'Body Wash',
      'Body Scrub',
      'Hand Cream'
    ]
  },
  {
    title: 'Baby Care',
    items: ['Masks']
  },
  {
    title: 'Haircare',
    items: [
      'Shampoo',
      'Conditioner',
      'Hair Cream',
      'Hair Oil',
      'Hair Gel',
      'Hair Color',
      'Hair Serum',
      'Hair Accessory'
    ]
  },
  {
    title: 'Fragrances',
    items: ['Perfume', 'Deodorant', 'Body Mist']
  },
  {
    title: 'Appliances',
    items: ['Hair Straightener', 'Hair Dryer', 'Epilator']
  },
  {
    title: "Men's Grooming",
    items: ['Trimmers', 'Beard Oil', 'Hair Wax']
  },
  {
    title: 'Beauty Gift & Makeup Set',
    items: ['Beauty Gift', 'Makeup Kit']
  },
  {
    title: 'Premium Beauty',
    items: []
  },
  {
    title: 'Wellness & Hygiene',
    items: []
  },
  {
    title: 'Top Brands',
    items: [
      'Lakme',
      'Maybelline',
      'LOreal',
      'Philips',
      'Bath & Body Works',
      'THE BODY SHOP',
      'Biotique',
      'Mamaearth',
      'MCaffeine',
      'Nivea',
      'Lotus Herbals',
      'LOreal Professionnel',
      'KAMA AYURVEDA',
      'M.A.C',
      'Forest Essentials'
    ]
  }
];

const Beauty = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('category') || '');
  const [expandedSections, setExpandedSections] = useState(() => {
    // Expand all sections by default
    const expanded = {};
    beautySubcategories.forEach(section => {
      expanded[section.title] = true;
    });
    return expanded;
  });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popularity');
  const selectedCategory = selectedSubcategory || 'all';

  const { data, isLoading, error } = useQuery(
    ['beauty-products', selectedCategory, priceRange, sortBy],
    () => {
      const params = {
        limit: 50,
        offset: 0,
        status: 'active',
        category: 'beauty'
      };

      // If subcategory selected, use it for exact matching
      if (selectedSubcategory && selectedSubcategory !== 'all') {
        params.subcategory = selectedSubcategory;
      }

      if (priceRange.min) params.min_price = priceRange.min;
      if (priceRange.max) params.max_price = priceRange.max;

      return productsAPI.getAll(params);
    }
  );

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    const newParams = new URLSearchParams(searchParams);
    if (subcategory) {
      newParams.set('category', subcategory);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

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
          <h1 className="page-title-myntra">Beauty & Personal Care</h1>
          <p className="page-subtitle-myntra">
            {selectedSubcategory && selectedSubcategory !== 'all'
              ? `${selectedSubcategory} - ${sortedProducts.length} items`
              : `All Products - ${sortedProducts.length} items`}
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

              {/* Beauty Subcategories Filter */}
              <div className="filter-section-myntra">
                <h4 className="filter-title-myntra">Beauty Categories</h4>
                <div className="beauty-subcategories-myntra">
                  {beautySubcategories.map((section) => (
                    <div key={section.title} className="beauty-section-myntra">
                      <button
                        className="beauty-section-header-myntra"
                        onClick={() => toggleSection(section.title)}
                      >
                        <span>{section.title}</span>
                        {expandedSections[section.title] ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </button>
                      {expandedSections[section.title] && section.items.length > 0 && (
                        <div className="beauty-section-items-myntra">
                          {section.items.map((item) => (
                            <button
                              key={item}
                              className={`beauty-subcategory-item-myntra ${
                                selectedSubcategory === item ? 'active' : ''
                              }`}
                              onClick={() => handleSubcategoryChange(item)}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                  icon="💄"
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

export default Beauty;
