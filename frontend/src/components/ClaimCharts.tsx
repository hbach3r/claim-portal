import React, { useState, useMemo } from 'react';
import { Claim, ClaimStatus, StatusMetric, AmountBracketMetric } from '../types/claim';

interface ClaimChartsProps {
  claims: Claim[];
  onNavigateToClaims?: () => void;
}

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; bgClass: string }> = {
  SUBMITTED: { label: 'Submitted', color: '#2563eb', bgClass: 'badge-submitted' },
  IN_REVIEW: { label: 'In Review', color: '#d97706', bgClass: 'badge-review' },
  APPROVED: { label: 'Approved', color: '#16a34a', bgClass: 'badge-approved' },
  REJECTED: { label: 'Rejected', color: '#dc2626', bgClass: 'badge-rejected' },
  SETTLED: { label: 'Settled', color: '#64748b', bgClass: 'badge-settled' },
};

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const ClaimCharts: React.FC<ClaimChartsProps> = ({ claims, onNavigateToClaims }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'status' | 'volume' | 'brackets'>('all');
  const [hoveredStatus, setHoveredStatus] = useState<ClaimStatus | null>(null);

  // 1. KPI Calculations
  const totalClaimsCount = claims.length;
  const totalVolume = useMemo(() => claims.reduce((acc, c) => acc + (c.claimAmount || 0), 0), [claims]);
  const averageClaim = totalClaimsCount > 0 ? totalVolume / totalClaimsCount : 0;
  const maxClaim = useMemo(() => (claims.length > 0 ? Math.max(...claims.map((c) => c.claimAmount || 0)) : 0), [claims]);

  const approvedOrSettledCount = useMemo(
    () => claims.filter((c) => c.status === 'APPROVED' || c.status === 'SETTLED').length,
    [claims]
  );
  const approvalRate = totalClaimsCount > 0 ? (approvedOrSettledCount / totalClaimsCount) * 100 : 0;

  // 2. Status Breakdown Metrics
  const statusMetrics: StatusMetric[] = useMemo(() => {
    const statuses: ClaimStatus[] = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED'];
    return statuses.map((st) => {
      const filtered = claims.filter((c) => c.status === st);
      const count = filtered.length;
      const totalAmount = filtered.reduce((acc, c) => acc + (c.claimAmount || 0), 0);
      const percentage = totalClaimsCount > 0 ? (count / totalClaimsCount) * 100 : 0;
      return {
        status: st,
        label: STATUS_CONFIG[st].label,
        count,
        totalAmount,
        percentage,
        color: STATUS_CONFIG[st].color,
      };
    });
  }, [claims, totalClaimsCount]);

  // 3. Amount Brackets Breakdown Metrics
  const bracketMetrics: AmountBracketMetric[] = useMemo(() => {
    const brackets = [
      { bracket: '< €1.000', min: 0, max: 1000 },
      { bracket: '€1.000 - €5.000', min: 1000, max: 5000 },
      { bracket: '€5.000 - €10.000', min: 5000, max: 10000 },
      { bracket: '> €10.000', min: 10000, max: null },
    ];

    return brackets.map((b) => {
      const inBracket = claims.filter((c) => {
        const amt = c.claimAmount || 0;
        if (b.max === null) return amt >= b.min;
        return amt >= b.min && amt < b.max;
      });
      const count = inBracket.length;
      const totalAmount = inBracket.reduce((acc, c) => acc + (c.claimAmount || 0), 0);
      const percentage = totalClaimsCount > 0 ? (count / totalClaimsCount) * 100 : 0;
      return {
        bracket: b.bracket,
        min: b.min,
        max: b.max,
        count,
        totalAmount,
        percentage,
      };
    });
  }, [claims, totalClaimsCount]);

  // 4. Timeline / Monthly Aggregation
  const monthlyMetrics = useMemo(() => {
    const map = new Map<string, { label: string; count: number; totalAmount: number }>();

    claims.forEach((c) => {
      let key = 'Unknown';
      let label = 'Unknown';
      if (c.createdAt) {
        try {
          const d = new Date(c.createdAt);
          if (!isNaN(d.getTime())) {
            key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          }
        } catch {
          // ignore date parse errors
        }
      }
      const existing = map.get(key) || { label, count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += c.claimAmount || 0;
      map.set(key, existing);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, data]) => ({ key, ...data }));
  }, [claims]);

  // Donut chart geometry
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  if (totalClaimsCount === 0) {
    return (
      <div className="claim-card charts-empty-state">
        <div className="empty-icon">📊</div>
        <h2>No Claim Data Available to Chart</h2>
        <p className="empty-desc">
          There are currently no claims registered in the system. Submit claims first to view comprehensive visual analytics, status distributions, and financial volume breakdowns.
        </p>
        {onNavigateToClaims && (
          <button onClick={onNavigateToClaims} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Go to Claims Management
          </button>
        )}
      </div>
    );
  }

  // Find max values for dynamic bar chart scaling
  const maxVolumeInStatus = Math.max(...statusMetrics.map((s) => s.totalAmount), 1);
  const maxCountInBrackets = Math.max(...bracketMetrics.map((b) => b.count), 1);

  return (
    <div className="charts-page-container">
      {/* Analytics Header & View Toggles */}
      <div className="charts-header">
        <div>
          <h2>Claim Data Insights &amp; Visual Analytics</h2>
          <p className="charts-subtitle">
            Comprehensive breakdown of claims across status distributions, financial exposure, and claim size tiers.
          </p>
        </div>
        <div className="chart-view-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Aspects
          </button>
          <button
            className={`tab-btn ${activeTab === 'status' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            Status Distribution
          </button>
          <button
            className={`tab-btn ${activeTab === 'volume' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('volume')}
          >
            Financial Volume
          </button>
          <button
            className={`tab-btn ${activeTab === 'brackets' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('brackets')}
          >
            Amount Brackets
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Claims</span>
          <span className="stat-value text-blue">{totalClaimsCount}</span>
          <span className="stat-subtext">Active records analyzed</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Claim Volume</span>
          <span className="stat-value">{formatCurrency(totalVolume)}</span>
          <span className="stat-subtext">Portfolio financial exposure</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Claim Value</span>
          <span className="stat-value">{formatCurrency(averageClaim)}</span>
          <span className="stat-subtext">Mean severity per incident</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Highest Single Claim</span>
          <span className="stat-value">{formatCurrency(maxClaim)}</span>
          <span className="stat-subtext">Peak exposure record</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Resolved / Approved</span>
          <span className="stat-value text-green">{approvalRate.toFixed(0)}%</span>
          <span className="stat-subtext">{approvedOrSettledCount} of {totalClaimsCount} claims</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* CHART 1: Status Distribution (Donut Chart & Legend Table) */}
        {(activeTab === 'all' || activeTab === 'status') && (
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">Claims by Status Distribution</h3>
                <p className="chart-desc">Proportion of claims across life-cycle states</p>
              </div>
            </div>

            <div className="donut-chart-container">
              {/* SVG Donut */}
              <div className="donut-wrapper">
                <svg className="donut-svg" viewBox="0 0 180 180">
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="24"
                  />
                  {statusMetrics.map((metric) => {
                    if (metric.count === 0) return null;
                    const strokeDasharray = `${(metric.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                    accumulatedPercent += metric.percentage;
                    const isHovered = hoveredStatus === metric.status;

                    return (
                      <circle
                        key={metric.status}
                        cx="90"
                        cy="90"
                        r={radius}
                        fill="transparent"
                        stroke={metric.color}
                        strokeWidth={isHovered ? 28 : 24}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                          cursor: 'pointer',
                          opacity: hoveredStatus && !isHovered ? 0.45 : 1,
                        }}
                        onMouseEnter={() => setHoveredStatus(metric.status)}
                        onMouseLeave={() => setHoveredStatus(null)}
                      />
                    );
                  })}
                </svg>

                <div className="donut-center-info">
                  {hoveredStatus ? (
                    <>
                      <span className="donut-center-label">{STATUS_CONFIG[hoveredStatus].label}</span>
                      <span className="donut-center-value">
                        {statusMetrics.find((s) => s.status === hoveredStatus)?.count || 0}
                      </span>
                      <span className="donut-center-sub">
                        {statusMetrics.find((s) => s.status === hoveredStatus)?.percentage.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="donut-center-label">Total Claims</span>
                      <span className="donut-center-value">{totalClaimsCount}</span>
                      <span className="donut-center-sub">100%</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status Breakdown Legend & Details */}
              <div className="donut-legend">
                <table className="legend-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Count</th>
                      <th style={{ textAlign: 'right' }}>Share</th>
                      <th style={{ textAlign: 'right' }}>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusMetrics.map((m) => (
                      <tr
                        key={m.status}
                        className={`legend-row ${hoveredStatus === m.status ? 'legend-row-hovered' : ''}`}
                        onMouseEnter={() => setHoveredStatus(m.status)}
                        onMouseLeave={() => setHoveredStatus(null)}
                      >
                        <td>
                          <div className="legend-label-cell">
                            <span className="legend-color-dot" style={{ backgroundColor: m.color }} />
                            <span className="font-semibold">{m.label}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>{m.count}</td>
                        <td style={{ textAlign: 'right' }}>{m.percentage.toFixed(1)}%</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(m.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CHART 2: Financial Volume by Status (Horizontal Bar Chart) */}
        {(activeTab === 'all' || activeTab === 'volume') && (
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">Financial Volume by Status</h3>
                <p className="chart-desc">Monetary allocation (€) currently in each claim stage</p>
              </div>
            </div>

            <div className="bar-chart-container">
              {statusMetrics.map((m) => {
                const percentOfMax = maxVolumeInStatus > 0 ? (m.totalAmount / maxVolumeInStatus) * 100 : 0;
                const percentOfTotal = totalVolume > 0 ? (m.totalAmount / totalVolume) * 100 : 0;
                return (
                  <div key={m.status} className="bar-row">
                    <div className="bar-label-group">
                      <span className="bar-label">{m.label}</span>
                      <span className="bar-amount font-semibold">{formatCurrency(m.totalAmount)}</span>
                    </div>

                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${Math.max(percentOfMax, m.totalAmount > 0 ? 3 : 0)}%`,
                          backgroundColor: m.color,
                        }}
                      >
                        {percentOfTotal >= 8 && (
                          <span className="bar-inner-text">{percentOfTotal.toFixed(0)}%</span>
                        )}
                      </div>
                    </div>
                    <span className="bar-subtext">
                      {m.count} {m.count === 1 ? 'claim' : 'claims'} ({percentOfTotal.toFixed(1)}% of total volume)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 3: Amount Brackets Histogram / Distribution */}
        {(activeTab === 'all' || activeTab === 'brackets') && (
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">Claim Severity Distribution (Amount Brackets)</h3>
                <p className="chart-desc">Categorization by claim value tiers</p>
              </div>
            </div>

            <div className="histogram-container">
              <div className="histogram-bars">
                {bracketMetrics.map((b, idx) => {
                  const heightPercent = maxCountInBrackets > 0 ? (b.count / maxCountInBrackets) * 100 : 0;
                  const barColors = ['#38bdf8', '#3b82f6', '#6366f1', '#8b5cf6'];
                  const color = barColors[idx % barColors.length];

                  return (
                    <div key={b.bracket} className="histogram-col">
                      <div className="histogram-col-count">{b.count}</div>
                      <div className="histogram-track">
                        <div
                          className="histogram-fill"
                          style={{
                            height: `${Math.max(heightPercent, b.count > 0 ? 8 : 2)}%`,
                            backgroundColor: color,
                          }}
                          title={`${b.bracket}: ${b.count} claims (${formatCurrency(b.totalAmount)})`}
                        />
                      </div>
                      <div className="histogram-label">{b.bracket}</div>
                      <div className="histogram-amount">{formatCurrency(b.totalAmount)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CHART 4: Monthly Registration Trend (if data is spread out) */}
        {activeTab === 'all' && monthlyMetrics.length > 0 && (
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-title">Submission Timeline Overview</h3>
                <p className="chart-desc">Volume and frequency over registered periods</p>
              </div>
            </div>

            <div className="timeline-grid">
              {monthlyMetrics.map((item) => (
                <div key={item.key} className="timeline-card">
                  <span className="timeline-period">{item.label}</span>
                  <span className="timeline-count">{item.count} {item.count === 1 ? 'claim' : 'claims'}</span>
                  <span className="timeline-amount font-semibold">{formatCurrency(item.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
