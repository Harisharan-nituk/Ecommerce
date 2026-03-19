import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import RoleBasedSidebar from '../RoleBasedSidebar/RoleBasedSidebar';
import { 
  FiShoppingCart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiSearch,
  FiHeart,
  FiChevronDown
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { categoriesAPI } from '../../services/api';
import CategoryMenu from '../CategoryMenu/CategoryMenu';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const { isAuthenticated, user, hasRole, roles } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { getItemCount: getWishlistCount } = useWishlistStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'categories',
    () => categoriesAPI.getAll(),
    { staleTime: 10 * 60 * 1000 }
  );

  const categories = categoriesData?.data?.data || [];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const isAdmin = hasRole('Super Admin') || hasRole('Admin');
  const isSeller = hasRole('Vendor/Seller') || hasRole('Seller') || hasRole('seller') || hasRole('Vendor') || hasRole('vendor');
  const cartCount = getItemCount();

  // Myntra-style categories
  const mainCategories = [
    { name: 'Men', path: '/shop/men', hasDropdown: true },
    { name: 'Women', path: '/shop/women', hasDropdown: true },
    { name: 'Kids', path: '/shop/kids', hasDropdown: true },
    { name: 'Home & Living', path: '/shop/home-living', hasDropdown: true },
    { name: 'Beauty', path: '/shop/beauty', hasDropdown: true },
    { name: 'Electronics', path: '/shop/electronics', hasDropdown: true },
    { name: 'Studio', path: '/products?category=studio', hasDropdown: false }
  ];

  return (
    <>
      <motion.nav 
        className={`navbar-myntra ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="nav-top-bar">
          <div className="nav-container-myntra">
            <div className="nav-top-left">
              <Link to="/" className="nav-logo-myntra">
                <span className="logo-text-myntra">ECommerce</span>
              </Link>
            </div>

            {/* Search Bar - Myntra Style */}
            <form onSubmit={handleSearch} className="nav-search-myntra">
              <FiSearch className="search-icon-myntra" />
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-myntra"
              />
            </form>

            <div className="nav-top-right">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-icon-link">
                    <FiUser />
                    <span className="nav-icon-label">Profile</span>
                  </Link>
                  <Link to="/wishlist" className="nav-icon-link">
                    <FiHeart />
                    <span className="nav-icon-label">Wishlist</span>
                    {getWishlistCount() > 0 && (
                      <span className="cart-badge-myntra" style={{ fontSize: '0.625rem' }}>
                        {getWishlistCount()}
                      </span>
                    )}
                  </Link>
                  <Link to="/cart" className="nav-icon-link cart-link-myntra">
                    <FiShoppingCart />
                    <span className="nav-icon-label">Bag</span>
                    {cartCount > 0 && (
                      <span className="cart-badge-myntra">{cartCount}</span>
                    )}
                  </Link>
                  {isAuthenticated && (
                    <button
                      className="nav-menu-toggle-myntra"
                      onClick={() => setIsSidebarOpen(true)}
                      aria-label="Open menu"
                    >
                      <FiMenu />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link-myntra">Login</Link>
                  <Link to="/register" className="nav-link-myntra">Signup</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="nav-categories-bar">
          <div className="nav-container-myntra">
            <div className="categories-menu">
              {mainCategories.map((category, index) => (
                <div
                  key={index}
                  className="category-item-wrapper"
                  onMouseEnter={() => category.hasDropdown && setHoveredCategory(index)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    to={category.path}
                    className="category-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                    {category.hasDropdown && <FiChevronDown className="category-arrow" />}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Single Fixed Position Dropdown for All Categories - Direct child of navbar */}
        {hoveredCategory !== null && mainCategories[hoveredCategory]?.hasDropdown && (
          <motion.div
            className="category-dropdown-detailed"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setHoveredCategory(hoveredCategory)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <CategoryMenu type={
              mainCategories[hoveredCategory].name === 'Home & Living' ? 'home-living' 
              : mainCategories[hoveredCategory].name === 'Beauty' ? 'beauty'
              : mainCategories[hoveredCategory].name === 'Electronics' ? 'electronics'
              : mainCategories[hoveredCategory].name.toLowerCase()
            } />
          </motion.div>
        )}
      </motion.nav>

      {/* Role-Based Sidebar */}
      <RoleBasedSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
