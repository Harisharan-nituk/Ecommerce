import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiFacebook, 
  FiTwitter, 
  FiInstagram,
  FiLinkedin,
  FiYoutube
} from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🛍️</span>
              <span className="logo-text">
                <span className="logo-primary">E</span>Commerce
              </span>
            </div>
            <p className="footer-description">
              Your trusted online shopping destination. Discover amazing products at unbeatable prices with fast and secure delivery.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <FiFacebook />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <FiYoutube />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul className="footer-links">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns & Exchanges</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Become a Seller</h4>
            <p className="footer-seller-text">
              Join thousands of sellers and start your online business today!
            </p>
            <Link to="/seller/register" className="btn-seller-register">
              🛍️ Register as Seller
            </Link>
          </div>

          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul className="footer-contact">
              <li>
                <FiMail />
                <span>support@ecommerce.com</span>
              </li>
              <li>
                <FiPhone />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <FiMapPin />
                <span>123 Commerce St, City, State 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} E-Commerce Store. All rights reserved.</p>
            <div className="footer-payments">
              <span className="payment-label">We Accept:</span>
              <div className="payment-icons">
                <span className="payment-icon" title="Visa">💳</span>
                <span className="payment-icon" title="Mastercard">💳</span>
                <span className="payment-icon" title="PayPal">💳</span>
                <span className="payment-icon" title="Stripe">💳</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
