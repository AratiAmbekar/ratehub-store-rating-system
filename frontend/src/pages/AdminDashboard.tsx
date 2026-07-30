import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import { StatsCard } from '../components/StatsCard';
import { Navbar } from '../components/Navbar';
import { Users, Store, Star, Plus, Eye, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { StarRating } from '../components/StarRating';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';
  createdAt?: string;
  rating?: number;
}

type SortField = 'name' | 'email' | 'createdAt' | 'rating';
type SortOrder = 'asc' | 'desc';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores'>('overview');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // States
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [usersList, setUsersList] = useState<User[]>([]);
  const [storesList, setStoresList] = useState<User[]>([]);
  
  // Loading & Errors
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalUser, setDetailModalUser] = useState<User | null>(null);

  // Filters state
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Add User Form States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER'>('NORMAL_USER');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formGeneralError, setFormGeneralError] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Validation flags for form
  const isFormNameValid = formName.length >= 20 && formName.length <= 60;
  const isFormAddressValid = formAddress.length <= 400;
  const isFormPasswordLengthValid = formPassword.length >= 8 && formPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(formPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(formPassword);
  const isFormPasswordValid = isFormPasswordLengthValid && hasUppercase && hasSpecialChar;
  
  const isFormValid = isFormNameValid && isFormAddressValid && isFormPasswordValid;

  // Sorting state (used for both Users and Stores tables)
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [order, setOrder] = useState<SortOrder>('desc');

  const fetchStats = async () => {
    try{
        const res = await request<Stats>('/admin/stats');

        if(res.data){
            setStats(res.data);
        }

    }catch (err) {
        console.error(err);
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filterName) params.append("name", filterName);
      if (filterEmail) params.append("email", filterEmail);
      if (filterAddress) params.append("address", filterAddress);
      if (filterRole) params.append("role", filterRole);
      if (sortBy) params.append("sortBy", sortBy);
      if (order) params.append("order", order);
      params.append("page", String(page));
      params.append("limit", "10");

      const res = await request<{ users: User[], totalPages?: number }>(
        `/admin/users?${params.toString()}`
      );

      if (res.data) {
        setUsersList(res.data.users);
        const total = res.data.totalPages || 1;
        setTotalPages(total);
        if (page > total && total > 0) {
          setPage(total);
        }
      }
    } catch {
      alert("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filterName) params.append("name", filterName);
      if (filterEmail) params.append("email", filterEmail);
      if (filterAddress) params.append("address", filterAddress);
      if (sortBy) params.append("sortBy", sortBy);
      if (order) params.append("order", order);
      params.append("page", String(page));
      params.append("limit", "10");

      const res = await request<{ stores: User[], totalPages?: number }>(
        `/admin/stores?${params.toString()}`
      );

      if (res.data) {
        setStoresList(res.data.stores);
        const total = res.data.totalPages || 1;
        setTotalPages(total);
        if (page > total && total > 0) {
          setPage(total);
        }
      }
    } catch {
      alert("Unable to load stores.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger loading based on filters and tab
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab, filterName, filterEmail, filterAddress, filterRole, sortBy, order, page]);

  useEffect(() => {
    setPage(1);
    setTotalPages(1);
  }, [activeTab]);

  // Reset page when typing in filters to avoid being stuck on an empty page
  useEffect(() => {
    setPage(1);
  }, [filterName, filterEmail, filterAddress, filterRole]);

  // Sorting handler: click a sortable column to sort by it, click again to flip direction
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortBy !== field) return null;
    return order === 'asc' ? ' ▲' : ' ▼';
  };

  // Open details
  const handleOpenDetails = async (id: string) => {
    try {
      const endpoint =
        activeTab === "users"
          ? `/admin/users/${id}`
          : `/admin/stores/${id}`;

      const res = await request<any>(endpoint);

      if (res.error) {
        console.error(res.error);
        alert(res.error);
        return;
      }

      if (res.data) {
        setDetailModalUser(res.data.user);
      }
    } catch {
      alert("Unable to load details.");
    }
  };

  // Handle Form Submit
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setFormGeneralError(null);
    setFormSuccessMessage(null);

    if (!isFormValid) return;

    try {
      const res = await request('/admin/users', 'POST', {
        name: formName,
        email: formEmail,
        password: formPassword,
        address: formAddress,
        role: formRole,
      });

      if (res.data) {
        setFormSuccessMessage('User added successfully!');
        // Clear form
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormAddress('');
        setFormRole('NORMAL_USER');

        // Refresh Stats and Directories
        fetchStats();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'stores') fetchStores();

        setTimeout(() => {
          setModalOpen(false);
          setFormSuccessMessage(null);
        }, 1500);
      } else {
        setFormGeneralError(res.error || 'Failed to create user.');
        if (res.errors) setFormErrors(res.errors);
      }
    } catch{
      setFormGeneralError("Something went wrong. Please try again.");
    }
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterEmail('');
    setFilterAddress('');
    setFilterRole('');
  };

  return (
    <div style={{ flex: 1, paddingBottom: '3rem' }}>
      <Navbar />
      <button
        className="btn btn-primary refresh-btn"
        onClick={() => {
          fetchStats();
          if (activeTab === 'users') fetchUsers();
          if (activeTab === 'stores') fetchStores();
        }}
      >
        <RefreshCw
          size={16}
          className={`refresh-icon ${loading ? 'spin' : ''}`}
        />
        Refresh
      </button>

      {/* Tabs Menu */}
      <div className="tabs-container" id="admin-tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('overview');
            clearFilters();
          }}
          id="tab-overview-btn"
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users');
            clearFilters();
          }}
          id="tab-users-btn"
        >
          Users Directory
        </button>
        <button
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('stores');
            clearFilters();
          }}
          id="tab-stores-btn"
        >
          Stores Directory
        </button>
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="stats-grid" id="admin-stats-grid">
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              icon={<Users size={24} />}
              id="stat-users-card"
            />
            <StatsCard
              title="Total Stores"
              value={stats?.totalStores ?? 0}
              icon={<Store size={24} />}
              id="stat-stores-card"
            />
            <StatsCard
              title="Total Ratings"
              value={stats?.totalRatings ?? 0}
              icon={<Star size={24} />}
              id="stat-ratings-card"
            />
          </div>

          <div
            className="glass-card"
            style={{
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              marginTop: '2rem',
              minHeight: '220px',
            }}
          >
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.8rem' }}>Administrative Control Panel</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '1.5rem' }}>
              Welcome back, Administrator. Use the tabs above to manage all registered stores and users, monitor real-time review counts, or create new roles.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalOpen(true);
                  setFormRole('NORMAL_USER');
                }}
                id="quick-add-user-btn"
              >
                <Plus size={18} />
                Add User
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setModalOpen(true);
                  setFormRole('STORE_OWNER');
                }}
                id="quick-add-store-btn"
              >
                <Plus size={18} />
                Add Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directory Tab Listings (Users/Stores) */}
      {activeTab !== 'overview' && (
        <div className="glass-card" id="directory-panel">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <h2>{activeTab === 'users' ? 'Registered Users' : 'Registered Stores'}</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setModalOpen(true);
                setFormRole(activeTab === 'users' ? 'NORMAL_USER' : 'STORE_OWNER');
              }}
              id="add-entry-btn"
            >
              <Plus size={18} />
              {activeTab === 'users' ? 'Add User' : 'Add Store'}
            </button>
          </div>

          {/* Filter Panel */}
          <div className="filters-bar" id="filters-container">
            <div className="filter-input">
              <input
                type="text"
                placeholder="Filter by Name"
                className="form-control"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                id="filter-name-input"
              />
            </div>
            <div className="filter-input">
              <input
                type="text"
                placeholder="Filter by Email"
                className="form-control"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                id="filter-email-input"
              />
            </div>
            <div className="filter-input">
              <input
                type="text"
                placeholder="Filter by Address"
                className="form-control"
                value={filterAddress}
                onChange={(e) => setFilterAddress(e.target.value)}
                id="filter-address-input"
              />
            </div>

            {activeTab === 'users' && (
              <div className="filter-input" style={{ maxWidth: '180px' }}>
                <select
                  className="form-control"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  id="filter-role-input"
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="NORMAL_USER">Normal User</option>
                </select>
              </div>
            )}

            <button className="btn btn-secondary" onClick={clearFilters} id="clear-filters-btn">
              Clear
            </button>
          </div>

          {/* Table list */}
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '3rem 0',
                color: 'var(--text-secondary)',
              }}
            >
              <RefreshCw className="star-icon" size={24} style={{ animation: 'spin 2s linear infinite' }} />
              Loading listings...
            </div>
          ) : activeTab === 'users' ? (
            <div className="table-container">
              {usersList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '2rem' }}>👤</div>
                  <p>No users found</p>
                  <p style={{ fontSize: '0.9rem' }}>Try adjusting filters</p>
                </div>
              ) : (
                <table className="custom-table" id="users-table">
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort('name')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        id="users-sort-name"
                      >
                        Name{sortIndicator('name')}
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        id="users-sort-email"
                      >
                        Email{sortIndicator('email')}
                      </th>
                      <th>Address</th>
                      <th>Role</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.id} id={`user-row-${usr.id}`}>
                        <td>{usr.name}</td>
                        <td>{usr.email}</td>
                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {usr.address}
                        </td>
                        <td>
                          <span className={`badge ${usr.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                            {usr.role === 'ADMIN' ? 'Admin' : 'Normal User'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem', border: 'none', background: 'none' }}
                            onClick={() => handleOpenDetails(usr.id)}
                            id={`view-details-${usr.id}`}
                            title="View Details"
                          >
                            <Eye size={16} style={{ color: 'var(--color-primary)' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="table-container">
              {storesList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No stores found matching the search filters.
                </div>
              ) : (
                <table className="custom-table" id="stores-table">
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort('name')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        id="stores-sort-name"
                      >
                        Store Name{sortIndicator('name')}
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        id="stores-sort-email"
                      >
                        Email{sortIndicator('email')}
                      </th>
                      <th>Address</th>
                      <th 
                        onClick={() => handleSort('rating')}
                      > 
                        Rating{sortIndicator('rating')}
                      </th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storesList.map((str) => (
                      <tr key={str.id} id={`store-row-${str.id}`}>
                        <td>{str.name}</td>
                        <td>{str.email}</td>
                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {str.address}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarRating rating={str.rating || 0} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              {str.rating ? str.rating.toFixed(1) : '0.0'}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem', border: 'none', background: 'none' }}
                            onClick={() => handleOpenDetails(str.id)}
                            id={`view-details-${str.id}`}
                            title="View Details"
                          >
                            <Eye size={16} style={{ color: 'var(--color-primary)' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab !== 'overview' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </button>

          <span>Page {page} of {Math.max(1, totalPages)}</span>

          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* ADD USER/STORE MODAL */}
      {modalOpen && (
        <div className="modal-overlay" id="add-user-modal-overlay">
          <div className="glass-card modal-content" id="add-user-modal-content">
            <div className="modal-header">
              <h2>{formRole === 'STORE_OWNER' ? 'Add New Store' : 'Add New User'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)} id="close-add-user-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} id="add-user-form">
              {formGeneralError && (
                <div
                  style={{
                    color: 'var(--color-error)',
                    background: 'rgba(255, 71, 87, 0.1)',
                    border: '1px solid rgba(255, 71, 87, 0.2)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                  id="add-user-general-error"
                >
                  <AlertCircle size={16} />
                  <span>{formGeneralError}</span>
                </div>
              )}

              {formSuccessMessage && (
                <div
                  style={{
                    color: 'var(--color-success)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                  id="add-user-success"
                >
                  <Check size={16} />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="form-name">
                  {formRole === 'STORE_OWNER' ? 'Store Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  id="form-name"
                  className="form-control"
                  placeholder="Min 20, Max 60 characters"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
                {!isFormNameValid && formName.length > 0 && (
                  <div className="form-error">
                    Name must be between 20 and 60 characters (currently: {formName.length}).
                  </div>
                )}
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="form-email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="form-email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
                {formErrors.email && <div className="form-error">{formErrors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="form-password">
                  Password
                </label>
                <input
                  type="password"
                  id="form-password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                />
                {formErrors.password && <div className="form-error">{formErrors.password}</div>}

                {/* Password validation indicators */}
                <div className="live-checks" id="form-password-checks">
                  <div className={`live-check-item ${isFormPasswordLengthValid ? 'valid' : ''}`}>
                    <Check size={12} />
                    8-16 characters
                  </div>
                  <div className={`live-check-item ${hasUppercase ? 'valid' : ''}`}>
                    <Check size={12} />
                    At least one uppercase letter
                  </div>
                  <div className={`live-check-item ${hasSpecialChar ? 'valid' : ''}`}>
                    <Check size={12} />
                    At least one special character
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="form-address">
                  Address
                </label>
                <textarea
                  id="form-address"
                  className="form-control"
                  placeholder="Max 400 characters"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  style={{ resize: 'vertical', minHeight: '80px' }}
                  required
                />
                {!isFormAddressValid && (
                  <div className="form-error">
                    Address cannot exceed 400 characters (currently: {formAddress.length}).
                  </div>
                )}
                {formErrors.address && <div className="form-error">{formErrors.address}</div>}
              </div>

              {activeTab === 'users' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="form-role">
                    Role
                  </label>
                  <select
                    id="form-role"
                    className="form-control"
                    value={formRole}
                    onChange={(e) =>
                        setFormRole(
                            e.target.value as "ADMIN" | "NORMAL_USER" | "STORE_OWNER"
                        )
                    }
                  >
                    <option value="NORMAL_USER">Normal User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STORE_OWNER">Store Owner</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                  id="cancel-add-user-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!isFormValid}
                  id="submit-add-user-btn"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalUser && (
        <div className="modal-overlay" id="detail-modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '500px' }} id="detail-modal-content">
            <div className="modal-header">
              <h2>
                {detailModalUser.role === "STORE_OWNER"
                  ? "Store Details"
                  : "User Details"}
              </h2>
              <button className="modal-close" onClick={() => setDetailModalUser(null)} id="close-detail-modal">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} id="detail-modal-body">
              <div>
                <span className="form-label">Name</span>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }} id="detail-name">
                  {detailModalUser.name}
                </p>
              </div>

              <div>
                <span className="form-label">Email Address</span>
                <p id="detail-email">{detailModalUser.email}</p>
              </div>

              <div>
                <span className="form-label">Physical Address</span>
                <p style={{ whiteSpace: 'pre-line' }} id="detail-address">
                  {detailModalUser.address}
                </p>
              </div>

              <div>
                <span className="form-label">System Role</span>
                <span
                  className={`badge ${
                    detailModalUser.role === 'ADMIN'
                      ? 'badge-admin'
                      : detailModalUser.role === 'STORE_OWNER'
                      ? 'badge-store'
                      : 'badge-user'
                  }`}
                  id="detail-role"
                >
                  {detailModalUser.role === 'ADMIN'
                    ? 'Admin'
                    : detailModalUser.role === 'STORE_OWNER'
                    ? 'Store Owner'
                    : 'Normal User'}
                </span>
              </div>

              {detailModalUser.role === 'STORE_OWNER' && (
                <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '1.25rem' }}>
                  <span className="form-label">Average Customer Rating</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <StarRating rating={detailModalUser.rating || 0} size={24} />
                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }} id="detail-rating">
                      {detailModalUser.rating ? detailModalUser.rating.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDetailModalUser(null)}
                id="close-detail-modal-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};