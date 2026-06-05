import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MessageSquare, LayoutDashboard, FileText, Upload, Plus, RefreshCw,
  Loader2, Package, Menu, Sun, Moon, Trash2, ChevronLeft, ChevronRight, Download
} from 'lucide-react';

import KpiCard from './components/KpiCard';
import SentimentChart from './components/SentimentChart';
import TimelineChart from './components/TimelineChart';
import ReviewCard from './components/ReviewCard';
import ReportPanel from './components/ReportPanel';
import AddReviewModal from './components/AddReviewModal';
import ImportCsvModal from './components/ImportCsvModal';

const API = 'http://localhost:8000';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [report, setReport] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [pageIndex, setPageIndex] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const pid = selectedProduct || undefined;
      const params = pid ? { product_id: pid } : {};
      const [s, t, rep, r, p] = await Promise.all([
        axios.get(`${API}/stats/`, { params }),
        axios.get(`${API}/stats/timeline/`, { params }),
        axios.get(`${API}/stats/report/`, { params }),
        axios.get(`${API}/reviews/`, { params: { ...params, limit: 50, skip: pageIndex * 50 } }),
        axios.get(`${API}/products/`),
      ]);
      setStats(s.data);
      setTimeline(t.data);
      setReport(rep.data);
      setReviews(r.data.items);
      setTotalReviews(r.data.total);
      setProducts(p.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedProduct]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onAdded = () => { setShowAddModal(false); setShowCsvModal(false); fetchAll(); };

  const handleDeleteAll = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer TOUS les avis ? Cette action est irréversible.")) {
      try {
        await axios.delete(`${API}/reviews/all`);
        setPageIndex(0);
        fetchAll();
      } catch (err) { console.error(err); }
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Supprimer cet avis ?")) {
      try {
        await axios.delete(`${API}/reviews/${id}`);
        fetchAll();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="app-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', flexDirection: isSidebarOpen ? 'row' : 'column', alignItems: 'center', gap: isSidebarOpen ? '0.6rem' : '1rem', width: '100%', marginBottom: '2.5rem' }}>
          {isSidebarOpen && (
            <>
              <MessageSquare size={24} style={{ flexShrink: 0 }} />
              <span>VoxAI</span>
            </>
          )}
          <div style={{ marginLeft: isSidebarOpen ? 'auto' : '0', display: 'flex', flexDirection: isSidebarOpen ? 'row' : 'column', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn-ghost" style={{ padding: '0.4rem', border: 'none', display: 'flex', alignItems: 'center' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Changer le thème">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn-ghost" style={{ padding: '0.4rem', border: 'none', display: 'flex', alignItems: 'center' }} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={18} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${page === 'dashboard' ? 'active' : ''}`} onClick={() => setPage('dashboard')} title="Dashboard">
            <LayoutDashboard size={18} style={{ flexShrink: 0 }} /> {isSidebarOpen && "Dashboard"}
          </button>
          <button className={`nav-item ${page === 'reviews' ? 'active' : ''}`} onClick={() => setPage('reviews')} title="Avis Clients">
            <MessageSquare size={18} style={{ flexShrink: 0 }} /> {isSidebarOpen && "Avis Clients"}
          </button>
          <button className={`nav-item ${page === 'report' ? 'active' : ''}`} onClick={() => setPage('report')} title="Rapport">
            <FileText size={18} style={{ flexShrink: 0 }} /> {isSidebarOpen && "Rapport"}
          </button>
        </nav>

        {isSidebarOpen && (
          <div className="sidebar-product-filter">
            <label>Filtrer par produit</label>
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Tous les produits</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </aside>

      {/* ===== MAIN ===== */}
      <main className="main-content">
        {loading && !stats ? (
          <div className="loading-center"><Loader2 size={40} className="spin" style={{ color: 'var(--accent-blue)' }} /></div>
        ) : (
          <>
            {page === 'dashboard' && <DashboardPage stats={stats} timeline={timeline} report={report} reviews={reviews} loading={loading} fetchAll={fetchAll} onAdd={() => setShowAddModal(true)} onCsv={() => setShowCsvModal(true)} goToReviews={() => setPage('reviews')} onDeleteAll={handleDeleteAll} />}
            {page === 'reviews' && <ReviewsPage reviews={reviews} loading={loading} fetchAll={fetchAll} onAdd={() => setShowAddModal(true)} onCsv={() => setShowCsvModal(true)} onDeleteAll={handleDeleteAll} onDeleteReview={handleDeleteReview} pageIndex={pageIndex} setPageIndex={setPageIndex} totalReviews={totalReviews} />}
            {page === 'report' && <ReportPage stats={stats} timeline={timeline} report={report} reviews={reviews} />}
          </>
        )}
      </main>

      {showAddModal && <AddReviewModal products={products} apiUrl={API} onClose={() => setShowAddModal(false)} onAdded={onAdded} />}
      {showCsvModal && <ImportCsvModal products={products} apiUrl={API} onClose={() => setShowCsvModal(false)} onDone={onAdded} />}
    </div>
  );
}

/* ===== DASHBOARD PAGE ===== */
function DashboardPage({ stats, timeline, report, reviews, loading, fetchAll, onAdd, onCsv, goToReviews, onDeleteAll }) {
  const posRate = stats?.total ? ((stats.sentiments.Positif || 0) / stats.total * 100).toFixed(1) : '0';
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Tableau de Bord</h1>
          <p>Vue d'ensemble de l'analyse de sentiment en temps réel</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" style={{ color: 'var(--color-negative)' }} onClick={onDeleteAll}><Trash2 size={16} /> Effacer données</button>
          <button className="btn btn-ghost" onClick={fetchAll}><RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualiser</button>
          <button className="btn btn-ghost" onClick={onCsv}><Upload size={16} /> Importer CSV</button>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> Nouvel Avis</button>
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard icon="messages" color="blue" label="Total Avis" value={stats?.total || 0} />
        <KpiCard icon="star" color="yellow" label="Score Moyen" value={`${stats?.average_score || 0}/5`} />
        <KpiCard icon="trending" color="green" label="Taux Positif" value={`${posRate}%`} />
        <KpiCard icon="globe" color="violet" label="Sources" value={Object.keys(stats?.sources || {}).length} />
      </div>

      <div className="charts-row">
        <div className="card">
          <div className="section-header"><span className="section-title">Répartition des Sentiments</span></div>
          <SentimentChart data={stats?.sentiments || {}} type="pie" />
        </div>
        <div className="card">
          <div className="section-header"><span className="section-title">Avis par Source</span></div>
          <SentimentChart data={stats?.sources || {}} type="bar" />
        </div>
      </div>

      <div className="charts-row">
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header"><span className="section-title">Évolution du Sentiment</span><span className="section-subtitle">Score moyen par jour</span></div>
          <TimelineChart data={timeline} />
        </div>
      </div>

      {report && (
        <div className="report-row">
          <ReportPanel title="Thèmes Récurrents" data={report.themes} color="#a78bfa" />
          <div className="card">
            <div className="section-header"><span className="section-title">Synthèse Qualitative</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--color-positive)', marginBottom: '0.5rem' }}>✦ Points Forts</h4>
                <div className="report-list">
                  {Object.entries(report.points_forts || {}).map(([k, v]) => (
                    <div className="report-item" key={k}><span>{k}</span><span style={{ color: 'var(--color-positive)', fontWeight: 600 }}>{v}</span></div>
                  ))}
                  {Object.keys(report.points_forts || {}).length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucune donnée</span>}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--color-negative)', marginBottom: '0.5rem' }}>⚑ Points d'Amélioration</h4>
                <div className="report-list">
                  {Object.entries(report.points_amelioration || {}).map(([k, v]) => (
                    <div className="report-item" key={k}><span>{k}</span><span style={{ color: 'var(--color-negative)', fontWeight: 600 }}>{v}</span></div>
                  ))}
                  {Object.keys(report.points_amelioration || {}).length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aucune donnée</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header" style={{ marginTop: '1rem' }}>
        <span className="section-title">Avis Récents</span>
        <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={goToReviews}>Voir tout →</button>
      </div>
      <div className="reviews-grid">
        {reviews.slice(0, 6).map(r => <ReviewCard key={r.id} review={r} />)}
      </div>
    </div>
  );
}

/* ===== REVIEWS PAGE ===== */
function ReviewsPage({ reviews, loading, fetchAll, onAdd, onCsv, onDeleteAll, onDeleteReview, pageIndex, setPageIndex, totalReviews }) {
  const totalPages = Math.ceil(totalReviews / 50);
  const [filter, setFilter] = React.useState('Tous');

  const filtered = filter === 'Tous' ? reviews : reviews.filter(r => r.sentiment === filter);

  const filterBtns = [
    { label: 'Tous', value: 'Tous', color: 'var(--accent-blue)' },
    { label: 'Positif', value: 'Positif', color: 'var(--color-positive)' },
    { label: 'Neutre', value: 'Neutre', color: 'var(--color-neutral)' },
    { label: 'Négatif', value: 'Négatif', color: 'var(--color-negative)' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Avis Clients</h1>
          <p>{totalReviews} avis collectés et analysés par l'agent IA (Page {pageIndex + 1}/{Math.max(1, totalPages)})</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" style={{ color: 'var(--color-negative)' }} onClick={onDeleteAll}><Trash2 size={16} /> Effacer tout</button>
          <button className="btn btn-ghost" onClick={fetchAll}><RefreshCw size={16} className={loading ? 'spin' : ''} /></button>
          <button className="btn btn-ghost" onClick={onCsv}><Upload size={16} /> Importer CSV</button>
          <button className="btn btn-primary" onClick={onAdd}><Plus size={16} /> Nouvel Avis</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {filterBtns.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '999px',
              border: filter === f.value ? `2px solid ${f.color}` : '2px solid var(--border-color)',
              background: filter === f.value ? f.color : 'transparent',
              color: filter === f.value ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
              transition: 'all 0.2s ease',
            }}
          >
            {f.label} {f.value !== 'Tous' && `(${reviews.filter(r => r.sentiment === f.value).length})`}
          </button>
        ))}
      </div>

      <div className="reviews-grid">
        {filtered.map(r => <ReviewCard key={r.id} review={r} onDelete={() => onDeleteReview(r.id)} />)}
        {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucun avis {filter !== 'Tous' ? `"${filter}"` : ''} pour le moment.</p>}
      </div>
      
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-ghost" 
            disabled={pageIndex === 0} 
            onClick={() => setPageIndex(p => Math.max(0, p - 1))}
          >
            <ChevronLeft size={16} /> Précédent
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Page {pageIndex + 1} sur {totalPages}
          </span>
          <button 
            className="btn btn-ghost" 
            disabled={pageIndex >= totalPages - 1} 
            onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))}
          >
            Suivant <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== REPORT PAGE ===== */
function ReportPage({ stats, timeline, report, reviews }) {
  const total = stats?.total || 0;
  const avg = stats?.average_score || 0;
  const sentiments = stats?.sentiments || {};
  const themes = report?.themes || {};
  const forts = report?.points_forts || {};
  const amelio = report?.points_amelioration || {};

  const exportReport = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const sentimentRows = Object.entries(sentiments).map(([k, v]) =>
      `<tr><td>${k}</td><td style="text-align:center">${v}</td><td style="text-align:center">${(v / total * 100).toFixed(1)}%</td></tr>`
    ).join('');

    const themeRows = Object.entries(themes).map(([k, v]) =>
      `<tr><td>${k}</td><td style="text-align:center">${v}</td></tr>`
    ).join('') || '<tr><td colspan="2" style="color:#999">Pas assez de données</td></tr>';

    const fortRows = Object.entries(forts).map(([k, v]) =>
      `<tr><td>${k}</td><td style="text-align:center;color:#22c55e">${v} mentions</td></tr>`
    ).join('') || '<tr><td colspan="2" style="color:#999">Aucun point fort détecté</td></tr>';

    const amelioRows = Object.entries(amelio).map(([k, v]) =>
      `<tr><td>${k}</td><td style="text-align:center;color:#ef4444">${v} mentions</td></tr>`
    ).join('') || '<tr><td colspan="2" style="color:#999">Aucun point d\'amélioration détecté</td></tr>';

    const topReviews = (reviews || []).slice(0, 10).map((r, i) =>
      `<tr><td style="text-align:center">${i + 1}</td><td>${r.text?.substring(0, 120)}${r.text?.length > 120 ? '…' : ''}</td><td style="text-align:center"><span style="padding:2px 10px;border-radius:12px;font-size:0.8rem;background:${r.sentiment === 'Positif' ? '#dcfce7;color:#16a34a' : r.sentiment === 'Négatif' ? '#fef2f2;color:#dc2626' : '#fefce8;color:#ca8a04'}">${r.sentiment}</span></td><td style="text-align:center">${r.ai_score?.toFixed(1) || '—'}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>VoxAI — Rapport d'Analyse</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 48px; line-height: 1.6; background: #fff; }
  .cover { text-align: center; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 3px solid #2563eb; }
  .cover h1 { font-size: 2.2rem; color: #2563eb; margin-bottom: 4px; }
  .cover .subtitle { font-size: 1.1rem; color: #64748b; }
  .cover .meta { margin-top: 16px; font-size: 0.85rem; color: #94a3b8; }
  h2 { font-size: 1.15rem; color: #2563eb; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem; }
  th { background: #f1f5f9; color: #475569; text-align: left; padding: 10px 14px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
  td { padding: 9px 14px; border-bottom: 1px solid #f1f5f9; }
  tr:hover { background: #f8fafc; }
  .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
  .kpi { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; text-align: center; }
  .kpi .value { font-size: 1.8rem; font-weight: 700; color: #2563eb; }
  .kpi .label { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
  .footer { margin-top: 40px; text-align: center; font-size: 0.75rem; color: #cbd5e1; border-top: 1px solid #f1f5f9; padding-top: 16px; }
  @media print { body { padding: 24px; } .no-print { display: none; } }
</style></head><body>
  <div class="cover">
    <h1>🎤 VoxAI — Rapport d'Analyse de Sentiment</h1>
    <p class="subtitle">Analyse intelligente des avis clients propulsée par l'Intelligence Artificielle</p>
    <p class="meta">Généré le ${dateStr} à ${timeStr} • ${total} avis analysés</p>
  </div>

  <h2>📊 Indicateurs Clés (KPI)</h2>
  <div class="kpi-row">
    <div class="kpi"><div class="value">${total}</div><div class="label">Total Avis</div></div>
    <div class="kpi"><div class="value">${avg.toFixed(1)}/5</div><div class="label">Score Moyen</div></div>
    <div class="kpi"><div class="value">${sentiments['Positif'] || 0}</div><div class="label">Positifs</div></div>
    <div class="kpi"><div class="value">${sentiments['Négatif'] || 0}</div><div class="label">Négatifs</div></div>
  </div>

  <h2>1. Répartition des Sentiments</h2>
  <table><thead><tr><th>Sentiment</th><th style="text-align:center">Nombre</th><th style="text-align:center">Pourcentage</th></tr></thead><tbody>${sentimentRows}</tbody></table>

  <h2>2. Thèmes Récurrents</h2>
  <table><thead><tr><th>Thème</th><th style="text-align:center">Occurrences</th></tr></thead><tbody>${themeRows}</tbody></table>

  <h2>3. Points Forts</h2>
  <table><thead><tr><th>Point Fort</th><th style="text-align:center">Mentions</th></tr></thead><tbody>${fortRows}</tbody></table>

  <h2>4. Points d'Amélioration</h2>
  <table><thead><tr><th>Axe d'Amélioration</th><th style="text-align:center">Mentions</th></tr></thead><tbody>${amelioRows}</tbody></table>

  ${topReviews ? `<h2>5. Échantillon d'Avis (Top 10)</h2>
  <table><thead><tr><th style="text-align:center">#</th><th>Avis</th><th style="text-align:center">Sentiment</th><th style="text-align:center">Score IA</th></tr></thead><tbody>${topReviews}</tbody></table>` : ''}

  <div class="footer">VoxAI — Agent IA d'Analyse de Sentiment pour le Marketing Digital • Projet PFF 2025-2026 • ESRMI × IDS</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => { setTimeout(() => win.print(), 500); };
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><h1>Rapport d'Analyse</h1><p>Synthèse automatique générée par l'agent IA — {total} avis analysés</p></div>
        <button className="btn btn-primary" onClick={exportReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={16} /> Exporter en PDF
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>1. Répartition des Sentiments</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <SentimentChart data={stats?.sentiments || {}} type="pie" />
          <div className="report-list">
            {Object.entries(stats?.sentiments || {}).map(([k, v]) => (
              <div className="report-item" key={k}>
                <span className={`badge badge-${k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}>{k}</span>
                <div className="report-bar">
                  <div className="report-bar-fill" style={{ width: `${(v / total * 100)}%`, background: k === 'Positif' ? 'var(--color-positive)' : k === 'Négatif' ? 'var(--color-negative)' : 'var(--color-neutral)' }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{v} ({(v / total * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>2. Évolution du Sentiment dans le Temps</h3>
        <TimelineChart data={timeline} />
      </div>

      <div className="report-row">
        <ReportPanel title="3. Thèmes Récurrents" data={report?.themes || {}} color="#a78bfa" />
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>4. Tendances Principales</h3>
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-positive)', marginBottom: '0.5rem' }}>✦ Points Forts du Produit / Service</h4>
            <div className="report-list">
              {Object.entries(report?.points_forts || {}).map(([k, v]) => (
                <div className="report-item" key={k}><span>{k}</span><span style={{ color: 'var(--color-positive)', fontWeight: 600 }}>{v} mentions</span></div>
              ))}
              {Object.keys(report?.points_forts || {}).length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pas assez de données positives</span>}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-negative)', marginBottom: '0.5rem' }}>⚑ Points d'Amélioration Mentionnés</h4>
            <div className="report-list">
              {Object.entries(report?.points_amelioration || {}).map(([k, v]) => (
                <div className="report-item" key={k}><span>{k}</span><span style={{ color: 'var(--color-negative)', fontWeight: 600 }}>{v} mentions</span></div>
              ))}
              {Object.keys(report?.points_amelioration || {}).length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pas assez de données négatives</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
