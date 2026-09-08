import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import api from '../api/client';
import { sound } from '../utils/sound';

const POPULAR_CATEGORIES = [
  { id: 'all', label: 'All GIFs' },
  { id: 'romantic', label: '❤️ Romantic' },
  { id: 'cute', label: '🐱 Cute' },
  { id: 'funny', label: '😂 Funny' },
  { id: 'celebration', label: '🎉 Celebration' },
];

export default function GifPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentGifUrl,
  title = 'Select a GIF'
}) {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(currentGifUrl || '');

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentGifUrl || '');
      loadGifs();
    }
  }, [isOpen, currentGifUrl]);

  const loadGifs = async () => {
    try {
      setLoading(true);
      const res = await api.customer.getGifs();
      setGifs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load gif library:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredGifs = gifs.filter((g) => {
    const matchesCat = category === 'all' || g.category === category || g.cat === category;
    const matchesSearch = !search || (g.name && g.name.toLowerCase().includes(search.toLowerCase())) ||
      (g.category && g.category.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSelect = (url) => {
    sound.playPop();
    setSelectedUrl(url);
  };

  const handleConfirm = () => {
    const chosen = customUrl.trim() || selectedUrl;
    if (chosen) {
      onSelect(chosen);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        border: '1px solid rgba(255, 77, 109, 0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#ff758f" />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: '#fff', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffc2d1', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(20, 4, 12, 0.65)',
            border: '1px solid rgba(255, 77, 109, 0.25)',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '10px'
          }}>
            <Search size={16} color="#ff758f" />
            <input
              type="text"
              placeholder="Search GIFs (e.g. cat, wine, dance, pasta)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                width: '100%',
                outline: 'none',
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {POPULAR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  border: category === cat.id ? '1px solid #ff4d6d' : '1px solid rgba(255, 77, 109, 0.2)',
                  background: category === cat.id ? 'rgba(255, 77, 109, 0.25)' : 'rgba(20, 4, 12, 0.4)',
                  color: category === cat.id ? '#fff' : '#ffb3c1',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* GIFs Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
          minHeight: '220px',
          maxHeight: '340px'
        }}>
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ffb3c1', padding: '30px' }}>Loading GIF library...</p>
          ) : filteredGifs.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ffb3c1', padding: '30px' }}>No GIFs found matching your search.</p>
          ) : (
            filteredGifs.map((g) => {
              const url = g.file_url || g.url;
              const isSelected = selectedUrl === url;
              return (
                <div
                  key={g.id || url}
                  onClick={() => handleSelect(url)}
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: isSelected ? '2px solid #ff4d6d' : '1px solid rgba(255, 77, 109, 0.2)',
                    background: '#14040c',
                    cursor: 'pointer',
                    position: 'relative',
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isSelected ? '0 0 14px rgba(255, 77, 109, 0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img
                    src={url}
                    alt={g.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: '#ff4d6d',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}>
                      <Check size={14} />
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    insetInline: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                    padding: '4px 6px',
                    fontSize: '10px',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {g.name}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Custom URL write-in */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 77, 109, 0.15)' }}>
          <label style={{ display: 'block', fontSize: '11px', color: '#ffb3c1', marginBottom: '4px' }}>
            Or paste a custom GIF link:
          </label>
          <input
            type="text"
            placeholder="https://media.tenor.com/.../cat.gif"
            value={customUrl}
            onChange={(e) => {
              setCustomUrl(e.target.value);
              setSelectedUrl(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'rgba(20, 4, 12, 0.65)',
              border: '1px solid rgba(255, 77, 109, 0.25)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary-outline"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedUrl && !customUrl}
            onClick={handleConfirm}
            className="btn btn-primary pulse-glow"
            style={{ padding: '6px 18px', fontSize: '12px' }}
          >
            Select This GIF ✨
          </button>
        </div>
      </div>
    </div>
  );
}
