# Claim Portal

Ein modernes Schadensmeldungs- und Versicherungsanspruch-Portal (**Claim Portal**) basierend auf **Spring Boot 3** im Backend und **React 18** mit **TypeScript** und **Vite** im Frontend.

---

## 📁 Projektstruktur

```text
claim-portal/
├── AGENTS.md                         # Zentrale Architektur- & Workflow-Regeln für Coding-Agents
├── .agents/
│   └── skills/
│       ├── backend-endpoint/
│       │   └── SKILL.md              # Skill für neue REST-Endpunkte inkl. DTOs & JUnit-Tests
│       └── react-feature/
│           └── SKILL.md              # Skill für React-Komponenten, API-Hooks & Formulare
├── backend/                          # Spring Boot 3 (Java 21, Maven, H2, Validation)
│   ├── pom.xml
│   └── src/
│       ├── main/java/at/bacher/claims/
│       │   ├── ClaimPortalApplication.java
│       │   ├── model/Claim.java
│       │   ├── dto/CreateClaimRequest.java
│       │   ├── repository/ClaimRepository.java
│       │   └── controller/ClaimController.java
│       └── test/java/at/bacher/claims/
│           └── ClaimControllerTest.java
├── frontend/                         # React 18 + TypeScript + Vite
│   ├── package.json
│   └── src/
│       ├── types/claim.ts
│       ├── api/claimsApi.ts
│       ├── components/ClaimForm.tsx
│       ├── components/ClaimList.tsx
│       ├── components/ClaimCharts.tsx
│       └── App.tsx
└── README.md
```

---

## 🚀 Schnellstart

### Voraussetzungen
- **Java 21** JDK
- **Node.js** (v18+) & **npm**

### 1. Backend starten (Spring Boot)

Navigiere in das Verzeichnis `backend/` und starte die Spring Boot Anwendung:

```powershell
cd backend
mvn spring-boot:run
```

- **REST API:** `http://localhost:8080/api/claims`
- **H2 Web Console:** `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:claimdb`
  - Benutzer: `sa`
  - Passwort: *(leer)*

### 2. Frontend starten (React + Vite)

Navigiere in das Verzeichnis `frontend/`, installiere die Abhängigkeiten und starte den Dev-Server:

```powershell
cd frontend
npm install
npm run dev
```

- **Web-Oberfläche:** `http://localhost:3000` (Vite Proxy leitet `/api/*` Anfragen an `http://localhost:8080` weiter)

### 3. Features & Benutzeroberfläche
- 📋 **Claims Management:** Erfassen neuer Schadensmeldungen (`ClaimForm`), Übersicht aller Claims in tabellarischer Form (`ClaimList`) inkl. Löschfunktion und Filterung.
- 📊 **Analytics & Charts:** Dedizierte Analyseseite (`ClaimCharts`) mit visuellen Auswertungen:
  - **Status Distribution:** Interaktiver Donut-Chart mit Segment-Hover und Detail-Legende (SUBMITTED, IN_REVIEW, APPROVED, REJECTED, SETTLED).
  - **Financial Volume by Status:** Horizontaler Balken-Chart zur Veranschaulichung des finanziellen Volumens je Status.
  - **Claim Severity Distribution:** Histogramm nach Schadenshöhenklassen (`< €1.000`, `€1.000 - €5.000`, `€5.000 - €10.000`, `> €10.000`).
  - **Timeline Trend:** Übersicht über den zeitlichen Verlauf der gemeldeten Schäden.
  - **Executive KPIs:** Gesamtschadenssumme, durchschnittliche Schadenshöhe, Spitzenrisiko und Genehmigungsquote.

---

## 📡 REST-API Dokumentation

Die REST-Schnittstelle ist unter `/api/claims` verfügbar:

| Methode | Endpunkt | Beschreibung | Status-Codes |
|---|---|---|---|
| `GET` | `/api/claims` | Liste aller Claims abrufen (Filter `?status=...`) | `200 OK` |
| `GET` | `/api/claims/{id}` | Einzelnen Claim nach ID abrufen | `200 OK`, `404 Not Found` |
| `POST` | `/api/claims` | Neuen Claim erfassen (Payload validiert) | `201 Created`, `400 Bad Request` |
| `DELETE` | `/api/claims/{id}` | Claim nach ID löschen | `204 No Content`, `404 Not Found` |

### Beispiel Request Body (POST /api/claims)
```json
{
  "policyNumber": "POL-987654",
  "claimantName": "Max Mustermann",
  "description": "Wasserschaden in der Küche durch Rohrbruch.",
  "claimAmount": 1450.50
}
```

---

## 🧪 Tests

### Backend Tests ausführen
Die Controller-Endpunkte werden mit **JUnit 5**, **Spring Boot Test** und **MockMvc** validiert:

```powershell
cd backend
mvn test
```

### Frontend Type-Check & Build
```powershell
cd frontend
npm run build
```

---

## 🤖 Agent Skills & Richtlinien

Dieses Projekt enthält Richtlinien und Skills zur automatisierten Unterstützung von Coding-Agents:
- **`AGENTS.md`**: Architektur- und Workflow-Regeln für das Repository.
- **`.agents/skills/backend-endpoint/SKILL.md`**: Schritt-für-Schritt Anleitung zur Erstellung neuer REST-Endpunkte inkl. DTOs, Validierung und MockMvc-Tests.
- **`.agents/skills/react-feature/SKILL.md`**: Anleitung für neue React-Komponenten, State-Handling und typisierte API-Clients.
