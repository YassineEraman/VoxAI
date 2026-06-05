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
    const posPercent = total > 0 ? ((sentiments['Positif'] || 0) / total * 100).toFixed(1) : '0.0';
    const neuPercent = total > 0 ? ((sentiments['Neutre'] || 0) / total * 100).toFixed(1) : '0.0';
    const negPercent = total > 0 ? ((sentiments['Négatif'] || 0) / total * 100).toFixed(1) : '0.0';
    const scoreEmoji = avg >= 4 ? '\u{1F7E2}' : avg >= 3 ? '\u{1F7E1}' : '\u{1F534}';
    const scoreLabel = avg >= 4 ? 'Excellent' : avg >= 3 ? 'Correct' : 'À améliorer';

    const sentimentRows = Object.entries(sentiments).map(([k, v]) => {
      const pct = total > 0 ? (v / total * 100).toFixed(1) : '0.0';
      const color = k === 'Positif' ? '#22c55e' : k === 'Négatif' ? '#ef4444' : '#eab308';
      return '<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + color + ';margin-right:8px"></span>' + k + '</td><td style="text-align:center;font-weight:600">' + v + '</td><td style="text-align:center">' + pct + '%</td><td><div style="background:#f1f5f9;border-radius:8px;height:8px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:8px"></div></div></td></tr>';
    }).join('');

    const themeRows = Object.entries(themes).map(([k, v]) => {
      const maxT = Math.max(...Object.values(themes));
      const pct = maxT > 0 ? (v / maxT * 100) : 0;
      return '<tr><td>' + k + '</td><td style="text-align:center;font-weight:600">' + v + '</td><td style="width:40%"><div style="background:#f1f5f9;border-radius:8px;height:8px;overflow:hidden"><div style="width:' + pct + '%;height:100%;background:linear-gradient(90deg,#818cf8,#a78bfa);border-radius:8px"></div></div></td></tr>';
    }).join('') || '<tr><td colspan="3" style="color:#94a3b8;font-style:italic">Pas assez de données</td></tr>';

    const fortRows = Object.entries(forts).map(([k, v]) =>
      '<tr><td><span style="color:#22c55e;margin-right:6px">\u25CF</span>' + k + '</td><td style="text-align:center;color:#22c55e;font-weight:600">' + v + '</td></tr>'
    ).join('') || '<tr><td colspan="2" style="color:#94a3b8;font-style:italic">Aucun point fort détecté</td></tr>';

    const amelioRows = Object.entries(amelio).map(([k, v]) =>
      '<tr><td><span style="color:#ef4444;margin-right:6px">\u25CF</span>' + k + '</td><td style="text-align:center;color:#ef4444;font-weight:600">' + v + '</td></tr>'
    ).join('') || '<tr><td colspan="2" style="color:#94a3b8;font-style:italic">Aucun point d\'amélioration détecté</td></tr>';

    const topReviews = (reviews || []).slice(0, 15).map((r, i) => {
      const bg = r.sentiment === 'Positif' ? '#dcfce7' : r.sentiment === 'Négatif' ? '#fef2f2' : '#fefce8';
      const fg = r.sentiment === 'Positif' ? '#16a34a' : r.sentiment === 'Négatif' ? '#dc2626' : '#ca8a04';
      return '<tr><td style="text-align:center;color:#94a3b8;font-weight:600">' + (i + 1) + '</td><td style="font-size:0.82rem;line-height:1.4">' + (r.text || '').substring(0, 140) + (r.text?.length > 140 ? '\u2026' : '') + '</td><td style="text-align:center"><span style="padding:3px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;background:' + bg + ';color:' + fg + '">' + r.sentiment + '</span></td><td style="text-align:center;font-weight:600">' + (r.ai_score?.toFixed(1) || '\u2014') + '/5</td></tr>';
    }).join('');

    const css = [
      '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");',
      '@page { margin: 20mm 18mm 24mm 18mm; }',
      '* { margin:0; padding:0; box-sizing:border-box; }',
      'body { font-family:"Inter",-apple-system,sans-serif; color:#1e293b; line-height:1.65; background:#fff; font-size:13px; }',
      '.cover-page { min-height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; page-break-after:always; padding:60px 40px; }',
      '.cover-logo { width:80px; height:80px; background:linear-gradient(135deg,#2563eb,#7c3aed); border-radius:20px; display:flex; align-items:center; justify-content:center; margin:0 auto 28px; box-shadow:0 8px 32px rgba(37,99,235,0.25); }',
      '.cover-logo span { color:#fff; font-size:28px; font-weight:800; }',
      '.cover-page h1 { font-size:2.4rem; font-weight:800; color:#2563eb; margin-bottom:8px; }',
      '.cover-page .tagline { font-size:1.1rem; color:#64748b; margin-bottom:40px; max-width:500px; }',
      '.cover-info { background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:28px 40px; margin-top:20px; min-width:400px; }',
      '.cover-info .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f5f9; }',
      '.cover-info .row:last-child { border-bottom:none; }',
      '.cover-info .lbl { color:#94a3b8; font-size:0.85rem; }',
      '.cover-info .val { font-weight:600; color:#1e293b; font-size:0.85rem; }',
      '.cover-company { margin-top:48px; padding-top:28px; border-top:1px solid #e2e8f0; }',
      '.cover-company .name { font-size:0.9rem; font-weight:600; color:#475569; }',
      '.cover-company .desc { font-size:0.8rem; color:#94a3b8; margin-top:4px; }',
      '.content { padding:0 8px; }',
      '.section { page-break-inside:avoid; margin-bottom:28px; }',
      'h2 { font-size:1.05rem; color:#1e293b; font-weight:700; margin:0 0 14px; padding:10px 16px; background:linear-gradient(90deg,#f8fafc,#fff); border-left:4px solid #2563eb; border-radius:0 8px 8px 0; }',
      'h2 .num { color:#2563eb; margin-right:6px; }',
      '.kpi-row { display:flex; gap:14px; margin-bottom:28px; page-break-inside:avoid; }',
      '.kpi { flex:1; background:linear-gradient(135deg,#f8fafc,#fff); border:1px solid #e2e8f0; border-radius:14px; padding:20px 12px; text-align:center; }',
      '.kpi .icon { font-size:1.4rem; margin-bottom:4px; }',
      '.kpi .value { font-size:1.7rem; font-weight:800; color:#2563eb; }',
      '.kpi .label { font-size:0.68rem; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px; }',
      '.kpi.positive .value { color:#22c55e; } .kpi.negative .value { color:#ef4444; } .kpi.score .value { color:#7c3aed; }',
      'table { width:100%; border-collapse:separate; border-spacing:0; margin-bottom:6px; font-size:0.85rem; border-radius:10px; overflow:hidden; border:1px solid #e2e8f0; }',
      'thead th { background:#f1f5f9; color:#475569; text-align:left; padding:10px 14px; font-weight:600; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.3px; }',
      'td { padding:10px 14px; border-top:1px solid #f1f5f9; }',
      '.verdict { page-break-inside:avoid; background:linear-gradient(135deg,#eff6ff,#f5f3ff); border:1px solid #dbeafe; border-radius:14px; padding:24px; margin-bottom:28px; text-align:center; }',
      '.verdict h3 { font-size:1rem; color:#1e293b; margin-bottom:8px; }',
      '.verdict .score-big { font-size:2.2rem; font-weight:800; color:#2563eb; }',
      '.page-footer { margin-top:32px; text-align:center; font-size:0.7rem; color:#cbd5e1; border-top:1px solid #f1f5f9; padding-top:16px; page-break-inside:avoid; }',
      '.page-footer .brand { font-weight:600; color:#94a3b8; }',
      '@media print { .section{page-break-inside:avoid} table{page-break-inside:avoid} .kpi-row{page-break-inside:avoid} .verdict{page-break-inside:avoid} tr{page-break-inside:avoid} }',
    ].join(' ');

    const verdictBg = avg >= 4 ? '#dcfce7;color:#16a34a' : avg >= 3 ? '#fefce8;color:#ca8a04' : '#fef2f2;color:#dc2626';

    const html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>VoxAI — Rapport Professionnel</title><style>' + css + '</style></head><body>' +
    '<div class="cover-page">' +
    '<div class="cover-logo"><span>V</span></div>' +
    '<h1>VoxAI</h1>' +
    '<p class="tagline">Rapport d\'Analyse de Sentiment — Intelligence Artificielle appliquée au Marketing Digital</p>' +
    '<div class="cover-info">' +
    '<div class="row"><span class="lbl">Date de génération</span><span class="val">' + dateStr + ' à ' + timeStr + '</span></div>' +
    '<div class="row"><span class="lbl">Avis analysés</span><span class="val">' + total + ' avis</span></div>' +
    '<div class="row"><span class="lbl">Score moyen</span><span class="val">' + scoreEmoji + ' ' + avg.toFixed(1) + '/5 — ' + scoreLabel + '</span></div>' +
    '<div class="row"><span class="lbl">Moteur IA</span><span class="val">BERT Multilingual + spaCy NLP</span></div>' +
    '</div>' +
    '<div class="cover-company"><p class="name">Propulsé par VoxAI — Agent IA d\'Analyse de Sentiment</p><p class="desc">Projet de Fin de Formation \u2022 ESRMI \u00d7 IDS \u00d7 GIZ \u2022 2025-2026</p></div>' +
    '</div>' +

    '<div class="content">' +
    '<div class="verdict"><h3>Verdict Global de l\'Analyse</h3><div class="score-big">' + avg.toFixed(1) + ' / 5</div><div style="display:inline-block;padding:4px 16px;border-radius:20px;font-size:0.8rem;font-weight:600;margin-top:8px;background:' + verdictBg + '">' + scoreEmoji + ' ' + scoreLabel + '</div></div>' +

    '<div class="kpi-row">' +
    '<div class="kpi"><div class="icon">\u{1F4CA}</div><div class="value">' + total + '</div><div class="label">Total Avis</div></div>' +
    '<div class="kpi score"><div class="icon">\u2B50</div><div class="value">' + avg.toFixed(1) + '</div><div class="label">Score Moyen</div></div>' +
    '<div class="kpi positive"><div class="icon">\u{1F60A}</div><div class="value">' + (sentiments['Positif'] || 0) + '</div><div class="label">Positifs (' + posPercent + '%)</div></div>' +
    '<div class="kpi"><div class="icon">\u{1F610}</div><div class="value">' + (sentiments['Neutre'] || 0) + '</div><div class="label">Neutres (' + neuPercent + '%)</div></div>' +
    '<div class="kpi negative"><div class="icon">\u{1F61E}</div><div class="value">' + (sentiments['Négatif'] || 0) + '</div><div class="label">Négatifs (' + negPercent + '%)</div></div>' +
    '</div>' +

    '<div class="section"><h2><span class="num">01</span> Répartition des Sentiments</h2><table><thead><tr><th>Sentiment</th><th style="text-align:center">Nombre</th><th style="text-align:center">%</th><th>Distribution</th></tr></thead><tbody>' + sentimentRows + '</tbody></table></div>' +
    '<div class="section"><h2><span class="num">02</span> Thèmes Récurrents Détectés</h2><table><thead><tr><th>Thème</th><th style="text-align:center">Occurrences</th><th>Distribution</th></tr></thead><tbody>' + themeRows + '</tbody></table></div>' +
    '<div class="section"><h2><span class="num">03</span> Points Forts Identifiés</h2><table><thead><tr><th>Point Fort</th><th style="text-align:center">Mentions</th></tr></thead><tbody>' + fortRows + '</tbody></table></div>' +
    '<div class="section"><h2><span class="num">04</span> Axes d\'Amélioration</h2><table><thead><tr><th>Axe d\'Amélioration</th><th style="text-align:center">Mentions</th></tr></thead><tbody>' + amelioRows + '</tbody></table></div>' +

    (topReviews ? '<div class="section"><h2><span class="num">05</span> Échantillon d\'Avis Analysés</h2><table><thead><tr><th style="text-align:center;width:40px">#</th><th>Contenu</th><th style="text-align:center">Sentiment</th><th style="text-align:center">Score</th></tr></thead><tbody>' + topReviews + '</tbody></table></div>' : '') +

    '<div class="page-footer"><p class="brand">VoxAI — Agent IA d\'Analyse de Sentiment pour le Marketing Digital</p><p>Rapport généré automatiquement le ' + dateStr + ' à ' + timeStr + ' \u2022 Projet PFF 2025-2026 \u2022 ESRMI \u00d7 IDS \u00d7 GIZ</p><p style="margin-top:6px;color:#e2e8f0">— Document confidentiel —</p></div>' +
    '</div></body></html>';

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
