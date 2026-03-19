import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiSmartphone, FiLock, FiArrowLeft } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import './Auth.css';

const LoginOTP = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify OTP
  const [authCode, setAuthCode] = useState(null);
  const [mobile, setMobile] = useState('');
  const navigate = useNavigate();
  const { login, fetchPermissions } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const mobileNumber = watch('mobile');

  // Step 1: Send OTP
  const onSendOTP = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.sendOTP(data.mobile);
      
      if (response.data.success) {
        setAuthCode(response.data.data.auth_code);
        setMobile(data.mobile);
        setStep(2);
        toast.success('OTP sent to your mobile number! 📱', {
          icon: '✅',
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to send OTP. Please try again.',
        {
          icon: '❌',
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Login
  const onVerifyOTP = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.loginWithOTP(mobile, data.otp, authCode);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        // Extract roles and permissions
        const roles = user.role_id ? [user.role_id] : [];
        const permissions = [];
        
        login(user, token, roles, permissions);
        
        // Try to fetch permissions
        try {
          await fetchPermissions();
        } catch (error) {
          console.error('Failed to fetch permissions:', error);
        }
        
        toast.success('Login successful! 🎉', {
          icon: '👋',
        });
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Invalid OTP. Please try again.';
      
      toast.error(errorMessage, {
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const onResendOTP = async () => {
    setLoading(true);
    try {
      const response = await authAPI.resendOTP(authCode);
      if (response.data.success) {
        toast.success('OTP resent successfully! 📱', {
          icon: '✅',
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to resend OTP.',
        {
          icon: '❌',
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-gradient"></div>
        <div className="auth-pattern"></div>
      </div>
      
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <motion.div
              className="auth-logo"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              📱
            </motion.div>
            <h2>{step === 1 ? 'Login with Mobile' : 'Enter OTP'}</h2>
            <p>
              {step === 1
                ? 'Enter your mobile number to receive OTP'
                : `OTP sent to ${mobile}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit(onSendOTP)} className="auth-form">
              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="mobile">
                  <FiSmartphone />
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  type="tel"
                  {...register('mobile', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                      message: 'Invalid mobile number',
                    },
                  })}
                  placeholder="Enter your mobile number"
                  className={errors.mobile ? 'error' : ''}
                />
                {errors.mobile && (
                  <span className="error-message">{errors.mobile.message}</span>
                )}
              </motion.div>

              <motion.button
                type="submit"
                className="btn btn-primary btn-auth"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <FiSmartphone />
                    Send OTP
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onVerifyOTP)} className="auth-form">
              <motion.div
                className="form-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="otp">
                  <FiLock />
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength="6"
                  {...register('otp', {
                    required: 'OTP is required',
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: 'OTP must be 6 digits',
                    },
                  })}
                  placeholder="Enter 6-digit OTP"
                  className={errors.otp ? 'error' : ''}
                />
                {errors.otp && (
                  <span className="error-message">{errors.otp.message}</span>
                )}
              </motion.div>

              <div className="form-options">
                <button
                  type="button"
                  className="forgot-password"
                  onClick={onResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary btn-auth"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FiLock />
                    Verify & Login
                  </>
                )}
              </motion.button>

              <button
                type="button"
                className="btn btn-secondary btn-auth"
                onClick={() => setStep(1)}
                style={{ marginTop: '1rem' }}
              >
                <FiArrowLeft />
                Back to Mobile Number
              </button>
            </form>
          )}

          <div className="auth-divider">
            <span>or</span>
          </div>

          <p className="auth-link">
            <Link to="/login" className="auth-link-text">
              <FiArrowLeft /> Login with Email/Password
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginOTP;

