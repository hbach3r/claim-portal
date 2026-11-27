import React, { useState, useEffect, useCallback } from 'react';
import { Claim, PageView } from './types/claim';
import { fetchClaims, deleteClaim } from './api/claimsApi';
import { ClaimForm } from './components/ClaimForm';
import { ClaimList } from './components/ClaimList';
import { ClaimCharts } from './components/ClaimCharts';

export const App: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<PageView>('claims');

  const loadClaims = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchClaims();
      setClaims(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch claims.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleClaimCreated = (newClaim: Claim) => {
    setClaims((prev) => [newClaim, ...prev]);
  };

  const handleDeleteClaim = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this claim?')) {
      return;
    }

    try {
      await deleteClaim(id);
      setClaims((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete claim.';
      alert(msg);
    }
  };

  // Summary Metrics
  const totalAmount = claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
  const submittedCount = claims.filter((c) => c.status === 'SUBMITTED').length;
  const approvedCount = claims.filter((c) => c.status === 'APPROVED').length;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-content">
            <h1>Claim Portal</h1>
            <p className="subtitle">Claims &amp; Damage Management Portal</p>
          </div>

          <nav className="header-nav">
            <button
              type="button"
              className={`nav-tab ${activePage === 'claims' ? 'nav-tab-active' : ''}`}
              onClick={() => setActivePage('claims')}
            >
              <span className="nav-icon">📋</span>
              <span>Claims</span>
              <span className="nav-counter">{claims.length}</span>
            </button>
            <button
              type="button"
              className={`nav-tab ${activePage === 'charts' ? 'nav-tab-active' : ''}`}
              onClick={() => setActivePage('charts')}
            >
              <span className="nav-icon">📊</span>
              <span>Analytics &amp; Charts</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={loadClaims} className="btn btn-secondary btn-sm" style={{ marginLeft: '1rem' }}>
              Retry
            </button>
          </div>
        )}

        {activePage === 'claims' ? (
          <>
            {/* KPI / Dashboard Summary */}
            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Claims</span>
                <span className="stat-value">{claims.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Claim Volume</span>
                <span className="stat-value">
                  {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(totalAmount)}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pending (Submitted)</span>
                <span className="stat-value text-blue">{submittedCount}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Approved</span>
                <span className="stat-value text-green">{approvedCount}</span>
              </div>
            </section>

            <div className="grid-layout">
              <section className="form-section">
                <ClaimForm onClaimCreated={handleClaimCreated} />
              </section>

              <section className="list-section">
                <ClaimList
                  claims={claims}
                  isLoading={isLoading}
                  onDeleteClaim={handleDeleteClaim}
                  onRefresh={loadClaims}
                />
              </section>
            </div>
          </>
        ) : (
          <ClaimCharts
            claims={claims}
            onNavigateToClaims={() => setActivePage('claims')}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Claim Portal &copy; 2026 - Powered by Spring Boot 3 &amp; React 18</p>
      </footer>
    </div>
  );
};

export default App;
