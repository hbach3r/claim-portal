# Claim Portal - Agent Guidelines & Architecture Rules

Dieses Dokument definiert die zentralen Architektur- und Workflow-Regeln für Coding-Agents (z. B. Junie, GitHub Copilot, Claude) im Repository **claim-portal**.

---

## 1. Projektübersicht & Architektur

Das **Claim Portal** ist eine Webanwendung zur Erfassung und Verwaltung von Versicherungsansprüchen (Claims). Das System ist modular in ein Backend und ein Frontend aufgeteilt:

```
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

### 1.1 Backend Architektur (Spring Boot 3 + Java 21)
- **Framework:** Spring Boot 3.x mit Java 21
- **Datenbank & Persistenz:** Spring Data JPA mit In-Memory H2 Database
- **Architektur-Pattern:** Layered Architecture
  - `controller`: REST-Endpunkte mit DTOs, HTTP Status Codes und Bean Validation (`@Valid`).
  - `dto`: Request- & Response-Objekte (bevorzugt Java 21 Records mit Jakarta Validation).
  - `repository`: Spring Data JPA Repositories für Datenzugriff.
  - `model`: JPA Entitäten mit Tabellen-Mapping und Validierung.
- **Validierung:** `jakarta.validation.constraints.*` (`@NotBlank`, `@NotNull`, `@Positive`, etc.).
- **Tests:** JUnit 5, Spring Boot Test, MockMvc.

### 1.2 Frontend Architektur (React 18 + TypeScript + Vite)
- **Framework:** React 18 mit TypeScript (Strict Mode) und Vite als Build-Tool.
- **Architektur-Pattern:**
  - `types/`: Zentrale Typdefinitionen und Interfaces für Domain-Objekte und DTOs.
  - `api/`: Reusable Typed API Client Functions (Fetch API / Async-Await).
  - `components/`: UI-Komponenten mit klarer Trennung von State, UI und Interaktion.
  - `App.tsx`: Hauptanwendung & Layout.

---

## 2. Coding-Agent Workflow-Regeln

### 2.1 Skill-Nutzung
Bevor neue Features oder Endpunkte entwickelt werden, MÜSSEN die relevanten Skills aus `.agents/skills/` konsultiert und angewendet werden:
- **Neuer REST-Endpunkt / Backend-Änderung:** Nutze `.agents/skills/backend-endpoint/SKILL.md`
- **Neues React-Feature / Frontend-Komponente:** Nutze `.agents/skills/react-feature/SKILL.md`

### 2.2 Backend Richtlinien
1. **Keine unvalidierten Payloads:** Alle `@RequestBody` Parameter müssen mit `@Valid` deklariert sein.
2. **DTOs verwenden:** Entitäten dürfen nicht direkt als Request-Payloads in Controllern entgegengenommen werden. Verwende DTOs (Records in `dto/`).
3. **HTTP Status Codes:**
   - `200 OK`: Erfolgreicher Abruf / Modifikation
   - `201 Created`: Erfolgreiche Erstellung (inklusive Response-Body oder Location-Header)
   - `204 No Content`: Erfolgreiches Löschen
   - `400 Bad Request`: Validierungsfehler
   - `404 Not Found`: Ressource existiert nicht
4. **Test-First / Test-Driven:** Zu jedem neuen Controller-Endpunkt muss mindestens ein Unit-/Integrationstest in `ClaimControllerTest.java` vorhanden sein, der sowohl Erfolgs- als auch Validierungsfehlerfälle abdeckt.

### 2.3 Frontend Richtlinien
1. **Strikte Typisierung:** Niemals `any` verwenden. Alle Datenstrukturen müssen in `src/types/` definiert sein.
2. **Sauberes Error-Handling:** API-Aufrufe müssen Fehler abfangen und benutzerfreundliche Fehlermeldungen in der UI anzeigen.
3. **Komponenten-Struktur:** Komponenten modular und fokussiert halten (Single Responsibility).
4. **State Management:** Lokaler Komponenten-State (`useState`) für isolierte Formulare; Props/Callbacks zur Kommunikation zwischen Komponenten.

---

## 3. Definition of Done für Agents
Eine Aufgabe gilt erst als abgeschlossen, wenn:
1. Die geforderte Datei- und Verzeichnisstruktur exakt eingehalten wurde.
2. Alle Typen (Java & TypeScript) konsistent sind.
3. Tests implementiert und erfolgreich sind.
4. Dokumentation (README, KDoc/JSDoc wo angebracht) aktuell ist.
