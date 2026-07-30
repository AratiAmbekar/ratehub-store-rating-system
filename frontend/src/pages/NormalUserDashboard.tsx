import React, { useState, useEffect } from 'react';
import { request } from '../utils/api';
import { Navbar } from '../components/Navbar';
import { StarRating } from '../components/StarRating';
import { Search, MapPin, Star, RefreshCw } from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  address: string;
  rating: number;
  userRating: number;
}

export const NormalUserDashboard: React.FC = () => {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [ratingMessage, setRatingMessage] = useState<{ [storeId: string]: string }>({});

  const fetchStores = async (query: string = '') => {
    setLoading(true);
    const path = query ? `/stores?search=${encodeURIComponent(query)}` : '/stores';
    const res = await request<{ stores: StoreItem[] }>(path);
    if (res.data) {
      setStores(res.data.stores);
    }
    setLoading(false);
  };

  useEffect(() => {
  const delay = setTimeout(() => {
    fetchStores(searchQuery);
  }, 400);

  return () => clearTimeout(delay);
}, [searchQuery]);

  const handleRateStore = async (storeId: string, value: number) => {
    const res = await request('/ratings', 'POST', {
      storeOwnerId: storeId,
      value,
    });

    if (res.data) {
      // Set success message
      setRatingMessage((prev) => ({
        ...prev,
        [storeId]: `Rating of ${value} submitted!`,
      }));

      // Refresh list to recalculate overall average and show new user rating
      fetchStores(searchQuery);

      // Clear message after 2 seconds
      setTimeout(() => {
        setRatingMessage((prev) => {
          const next = { ...prev };
          delete next[storeId];
          return next;
        });
      }, 2000);
    } else {
      alert(res.error || 'Failed to submit rating');
    }
  };

  return (
    <div style={{ flex: 1, paddingBottom: '3rem' }}>
      <Navbar />

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Find & Rate Stores</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse registered stores, view overall community feedback, and grade your experiences.
        </p>
      </div>

      {/* Search Panel */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
        id="search-panel"
      >
        <Search size={20} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search stores by Name or Address..."
          className="form-control"
          style={{ border: 'none', background: 'transparent', padding: '0.5rem 0' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="store-search-input"
        />
        {loading && (
          <RefreshCw
            className="star-icon"
            size={18}
            style={{ animation: 'spin 2s linear infinite', color: 'var(--color-primary)' }}
          />
        )}
      </div>

      {/* Grid of Stores */}
      {stores.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
          id="no-stores-found"
        >
          No stores found matching your search.
        </div>
      ) : (
        <div className="store-grid" id="stores-grid-container">
          {stores.map((store) => (
            <div className="glass-card store-card" key={store.id} id={`store-card-${store.id}`}>
              <div className="store-card-header">
                <h3 className="store-card-title">{store.name}</h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <MapPin size={16} style={{ color: 'var(--color-primary)', marginTop: '0.1rem', flexShrink: 0 }} />
                  <p className="store-card-address">{store.address}</p>
                </div>
              </div>

              {/* Submitting Feedback Area */}
              <div style={{ margin: '1rem 0', padding: '1rem 0', borderTop: '1px solid var(--border-card)' }}>
                <span className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  {store.userRating > 0 ? 'Your Rating (Modify)' : 'Rate this store'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <StarRating
                    rating={store.userRating}
                    interactive={true}
                    onRatingChange={(newVal) => handleRateStore(store.id, newVal)}
                    size={22}
                  />
                  {store.userRating > 0 && (
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        background: 'rgba(0, 242, 254, 0.1)',
                        color: 'var(--color-primary)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                      }}
                      id={`user-rating-badge-${store.id}`}
                    >
                      {store.userRating} ★
                    </span>
                  )}
                </div>
                {ratingMessage[store.id] && (
                  <p
                    style={{
                      color: 'var(--color-success)',
                      fontSize: '0.75rem',
                      marginTop: '0.35rem',
                      fontWeight: 500,
                    }}
                    id={`rating-success-${store.id}`}
                  >
                    {ratingMessage[store.id]}
                  </p>
                )}
              </div>

              {/* Overall average */}
              <div className="store-rating-info">
                <span className="form-label" style={{ margin: 0, fontSize: '0.85rem' }}>
                  Overall Rating
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={16} className="star-filled" />
                  <span style={{ fontSize: '1rem', fontWeight: 700 }} id={`store-overall-rating-${store.id}`}>
                    {store.rating > 0 ? store.rating.toFixed(1) : '0.0'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
