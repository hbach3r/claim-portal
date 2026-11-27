---
name: react-feature
description: Skill für React-Komponenten, API-Hooks & Formulare im Frontend
---

# React Feature Skill

Dieser Skill leitet Entwickler und Coding-Agents an, wie neue Benutzeroberflächen-Features, Formulare und API-Anbindungen im `frontend/`-Modul nach Best Practices umgesetzt werden.

## Kontext & Technologien
- **Framework:** React 18
- **Programmiersprache:** TypeScript (Strict Mode)
- **Tooling:** Vite
- **Architektur:** Typisierte APIs (`src/api/`), Domain-Typen (`src/types/`), Modulare Komponenten (`src/components/`)

---

## Workflow: Neues Frontend-Feature implementieren

### Schritt 1: Typen definieren oder erweitern (`src/types/claim.ts`)
- Definiere TypeScript Interfaces für alle Datenmodelle, Request-Payloads und Enums/Union-Types.
- Vermeide die Verwendung von `any`.
- Beispiel:
  ```typescript
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
  ```

### Schritt 2: API Client erweitern (`src/api/claimsApi.ts`)
- Erstelle typisierte, asynchrone Funktionen zur Kommunikation mit dem Spring Boot Backend.
- Behandle HTTP-Fehlerstatus sauber und werfe aussagekräftige Fehlermeldungen.
- Beispiel:
  ```typescript
  const API_BASE_URL = '/api/claims';

  export async function createClaim(data: CreateClaimRequest): Promise<Claim> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to create claim (Status: ${response.status})`);
    }

    return response.json();
  }
  ```

### Schritt 3: Komponenten & Formulare erstellen (`src/components/`)
- Teile Komponenten nach Zuständigkeiten auf:
  - Eingabeformulare (z. B. `ClaimForm.tsx`): Eigenständiger Eingabe-State, Validierung vor dem Absenden, Ladezustand (`isSubmitting`), Fehleranzeige.
  - Listen & Tabellen (z. B. `ClaimList.tsx`): Anzeige von Datensätzen, Filterung, Status-Badges, Aktionen (z. B. Löschen).
- Nutze React Hooks (`useState`, `useEffect`, `useCallback`) idiomatisch.
- Klare Trennung von Event-Handling und Darstellung.

### Schritt 4: Integration in `App.tsx`
- Binde die neuen Komponenten in die Hauptansicht ein.
- Stelle sicher, dass nach erfolgreicher Aktion (z. B. Erstellen eines Claims) die Listenansicht automatisch aktualisiert wird (z. B. über Callback-Props wie `onClaimCreated`).

---

## Best Practices & Checkliste
- [ ] Alle Datentypen in `src/types/` definiert (kein `any`).
- [ ] API-Aufrufe zentralisiert in `src/api/`.
- [ ] Ladezustände (`loading`, `submitting`) und Fehlermeldungen dem Benutzer visualisiert.
- [ ] Formulare validieren Pflichtfelder und Zahlenformate vor dem Absenden.
- [ ] Barrierefreie und semantische HTML-Elemente (`<form>`, `<label>`, `<button>`, etc.).
