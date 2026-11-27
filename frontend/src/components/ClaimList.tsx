import React from 'react';
import { Claim, ClaimStatus } from '../types/claim';

interface ClaimListProps {
  claims: Claim[];
  isLoading: boolean;
  onDeleteClaim: (id: number) => void;
  onRefresh: () => void;
}

const getStatusBadgeClass = (status: ClaimStatus | string): string => {
  switch (status) {
    case 'APPROVED':
      return 'badge badge-approved';
    case 'REJECTED':
      return 'badge badge-rejected';
    case 'IN_REVIEW':
      return 'badge badge-review';
    case 'SETTLED':
      return 'badge badge-settled';
    case 'SUBMITTED':
    default:
      return 'badge badge-submitted';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleString('de-AT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return dateStr;
  }
};

export const ClaimList: React.FC<ClaimListProps> = ({
  claims,
  isLoading,
  onDeleteClaim,
  onRefresh,
}) => {
  return (
    <div className="claim-card">
      <div className="list-header">
        <h2>Existing Claims ({claims.length})</h2>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {isLoading && claims.length === 0 ? (
        <p className="loading-text">Loading claims...</p>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <p>No claims found. Use the form above to submit your first claim.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="claim-table">
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Policy #</th>
                <th>Claimant</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id}>
                  <td className="font-semibold">{claim.claimNumber}</td>
                  <td>{claim.policyNumber}</td>
                  <td>{claim.claimantName}</td>
                  <td className="desc-cell" title={claim.description}>
                    {claim.description}
                  </td>
                  <td className="amount-cell">{formatCurrency(claim.claimAmount)}</td>
                  <td>
                    <span className={getStatusBadgeClass(claim.status)}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(claim.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => onDeleteClaim(claim.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete claim"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
