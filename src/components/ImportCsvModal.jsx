import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Upload, Loader2, FileText } from 'lucide-react';

export default function ImportCsvModal({ products, apiUrl, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [source, setSource] = useState('CSV');
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const inputRef = useRef();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      let finalProductId = productId;
      if (isNewProduct && newProductName.trim()) {
        const prodRes = await axios.post(`${apiUrl}/products/`, { name: newProductName, description: '' });
        finalProductId = prodRes.data.id;
      }

      const form = new FormData();
      form.append('file', file);
      form.append('source', source);
      if (finalProductId) form.append('product_id', finalProductId);
      const res = await axios.post(`${apiUrl}/import-csv/`, form);
      setResult(res.data.message);
    } catch (err) {
      setError("Erreur lors de l'import : " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={18} style={{ color: 'var(--accent-blue)' }} /> Importer un fichier CSV
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Le fichier CSV doit contenir au minimum une colonne <strong>text</strong>. Colonnes optionnelles : <strong>source</strong>, <strong>date</strong>, <strong>product_id</strong>.
        </p>

        <div
          className="file-drop"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
        >
          <input ref={inputRef} type="file" accept=".csv" hidden onChange={e => setFile(e.target.files[0])} />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <FileText size={20} /> {file.name}
            </div>
          ) : (
            <span>Glissez un fichier CSV ici ou cliquez pour parcourir</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Source par défaut</label>
            <select value={source} onChange={e => setSource(e.target.value)}>
              <option value="CSV">CSV</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
              <option value="Google">Google</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Produit / Service</label>
            {!isNewProduct ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select value={productId} onChange={e => setProductId(e.target.value)} style={{ flex: 1 }}>
                  <option value="">— Aucun —</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button type="button" className="btn btn-ghost" onClick={() => setIsNewProduct(true)} title="Nouveau produit" style={{ padding: '0 0.5rem' }}>
                  <Plus size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" placeholder="Nom du produit..." value={newProductName} onChange={e => setNewProductName(e.target.value)} style={{ flex: 1 }} />
                <button type="button" className="btn btn-ghost" onClick={() => { setIsNewProduct(false); setNewProductName(''); }} title="Annuler" style={{ padding: '0 0.5rem' }}>
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <p style={{ color: 'var(--color-negative)', fontSize: '0.85rem', marginTop: '1rem' }}>{error}</p>}
        {result && <p style={{ color: 'var(--color-positive)', fontSize: '0.85rem', marginTop: '1rem' }}>✅ {result}</p>}

        <div className="modal-footer">
          {result ? (
            <button className="btn btn-primary" onClick={onDone}>Fermer</button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={loading || !file}>
                {loading ? <><Loader2 size={16} className="spin" /> Import en cours...</> : "Importer et Analyser"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
