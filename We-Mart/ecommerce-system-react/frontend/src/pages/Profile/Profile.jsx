import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { FiCreditCard } from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, roles, permissions, fetchPermissions } = useAuthStore();
  const { data } = useQuery('user-profile', () => authAPI.getProfile(), {
    enabled: !!user,
  });

  const profileData = data?.data?.data?.user || user;

  // Refresh permissions on mount
  useEffect(() => {
    if (user) {
      fetchPermissions();
    }
  }, [user, fetchPermissions]);

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profileData?.first_name?.[0] || 'U'}
            </div>
            <h2>
              {profileData?.first_name} {profileData?.last_name}
            </h2>
          </div>
          <div className="profile-details">
            <div className="detail-row">
              <strong>Email:</strong>
              <span>{profileData?.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>Phone:</strong>
              <span>{profileData?.phone || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>Status:</strong>
              <span className={`status ${profileData?.status || 'active'}`}>
                {profileData?.status || 'Active'}
              </span>
            </div>
            <div className="detail-row">
              <strong>Roles:</strong>
              <span>
                {roles && roles.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {roles.map((role, idx) => (
                      <span key={idx} style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#e3f2fd', 
                        color: '#1565c0', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem' 
                      }}>
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>No roles assigned</span>
                )}
              </span>
            </div>
            <div className="detail-row">
              <strong>Permissions:</strong>
              <span>
                {permissions && permissions.length > 0 ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      {permissions.length} permission(s) assigned
                    </div>
                    <details style={{ cursor: 'pointer' }}>
                      <summary style={{ color: '#667eea', fontWeight: 500 }}>
                        View Permissions ({permissions.length})
                      </summary>
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f9f9f9', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                        {permissions.map((perm, idx) => (
                          <div key={idx} style={{ padding: '0.25rem 0', fontSize: '0.85rem', color: '#333' }}>
                            • {perm}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>No permissions assigned</span>
                )}
              </span>
            </div>
            <div className="detail-row">
              <Link
                to="/wallet"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 500,
                  marginTop: '1rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
              >
                <FiCreditCard />
                View My Wallet
              </Link>
            </div>
            <div className="detail-row">
              <button
                onClick={async () => {
                  await fetchPermissions();
                  window.location.reload();
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                🔄 Refresh Roles & Permissions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

