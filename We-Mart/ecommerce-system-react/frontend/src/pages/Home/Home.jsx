import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: productsData, isLoading } = useQuery(
    'featured-products',
    () => productsAPI.getAll({ limit: 20, status: 'active' }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: categoriesData } = useQuery(
    'categories',
    () => categoriesAPI.getAll(),
    { staleTime: 10 * 60 * 1000 }
  );

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];

  // Myntra-style hero banners
  const heroBanners = [
    {
      id: 1,
      title: 'New Arrivals',
      subtitle: 'Discover the latest fashion trends',
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
      link: '/products?category=new',
      bgColor: '#ff3f6c'
    },
    {
      id: 2,
      title: 'Summer Collection',
      subtitle: 'Stay cool and stylish',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
      link: '/products?category=summer',
      bgColor: '#ff6b35'
    },
    {
      id: 3,
      title: 'Premium Brands',
      subtitle: 'Quality you can trust',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
      link: '/products?category=premium',
      bgColor: '#4a90e2'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  // Category sections
  const categorySections = [
    { name: 'Men', products: products.slice(0, 4) },
    { name: 'Women', products: products.slice(4, 8) },
    { name: 'Electronics', products: products.slice(8, 12) }
  ];

  return (
    <div className="home-myntra">
      {/* Hero Banner Slider - Myntra Style */}
      <section className="hero-slider-myntra">
        <div className="slider-container">
          {heroBanners.map((banner, index) => (
            <motion.div
              key={banner.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              initial={{ opacity: 0, x: index > currentSlide ? 100 : -100 }}
              animate={{
                opacity: index === currentSlide ? 1 : 0,
                x: index === currentSlide ? 0 : index > currentSlide ? 100 : -100
              }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="hero-slide-bg"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${banner.bgColor}10 0%, ${banner.bgColor}08 100%), url(${banner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="hero-slide-content">
                  <h1>{banner.title}</h1>
                  <p>{banner.subtitle}</p>
                  <Link to={banner.link} className="btn-hero-myntra">
                    Shop Now <FiArrowRight />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          
          <button className="slider-nav prev" onClick={prevSlide}>
            <FiChevronLeft />
          </button>
          <button className="slider-nav next" onClick={nextSlide}>
            <FiChevronRight />
          </button>

          <div className="slider-dots">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      {categories.length > 0 && (
        <section className="category-quick-links">
          <div className="container-myntra">
            <div className="category-grid-myntra">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category._id || category.id}
                  to={`/products?category_id=${category._id || category.id}`}
                  className="category-card-myntra"
                >
                  <div className="category-icon-myntra">
                    {category.name?.charAt(0) || '📦'}
                  </div>
                  <span className="category-name-myntra">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Product Sections */}
      {categorySections.map((section, sectionIndex) => (
        section.products.length > 0 && (
          <section key={sectionIndex} className="category-section-myntra">
            <div className="container-myntra">
              <div className="section-header-myntra">
                <h2 className="section-title-myntra">{section.name}</h2>
                <Link to={`/products?category=${section.name.toLowerCase()}`} className="view-all-myntra">
                  View All <FiArrowRight />
                </Link>
              </div>
              {isLoading ? (
                <Loading message="Loading products..." />
              ) : (
                <div className="products-grid-myntra">
                  {section.products.map((product, index) => (
                    <motion.div
                      key={product._id || product.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )
      ))}

      {/* All Products Section */}
      {products.length > 0 && (
        <section className="all-products-section-myntra">
          <div className="container-myntra">
            <div className="section-header-myntra">
              <h2 className="section-title-myntra">All Products</h2>
              <Link to="/products" className="view-all-myntra">
                View All <FiArrowRight />
              </Link>
            </div>
            {isLoading ? (
              <Loading message="Loading products..." />
            ) : (
              <div className="products-grid-myntra">
                {products.slice(0, 12).map((product, index) => (
                  <motion.div
                    key={product._id || product.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {products.length === 0 && !isLoading && (
        <EmptyState
          icon="📦"
          title="No products available"
          message="Check back later for new products!"
        />
      )}
    </div>
  );
};

export default Home;
