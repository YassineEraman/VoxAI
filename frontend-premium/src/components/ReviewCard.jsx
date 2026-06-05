import React from 'react';
import { Star, Trash2 } from 'lucide-react';

export default function ReviewCard({ review, onDelete }) {
  const badgeClass = review.sentiment === 'Positif' ? 'badge-positif' : review.sentiment === 'Négatif' ? 'badge-negatif' : 'badge-neutre';
  const keywords = (review.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
  const themes = (review.themes || '').split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
      {onDelete && (
        <button 
          className="btn-ghost" 
          style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.2rem', color: 'var(--text-muted)' }} 
          onClick={onDelete}
          title="Supprimer cet avis"
        >
          <Trash2 size={16} />
        </button>
      )}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className={`badge ${badgeClass}`}>{review.sentiment}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(review.date).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <p className="review-text">"{review.text}"</p>
      </div>
      <div className="review-meta">
        <div className="review-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {review.source}
          </span>
          <div className="ratings-container" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="stars" title={`Score IA: ${review.score}/5`} style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginRight: '0.2rem', fontWeight: 600 }}>IA</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={`ai-${i}`} size={12} fill={i < review.score ? '#a78bfa' : 'transparent'} color={i < review.score ? '#a78bfa' : 'var(--border-subtle)'} />
              ))}
            </div>
            
            {review.user_rating != null && (
              <div className="stars" title={`Note Client: ${review.user_rating}/5`} style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginRight: '0.2rem', fontWeight: 600 }}>USER</span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={`user-${i}`} size={12} fill={i < review.user_rating ? '#fbbf24' : 'transparent'} color={i < review.user_rating ? '#fbbf24' : 'var(--border-subtle)'} />
                ))}
              </div>
            )}
          </div>
        </div>
        {themes.length > 0 && (
          <div className="review-tags">
            {themes.map((t, i) => <span key={i} className="tag tag-theme">{t}</span>)}
          </div>
        )}
        {keywords.length > 0 && (
          <div className="review-tags">
            {keywords.map((k, i) => <span key={i} className="tag">{k}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
