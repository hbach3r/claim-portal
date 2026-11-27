import React, { useState } from 'react';
import { CreateClaimRequest, Claim } from '../types/claim';
import { createClaim } from '../api/claimsApi';

interface ClaimFormProps {
  onClaimCreated: (newClaim: Claim) => void;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ onClaimCreated }) => {
  const [formData, setFormData] = useState<CreateClaimRequest>({
    policyNumber: '',
    claimantName: '',
    description: '',
    claimAmount: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'claimAmount' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.policyNumber.trim()) {
      setErrorMessage('Policy number is required.');
      return;
    }
    if (!formData.claimantName.trim()) {
      setErrorMessage('Claimant name is required.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }
    if (isNaN(formData.claimAmount) || formData.claimAmount <= 0) {
      setErrorMessage('Claim amount must be a positive number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createClaim({
        policyNumber: formData.policyNumber.trim(),
        claimantName: formData.claimantName.trim(),
        description: formData.description.trim(),
        claimAmount: formData.claimAmount,
      });

      setSuccessMessage(`Claim ${created.claimNumber} created successfully!`);
      setFormData({
        policyNumber: '',
        claimantName: '',
        description: '',
        claimAmount: 0,
      });

      onClaimCreated(created);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="claim-card">
      <h2>File New Claim</h2>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="claim-form">
        <div className="form-group">
          <label htmlFor="policyNumber">Policy Number *</label>
          <input
            id="policyNumber"
            name="policyNumber"
            type="text"
            placeholder="e.g. POL-123456"
            value={formData.policyNumber}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="claimantName">Claimant Name *</label>
          <input
            id="claimantName"
            name="claimantName"
            type="text"
            placeholder="e.g. Maria Musterfrau"
            value={formData.claimantName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="claimAmount">Claim Amount (€) *</label>
          <input
            id="claimAmount"
            name="claimAmount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.claimAmount === 0 ? '' : formData.claimAmount}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Damage Description *</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Detailed description of incident and damage..."
            value={formData.description}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Claim'}
        </button>
      </form>
    </div>
  );
};
