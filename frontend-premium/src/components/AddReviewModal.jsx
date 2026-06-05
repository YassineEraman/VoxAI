import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2, Sparkles } from 'lucide-react';

export default function AddReviewModal({ products, apiUrl, onClose, onAdded }) {
  const [source, setSource] = useState('Google');
  const [text, setText] = useState('');
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = { source, text, product_id: productId ? parseInt(productId) : null };
      const res = await axios.post(`${apiUrl}/reviews/`, payload);
      setResult(res.data);
    } catch (err) {
      setError("Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-blue)' }} /> Analyser un avis
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Source</label>
              <select value={source} onChange={e => setSource(e.target.value)}>
                <option value="Google">Google</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Facebook">Facebook</option>
                <option value="Twitter">Twitter</option>
                <option value="Email">Email</option>
                <option value="Web">Formulaire Web</option>
              </select>
            </div>
            <div className="form-group">
              <label>Produit / Service (optionnel)</label>
              <select value={productId} onChange={e => setProductId(e.target.value)}>
                <option value="">— Aucun —</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Texte du commentaire</label>
              <textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Ex : Le service client a été rapide et très professionnel..." />
            </div>
            {error && <p style={{ color: 'var(--color-negative)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
                {loading ? <><Loader2 size={16} className="spin" /> Analyse IA...</> : "Lancer l'analyse"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {result.sentiment === 'Positif' ? '😊' : result.sentiment === 'Négatif' ? '😞' : '😐'}
              </div>
              <span className={`badge badge-${result.sentiment.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`} style={{ fontSize: '0.9rem', padding: '0.35rem 1rem' }}>
                {result.sentiment} — {result.score}/5
              </span>
            </div>
            {result.themes && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Thèmes détectés</label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {result.themes.split(',').map((t, i) => <span key={i} className="tag tag-theme">{t.trim()}</span>)}
                </div>
              </div>
            )}
            {result.keywords && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Mots-clés</label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {result.keywords.split(',').map((k, i) => <span key={i} className="tag">{k.trim()}</span>)}
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setResult(null); setText(''); }}>Nouveau test</button>
              <button className="btn btn-primary" onClick={onAdded}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
