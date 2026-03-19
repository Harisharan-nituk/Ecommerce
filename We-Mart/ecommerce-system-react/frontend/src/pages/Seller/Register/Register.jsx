import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiUser, 
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiFileText
} from 'react-icons/fi';
import { sellerAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import './Register.css';

const SellerRegister = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const sellerData = {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        business_name: data.businessName,
        business_address: data.businessAddress,
        business_pincode: data.businessPincode,
        business_description: data.businessDescription,
        pan_card: data.panCard.toUpperCase(),
        aadhaar: data.aadhaar,
        account_number: data.accountNumber,
        tax_id: data.taxId,
      };
      
      const response = await sellerAPI.registerAsSeller(sellerData);

      if (response.data.success) {
        toast.success('Seller registration submitted successfully! We will review your application and get back to you soon.', {
          icon: '🎉',
        });
        navigate('/');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Registration failed. Please try again.';
      toast.error(errorMessage, {
        icon: '❌',
      });
      console.error('Seller registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-register-page">
      <div className="seller-register-container">
        <motion.div
          className="seller-register-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="seller-register-header">
            <div className="seller-icon">🛍️</div>
            <h1>Register as Seller</h1>
            <p>Start selling your products on our platform</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="seller-register-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="firstName">
                    <FiUser />
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    placeholder="Enter your first name"
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && (
                    <span className="error-message">{errors.firstName.message}</span>
                  )}
                </motion.div>

                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="lastName">
                    <FiUser />
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    placeholder="Enter your last name"
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && (
                    <span className="error-message">{errors.lastName.message}</span>
                  )}
                </motion.div>
              </div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="email">
                  <FiMail />
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="phone">
                  <FiPhone />
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                  placeholder="Enter your phone number"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone.message}</span>
                )}
              </motion.div>

              <div className="form-row">
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="password">
                    <FiLock />
                    Password *
                  </label>
                  <div className="password-input">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      placeholder="Create a password"
                      className={errors.password ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">{errors.password.message}</span>
                  )}
                </motion.div>

                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="confirmPassword">
                    <FiLock />
                    Confirm Password *
                  </label>
                  <div className="password-input">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      placeholder="Confirm password"
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword.message}</span>
                  )}
                </motion.div>
              </div>
            </div>

            <div className="form-section">
              <h3>Business Information</h3>
              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="businessName">
                  <FiBriefcase />
                  Business Name *
                </label>
                <input
                  id="businessName"
                  type="text"
                  {...register('businessName', { required: 'Business name is required' })}
                  placeholder="Enter your business name"
                  className={errors.businessName ? 'error' : ''}
                />
                {errors.businessName && (
                  <span className="error-message">{errors.businessName.message}</span>
                )}
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="businessAddress">
                  <FiMapPin />
                  Business Address *
                </label>
                <textarea
                  id="businessAddress"
                  {...register('businessAddress', { required: 'Business address is required' })}
                  placeholder="Enter your business address"
                  rows="3"
                  className={errors.businessAddress ? 'error' : ''}
                />
                {errors.businessAddress && (
                  <span className="error-message">{errors.businessAddress.message}</span>
                )}
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <label htmlFor="businessPincode">
                  <FiMapPin />
                  Pincode *
                </label>
                <input
                  id="businessPincode"
                  type="text"
                  {...register('businessPincode', { 
                    required: 'Pincode is required',
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: 'Pincode must be 6 digits'
                    }
                  })}
                  placeholder="Enter 6-digit pincode"
                  maxLength="6"
                  className={errors.businessPincode ? 'error' : ''}
                />
                {errors.businessPincode && (
                  <span className="error-message">{errors.businessPincode.message}</span>
                )}
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="businessDescription">
                  <FiFileText />
                  Business Description *
                </label>
                <textarea
                  id="businessDescription"
                  {...register('businessDescription', { required: 'Business description is required' })}
                  placeholder="Describe your business and products"
                  rows="4"
                  className={errors.businessDescription ? 'error' : ''}
                />
                {errors.businessDescription && (
                  <span className="error-message">{errors.businessDescription.message}</span>
                )}
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="panCard">
                  <FiFileText />
                  PAN Card Number *
                </label>
                <input
                  id="panCard"
                  type="text"
                  {...register('panCard', { 
                    required: 'PAN card number is required',
                    pattern: {
                      value: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/i,
                      message: 'PAN must be in format: ABCDE1234F'
                    },
                    setValueAs: (value) => value ? value.toUpperCase().replace(/[^A-Z0-9]/g, '') : value
                  })}
                  placeholder="Enter PAN card number (e.g., ABCDE1234F)"
                  maxLength="10"
                  className={errors.panCard ? 'error' : ''}
                  style={{ textTransform: 'uppercase' }}
                  onInput={(e) => {
                    const upperValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    e.target.value = upperValue;
                    setValue('panCard', upperValue, { shouldValidate: true });
                  }}
                />
                {errors.panCard && (
                  <span className="error-message">{errors.panCard.message}</span>
                )}
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <label htmlFor="aadhaar">
                  <FiFileText />
                  Aadhaar Number *
                </label>
                <input
                  id="aadhaar"
                  type="text"
                  {...register('aadhaar', { 
                    required: 'Aadhaar number is required',
                    pattern: {
                      value: /^[0-9]{12}$/,
                      message: 'Aadhaar must be 12 digits'
                    }
                  })}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength="12"
                  className={errors.aadhaar ? 'error' : ''}
                />
                {errors.aadhaar && (
                  <span className="error-message">{errors.aadhaar.message}</span>
                )}
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label htmlFor="accountNumber">
                  <FiFileText />
                  Bank Account Number *
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  {...register('accountNumber', { 
                    required: 'Account number is required',
                    pattern: {
                      value: /^[0-9]{9,18}$/,
                      message: 'Account number must be 9-18 digits'
                    }
                  })}
                  placeholder="Enter bank account number (9-18 digits)"
                  maxLength="18"
                  className={errors.accountNumber ? 'error' : ''}
                />
                {errors.accountNumber && (
                  <span className="error-message">{errors.accountNumber.message}</span>
                )}
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
              >
                <label htmlFor="taxId">
                  <FiFileText />
                  Tax ID / GST Number (Optional)
                </label>
                <input
                  id="taxId"
                  type="text"
                  {...register('taxId')}
                  placeholder="Enter your tax ID or GST number"
                />
              </motion.div>
            </div>

            <motion.div
              className="form-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
              <p className="form-note">
                By submitting, you agree to our Terms of Service. Your application will be reviewed by our team.
              </p>
            </motion.div>
          </form>

          <div className="seller-register-footer">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerRegister;

