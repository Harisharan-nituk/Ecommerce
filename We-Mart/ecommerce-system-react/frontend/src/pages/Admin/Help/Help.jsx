import React, { useState } from 'react';
import { 
  FiHelpCircle, 
  FiSearch, 
  FiBook, 
  FiMessageCircle,
  FiMail,
  FiVideo,
  FiFileText,
  FiChevronRight
} from 'react-icons/fi';
import './Help.css';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: FiBook },
    { id: 'getting-started', label: 'Getting Started', icon: FiHelpCircle },
    { id: 'products', label: 'Products', icon: FiFileText },
    { id: 'orders', label: 'Orders', icon: FiMessageCircle },
    { id: 'payments', label: 'Payments', icon: FiMail },
    { id: 'settings', label: 'Settings', icon: FiVideo }
  ];

  const articles = [
    {
      id: 1,
      title: 'Getting Started with Admin Dashboard',
      category: 'getting-started',
      description: 'Learn how to navigate and use the admin dashboard effectively.',
      views: 1250
    },
    {
      id: 2,
      title: 'How to Add and Manage Products',
      category: 'products',
      description: 'Step-by-step guide to adding products, managing inventory, and updating product information.',
      views: 890
    },
    {
      id: 3,
      title: 'Understanding Order Management',
      category: 'orders',
      description: 'Learn how to process orders, update order status, and handle customer inquiries.',
      views: 756
    },
    {
      id: 4,
      title: 'Setting Up Payment Gateways',
      category: 'payments',
      description: 'Configure Stripe, PayPal, and Razorpay payment gateways for your store.',
      views: 623
    },
    {
      id: 5,
      title: 'Inventory Management Best Practices',
      category: 'products',
      description: 'Tips and tricks for managing inventory, setting up alerts, and tracking stock levels.',
      views: 542
    },
    {
      id: 6,
      title: 'User and Role Management',
      category: 'settings',
      description: 'How to create users, assign roles, and manage permissions effectively.',
      views: 489
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="help-page">
      <div className="help-header">
        <div>
          <h1>Help & Support</h1>
          <p className="subtitle">Find answers to common questions and get support</p>
        </div>
      </div>

      <div className="help-search">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="help-container">
        <div className="help-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>

          <div className="support-section">
            <h3>Need More Help?</h3>
            <div className="support-options">
              <a href="mailto:support@ecommerce.com" className="support-link">
                <FiMail />
                <span>Email Support</span>
              </a>
              <a href="#" className="support-link">
                <FiMessageCircle />
                <span>Live Chat</span>
              </a>
              <a href="#" className="support-link">
                <FiVideo />
                <span>Video Tutorials</span>
              </a>
            </div>
          </div>
        </div>

        <div className="help-content">
          <div className="articles-section">
            <h2>
              {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <p className="article-count">{filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found</p>

            <div className="articles-list">
              {filteredArticles.length === 0 ? (
                <div className="empty-state">
                  <FiHelpCircle className="empty-icon" />
                  <h3>No articles found</h3>
                  <p>Try adjusting your search or category filter</p>
                </div>
              ) : (
                filteredArticles.map(article => (
                  <div key={article.id} className="article-card">
                    <div className="article-content">
                      <h3>{article.title}</h3>
                      <p>{article.description}</p>
                      <div className="article-meta">
                        <span className="article-views">{article.views} views</span>
                        <span className="article-category">
                          {categories.find(c => c.id === article.category)?.label}
                        </span>
                      </div>
                    </div>
                    <div className="article-action">
                      <FiChevronRight />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="quick-links-section">
            <h3>Quick Links</h3>
            <div className="quick-links">
              <a href="#" className="quick-link">
                <FiBook />
                <div>
                  <strong>Documentation</strong>
                  <p>Complete API and feature documentation</p>
                </div>
              </a>
              <a href="#" className="quick-link">
                <FiVideo />
                <div>
                  <strong>Video Guides</strong>
                  <p>Step-by-step video tutorials</p>
                </div>
              </a>
              <a href="#" className="quick-link">
                <FiMessageCircle />
                <div>
                  <strong>Community Forum</strong>
                  <p>Connect with other users</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
