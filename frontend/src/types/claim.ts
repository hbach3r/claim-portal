export type ClaimStatus = 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'SETTLED';

export interface Claim {
  id: number;
  claimNumber: string;
  policyNumber: string;
  claimantName: string;
  description: string;
  claimAmount: number;
  status: ClaimStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClaimRequest {
  policyNumber: string;
  claimantName: string;
  description: string;
  claimAmount: number;
}

export type PageView = 'claims' | 'charts';

export interface StatusMetric {
  status: ClaimStatus;
  label: string;
  count: number;
  totalAmount: number;
  percentage: number;
  color: string;
}

export interface AmountBracketMetric {
  bracket: string;
  min: number;
  max: number | null;
  count: number;
  totalAmount: number;
  percentage: number;
}
