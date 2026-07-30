import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import { Navbar } from '../components/Navbar';
import { StatsCard } from '../components/StatsCard';
import { StarRating } from '../components/StarRating';
import { Award, UserCheck, Calendar, RefreshCw } from 'lucide-react';

interface CustomerRating {
  id: string;
  name: string;
  email: string;
  rating: number;
  date: string;
}

interface StoreOwnerData {
  averageRating: number;
  totalRatings: number;
  customers: CustomerRating[];
}

export const StoreOwnerDashboard: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('latest');
  const [data, setData] = useState<StoreOwnerData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    const res = await request<StoreOwnerData>(
      `/store-owner/dashboard?page=${page}&limit=10&sort=${sort}`
    );

    if (res.error) {
      console.error(res.error);
      setData(null);
    } else if (res.data) {
      setData(res.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [page, sort]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={{ flex: 1, paddingBottom: '3rem' }}>
      <Navbar />

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div>
    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
      Store Analytics Dashboard
    </h2>
    <p style={{ color: 'var(--text-secondary)' }}>
      Monitor customer satisfaction levels, check your average rating score, and view submitted reviews.
    </p>
  </div>

  <button className="btn btn-secondary refresh-btn" onClick={fetchDashboardData}>
    <RefreshCw size={16} className={`refresh-icon ${loading ? 'spin' : ''}`} /> Refresh
  </button>
</div>
      

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '4rem 0',
            color: 'var(--text-secondary)',
          }}
        >
          <RefreshCw className="star-icon" size={24} style={{ animation: 'spin 2s linear infinite' }} />
          Loading dashboard metrics...
        </div>
      ) : data ? (
        <div>
          {/* Stats Summary Cards */}
          <div className="stats-grid" id="owner-stats-grid">
            <StatsCard
              title="Average Rating"
              value={`${data.averageRating?.toFixed(2) ?? '0.00'} / 5.00`}
              icon={<Award size={24} />}
              id="owner-stat-avg-rating"
            />
            <StatsCard
              title="Total Ratings Received"
              value={data.totalRatings}
              icon={<UserCheck size={24} />}
              id="owner-stat-total-ratings"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <select
              className="form-control"
              style={{ maxWidth: '200px' }}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="latest">Latest</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>

          {/* Customer Reviews Table */}
          <div className="glass-card" style={{ marginTop: '2rem' }} id="owner-reviews-panel">
            <h2 style={{ marginBottom: '1.5rem' }}>Customer Ratings Log</h2>

            {data?.customers?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem' }}>⭐</div>
                <p>No ratings yet.</p>
                <p style={{ fontSize: '0.9rem' }}>Share your store to get your first review!</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table" id="owner-ratings-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email Address</th>
                      <th>Submitted Rating</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.customers?.map((customer) => (
                      <tr key={customer.id}>
                        <td style={{ fontWeight: 600 }}>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarRating rating={customer.rating} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                              {customer.rating} ★
                            </span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                            {formatDate(customer.date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            <span>Page {page}</span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={data?.customers?.length < 10}
            >
            Next
          </button>
          </div>
        </div>
        
      ) : (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-error)' }}>
          Failed to load store dashboard data.
        </div>
      )}
    </div>
  );
};
