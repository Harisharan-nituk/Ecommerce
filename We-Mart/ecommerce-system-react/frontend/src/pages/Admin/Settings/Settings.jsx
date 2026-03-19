import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  FiSettings, 
  FiBell, 
  FiShield, 
  FiDatabase,
  FiMail,
  FiGlobe,
  FiCreditCard,
  FiSave
} from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'E-Commerce System',
      siteDescription: 'Modern e-commerce platform',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      inventoryAlerts: true,
      lowStockThreshold: 10,
      weeklyReports: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireStrongPassword: true
    },
    payment: {
      stripeEnabled: true,
      paypalEnabled: true,
      razorpayEnabled: true,
      defaultPaymentMethod: 'stripe'
    }
  });

  const handleSave = (section) => {
    toast.success(`${section} settings saved successfully!`);
    // Here you would typically save to backend
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'system', label: 'System', icon: FiDatabase }
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="subtitle">Manage your platform configuration</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="section-header">
                <FiSettings />
                <h2>General Settings</h2>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Site Description</label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteDescription: e.target.value }
                    })}
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, currency: e.target.value }
                      })}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, timezone: e.target.value }
                      })}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => handleSave('General')}>
                  <FiSave /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <FiBell />
                <h2>Notification Settings</h2>
              </div>
              <div className="settings-form">
                <div className="toggle-group">
                  <div className="toggle-item">
                    <div>
                      <label>Email Notifications</label>
                      <p>Receive email notifications for important events</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            emailNotifications: e.target.checked
                          }
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <div>
                      <label>Order Notifications</label>
                      <p>Get notified when new orders are placed</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.orderNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            orderNotifications: e.target.checked
                          }
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <div>
                      <label>Inventory Alerts</label>
                      <p>Receive alerts when stock is running low</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.notifications.inventoryAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            inventoryAlerts: e.target.checked
                          }
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <div>
                      <label>Low Stock Threshold</label>
                      <p>Alert when stock falls below this number</p>
                    </div>
                    <input
                      type="number"
                      value={settings.notifications.lowStockThreshold}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          lowStockThreshold: parseInt(e.target.value)
                        }
                      })}
                      className="number-input"
                    />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => handleSave('Notification')}>
                  <FiSave /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <FiShield />
                <h2>Security Settings</h2>
              </div>
              <div className="settings-form">
                <div className="toggle-group">
                  <div className="toggle-item">
                    <div>
                      <label>Two-Factor Authentication</label>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            twoFactorAuth: e.target.checked
                          }
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeout: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Password Length</label>
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordMinLength: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div className="toggle-item">
                    <div>
                      <label>Require Strong Password</label>
                      <p>Enforce complex password requirements</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.security.requireStrongPassword}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            requireStrongPassword: e.target.checked
                          }
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => handleSave('Security')}>
                  <FiSave /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="settings-section">
              <div className="section-header">
                <FiCreditCard />
                <h2>Payment Settings</h2>
              </div>
              <div className="settings-form">
                <div className="toggle-group">
                  <div className="toggle-item">
                    <div>
                      <label>Stripe</label>
                      <p>Enable Stripe payment gateway</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.payment.stripeEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            stripeEnabled: e.target.checked
                          }
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <div>
                      <label>PayPal</label>
                      <p>Enable PayPal payment gateway</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.payment.paypalEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            paypalEnabled: e.target.checked
                          }
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <div>
                      <label>Razorpay</label>
                      <p>Enable Razorpay payment gateway</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.payment.razorpayEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            razorpayEnabled: e.target.checked
                          }
                        })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Default Payment Method</label>
                    <select
                      value={settings.payment.defaultPaymentMethod}
                      onChange={(e) => setSettings({
                        ...settings,
                        payment: {
                          ...settings.payment,
                          defaultPaymentMethod: e.target.value
                        }
                      })}
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                      <option value="razorpay">Razorpay</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => handleSave('Payment')}>
                  <FiSave /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <div className="section-header">
                <FiMail />
                <h2>Email Settings</h2>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label>SMTP Host</label>
                  <input type="text" placeholder="smtp.gmail.com" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>SMTP Port</label>
                    <input type="number" placeholder="587" />
                  </div>
                  <div className="form-group">
                    <label>SMTP Username</label>
                    <input type="email" placeholder="your-email@example.com" />
                  </div>
                </div>
                <div className="form-group">
                  <label>SMTP Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <button className="btn btn-primary" onClick={() => handleSave('Email')}>
                  <FiSave /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="settings-section">
              <div className="section-header">
                <FiDatabase />
                <h2>System Settings</h2>
              </div>
              <div className="settings-form">
                <div className="info-card">
                  <h3>System Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Database</span>
                      <span className="info-value">MongoDB / MySQL</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Storage</span>
                      <span className="info-value">Supabase</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Version</span>
                      <span className="info-value">1.0.0</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Environment</span>
                      <span className="info-value">Production</span>
                    </div>
                  </div>
                </div>
                <div className="warning-card">
                  <h4>⚠️ Maintenance Mode</h4>
                  <p>Enable maintenance mode to temporarily disable the site</p>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <button className="btn btn-primary" onClick={() => handleSave('System')}>
                  <FiSave /> Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
