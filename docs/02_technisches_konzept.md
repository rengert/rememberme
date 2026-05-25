# Remember Me – Technisches Konzept

## 1. Überblick & Prinzipien

Das technische Konzept folgt diesen Leitprinzipien:

- **Smartphone-First**: Die primäre Nutzererfahrung wird auf mobilen Geräten (iOS & Android) optimiert.
- **Cross-Platform**: Ein gemeinsamer Codebase bedient alle Plattformen (iOS, Android, Web).
- **Offline-First**: Inhalte können ohne Internetverbindung erstellt und lokal zwischengespeichert werden.
- **Privacy by Design**: Verschlüsselung und minimale Datenerfassung sind keine nachträglichen Features, sondern Grundlage der Architektur.
- **Skalierbarkeit**: Die Architektur muss von wenigen Nutzern bis zu Millionen skalieren.

---

## 2. Plattformstrategie

### 2.1 Primäre Plattform – Smartphone (iOS & Android)

Das Smartphone wird priorisiert, da Nutzer es stets bei sich tragen und damit spontan Erinnerungen festhalten können (Foto, Sprachnotiz, Kurzvideo direkt aus der App). Die native Gerätekamera, das Mikrofon und die Galerie werden tief integriert.

### 2.2 Sekundäre Plattform – Web

Eine vollwertige Webanwendung dient als Desktop-Ergänzung für längere Texteingaben, die Verwaltung von Inhalten und den Zugriff durch Vertrauenspersonen.

### 2.3 Plattformübergreifende Synchronisation

Alle Inhalte werden über einen zentralen Backend-Service synchronisiert. Offline erstellte Inhalte werden beim nächsten Verbindungsaufbau automatisch hochgeladen (Conflict Resolution: Last-Write-Wins mit Versionierung).

---

## 3. Technologie-Stack

### 3.1 Frontend / Mobile & Web

#### Technologieentscheidung: Flutter vs. React Native

Beide Frameworks kommen für dieses Projekt grundsätzlich in Frage. Die folgende Tabelle bewertet sie anhand der projektrelevanten Kriterien:

| Kriterium | Flutter | React Native |
|---|---|---|
| **Sprache** | Dart | JavaScript / TypeScript |
| **iOS & Android** | ✅ Vollständig | ✅ Vollständig |
| **Web-Support** | ✅ Stabil (Flutter Web) | ⚠️ Möglich, aber React (Next.js) für Web empfohlen |
| **Desktop** | ✅ macOS, Windows, Linux | ⚠️ Experimentell / begrenzt |
| **Einheitliche Codebasis (Mobile + Web)** | ✅ Ein Codebase, eine Sprache | ⚠️ Oft separate Web-App (React) notwendig |
| **UI-Rendering** | Eigene Render-Engine (Skia/Impeller) – pixel-identical auf allen Plattformen | Nutzt native UI-Komponenten – plattformtypischer Look |
| **Performance** | Sehr hoch (AOT-kompiliert) | Hoch, leicht schlechter bei komplexen Animationen durch JS-Bridge |
| **Kamera & Medienzugriff** | Gut (flutter_camera, image_picker) | Sehr gut (react-native-vision-camera, sehr große Community) |
| **Offline / lokale DB** | Drift/SQLite, gut unterstützt | WatermelonDB / SQLite, sehr gut unterstützt |
| **Ökosystem & Community** | Wachsend, Google-backed | Sehr groß, Meta-backed, viele etablierte Libs |
| **Teamkenntnisse** | Dart-Kenntnisse nötig | TypeScript/JS – oft im Team bereits vorhanden |
| **Reifegrad** | Stabil, v3.x | Sehr reif (seit 2015), große Produktionsnutzung |

**Empfehlung:**

- **Flutter** wird empfohlen, wenn Mobile + Web aus einem einzigen Codebase bedient werden sollen und kein separates Web-Framework gewünscht ist. Besonders vorteilhaft, wenn Dart neu erlernt werden kann oder kein bestehendes JS/TS-Team vorhanden ist.
- **React Native** ist die bessere Wahl, wenn das Entwicklungsteam bereits JavaScript/TypeScript-Expertise mitbringt (z. B. durch ein bestehendes Nest.js-Backend-Team), da die Sprachkonsistenz die Onboarding-Zeit deutlich verkürzt. Für die Web-App würde in diesem Fall **Next.js** (React) parallel eingesetzt.

> **Projektentscheidung**: Im weiteren Konzept wird **Flutter** als Ziel-Framework für die vollständige Cross-Platform-Lösung (Mobile + Web) aus einem einzigen Codebase beschrieben. Als erster Schritt wurde ein **Web-Prototyp mit Vite + React + TypeScript** umgesetzt, um die grundlegenden Interaktionsmuster und die Benutzeroberfläche schnell zu erproben. Die Produktivimplementierung erfolgt auf Basis von Flutter. Sollte das Team überwiegend TypeScript-Erfahrung haben, ist **React Native + Next.js** eine gleichwertige Alternative, ohne konzeptionelle Änderungen am Backend oder Datenmodell.

#### Gewählter Stack

| Ebene | Technologie | Begründung |
|---|---|---|
| Mobile & Web | **Flutter** | Nativer Code für iOS, Android und Web aus einer Codebase; starke Community, Google-Unterstützung |
| Zustandsverwaltung | **Riverpod** | Reaktives, testbares State-Management für Flutter |
| Lokale Datenbank | **Drift (SQLite)** | Typsichere, lokale Datenbank für Offline-First |
| Lokale Medienspeicherung | Dateisystem + Gerätegalerie | Direkte Integration über Flutter-Plugins |
| Authentifizierung | **Firebase Auth** (oder Auth0) | Bewährte, sichere Authentifizierung; Social Login + E-Mail/Passwort |

#### React Native: Code-Sharing zwischen App und Web

React Native ist primär für iOS und Android konzipiert. Für die Web-Plattform empfiehlt sich **Next.js** (React) als separater Frontend-Zweig. Das bedeutet jedoch **nicht**, dass zwei vollständig getrennte Codebasen entstehen. Mit einem **Monorepo-Ansatz** (z. B. Turborepo oder Nx) lässt sich der Code sauber in Schichten aufteilen:

```
monorepo/
├── apps/
│   ├── mobile/        # React Native (Expo) – iOS & Android
│   └── web/           # Next.js – Browser/Desktop
├── packages/
│   ├── models/        # TypeScript-Interfaces & DTOs (100 % geteilt)
│   ├── utils/         # Hilfsfunktionen, Validierungen, Formatter (100 % geteilt)
│   ├── api-client/    # HTTP-Client, API-Calls, Auth-Logik (100 % geteilt)
│   ├── store/         # Zustand/TanStack Query State-Management (100 % geteilt)
│   └── ui/            # Gemeinsame UI-Komponenten (optional, via React Native Web)
└── backend/           # Nest.js API
```

**Was ist 100 % plattformübergreifend teilbar?**

| Schicht | Teilbar | Beispiele |
|---|---|---|
| **Datenmodelle / Interfaces** | ✅ Vollständig | `User`, `MemoryBook`, `Chapter`, `Message` als TypeScript-Interfaces |
| **Utility-Funktionen** | ✅ Vollständig | Datumsformatierung, Validierung, Verschlüsselungshelfer |
| **API-Client** | ✅ Vollständig | `axios`/`fetch`-basierte API-Calls, Auth-Token-Handling |
| **State Management** | ✅ Vollständig | TanStack Query Hooks, Zustand Stores |
| **Business-Logik** | ✅ Vollständig | Berechtigungsprüfungen, Trigger-Logik für Nachrichten |
| **UI-Komponenten** | ⚠️ Teilweise | Mit [React Native Web](https://necolas.github.io/react-native-web/) können `View`, `Text`, `Pressable` etc. auch im Browser gerendert werden |
| **Plattform-APIs** | ❌ Plattformspezifisch | Kamera, Dateisystem, Push-Notifications → abstrakte Interfaces + plattformspezifische Implementierungen |

**Fazit**: Bei React Native + Next.js entsteht **keine vollständig duplizierte Codebasis**. Die gesamte Geschäftslogik, alle Datenmodelle und Utilities werden einmal in gemeinsamen Packages geschrieben und von beiden Apps importiert. Plattformspezifischer Code beschränkt sich auf UI-Rendering-Details und native Geräte-APIs (Kamera, Haptik, Datei-Picker).

Im Vergleich zu Flutter (wo eine einzige Dart-Codebasis alle Plattformen bedient) ist der React Native + Next.js-Ansatz etwas fragmentierter auf UI-Ebene, bietet aber den Vorteil, dass Web-spezifische Optimierungen (SEO, SSR via Next.js) ohne Kompromisse möglich sind.

#### Alternative Stack (React Native + Next.js)

| Ebene | Technologie |
|---|---|
| Mobile | **React Native** (Expo) |
| Web | **Next.js** (React) |
| Zustandsverwaltung | Zustand / TanStack Query |
| Lokale Datenbank | WatermelonDB (SQLite) |
| Authentifizierung | Firebase Auth / Auth0 |
| Monorepo | Turborepo / Nx |
| Geteilte Packages | TypeScript Interfaces, API-Client, Utils, State |

### 3.2 Backend

| Ebene | Technologie | Begründung |
|---|---|---|
| API | **Nest.js** (Node.js / TypeScript) | Strukturiertes Framework, gute Testbarkeit, TypeScript-Typsicherheit |
| Datenbank (relational) | **PostgreSQL** | Robustes RDBMS, JSON-Support für flexible Metadaten |
| Objektspeicher | **AWS S3** / **Backblaze B2** | Kosteneffiziente, skalierbare Medienspeicherung |
| Echtzeit / Push | **Firebase Cloud Messaging (FCM)** | Plattformübergreifende Push-Benachrichtigungen |
| Job-Queue | **BullMQ** (Redis) | Zeitgesteuerte Aufgaben (Nachrichten-Zustellung, Jahrestagserinnerungen) |
| CDN | **Cloudflare** | Schnelle Medienauslieferung, DDoS-Schutz |

### 3.3 Infrastruktur & DevOps

| Bereich | Technologie |
|---|---|
| Containerisierung | Docker / Docker Compose |
| Orchestrierung | Kubernetes (oder AWS ECS für kleinere Deployments) |
| CI/CD | GitHub Actions |
| Monitoring | Grafana + Prometheus |
| Logging | Loki oder AWS CloudWatch |
| IaC | Terraform |

---

## 4. Systemarchitektur

```
┌─────────────────────────────────────────────┐
│                  Clients                     │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ Flutter App  │  │  Flutter Web App   │   │
│  │ (iOS/Android)│  │  (Browser)         │   │
│  └──────┬───────┘  └─────────┬──────────┘   │
└─────────┼──────────────────────┼─────────────┘
          │  HTTPS / REST + JWT  │
          ▼                      ▼
┌─────────────────────────────────────────────┐
│               API Gateway / CDN              │
│              (Cloudflare / nginx)            │
└──────────────────────┬──────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌───────────────────────┐
│   Nest.js API    │    │   Nest.js Worker       │
│   (REST/GraphQL) │    │   (Queue Processor)    │
└────────┬─────────┘    └───────────┬────────────┘
         │                          │
    ┌────┴────┐              ┌──────┴──────┐
    │PostgreSQL│             │ Redis/BullMQ│
    └─────────┘              └─────────────┘
         │
    ┌────┴────┐
    │  AWS S3 │  (Mediendateien: Fotos, Videos, Audio)
    └─────────┘
```

---

## 5. Datenmodell (konzeptuell)

### 5.1 Kernentitäten

```
User
├── id (UUID)
├── email
├── display_name
├── avatar_url
├── created_at
└── subscription_tier (free | premium)

MemoryBook (Lebensbuch des Nutzers)
├── id (UUID)
├── user_id → User
├── title
└── created_at

Chapter (Kapitel innerhalb eines Lebensbuches)
├── id (UUID)
├── book_id → MemoryBook
├── title
├── content (Markdown/Rich Text)
├── order_index
└── created_at

MediaAsset (Medienobjekt)
├── id (UUID)
├── user_id → User
├── type (photo | video | audio | document)
├── storage_key (S3-Pfad)
├── metadata (JSON: Ort, Datum, beschriftete Personen)
└── created_at

Message (Hinterlassene Nachricht)
├── id (UUID)
├── sender_id → User
├── recipient_email
├── subject
├── body (verschlüsselt)
├── media_assets[]
├── delivery_trigger (date | on_death | condition)
├── delivery_condition (JSON)
├── delivered_at
└── created_at

TrustedPerson (Vertrauensperson)
├── id (UUID)
├── user_id → User
├── name
├── email
├── access_level (read | download | manage)
└── verified_at

MemorialPage (Gedenkseite)
├── id (UUID)
├── user_id → User
├── is_public
├── condolence_entries[]
└── published_at
```

### 5.2 Beziehungsdiagramm (vereinfacht)

```
User 1──* MemoryBook 1──* Chapter
User 1──* MediaAsset
User 1──* Message
User 1──* TrustedPerson
User 1──1 MemorialPage
```

---

## 6. Sicherheitskonzept

### 6.1 Authentifizierung & Autorisierung
- Authentifizierung via JWT (Access Token: 15 min, Refresh Token: 30 Tage)
- Multi-Faktor-Authentifizierung (TOTP/Authenticator-App) als optionale, für Vertrauenspersonen-Aktivierung verpflichtende Funktion
- Rollenbasierte Zugriffskontrolle (RBAC): Nutzer, Vertrauensperson, Admin

### 6.2 Datenverschlüsselung
- **Transport**: TLS 1.3 für alle API-Kommunikation
- **Ruhezustand**: AES-256-Verschlüsselung für Mediendateien in S3
- **Ende-zu-Ende**: Sensible Nachrichten (Briefe, Vermächtnisse) werden client-seitig verschlüsselt (z. B. mit libsodium); der Server speichert nur verschlüsselte Ciphertext
- Schlüsselverwaltung: Nutzerpasswort-abgeleiteter Schlüssel (PBKDF2 / Argon2), Wiederherstellungsschlüssel als Backup

### 6.3 Post-Mortem-Sicherheit
- Aktivierung der Post-Mortem-Funktionen erfordert:
  1. Antrag durch mindestens eine benannte Vertrauensperson
  2. Hochladen einer verifizierten Sterbeurkunde (manuelle Prüfung oder vertrauenswürdiger Drittdienst)
  3. Wartezeit (z. B. 14 Tage) zur Missbrauchsverhinderung
- Nutzer kann einen „Dead Man's Switch" aktivieren: Regelmäßiger Check-in; bleibt dieser aus, werden Vertrauenspersonen benachrichtigt

### 6.4 Datenschutz (DSGVO/GDPR)
- Vollständige Datenportabilität (Export als ZIP: JSON + Originaldateien)
- Recht auf Vergessenwerden: Vollständige Datenlöschung auf Anfrage (inkl. S3, Backups nach Aufbewahrungsfrist)
- Datenverarbeitung ausschließlich in EU-Rechenzentren (oder zertifizierte Drittländer)
- Privacy Policy, Cookie Consent und Verarbeitungsverzeichnis nach DSGVO Art. 30

---

## 7. Offline-First & Synchronisation

1. **Lokale Datenbank** (Drift/SQLite) speichert alle Nutzerdaten lokal auf dem Gerät
2. **Sync-Engine**: Beim Start (oder auf Abruf) werden lokale Änderungen mit dem Backend abgeglichen
3. **Konfliktauflösung**: Letzte Änderung gewinnt (Last-Write-Wins) mit Zeitstempel-basierter Versionierung; bei Konflikten wird der Nutzer informiert
4. **Medien**: Große Dateien werden asynchron hochgeladen; lokal ist ein Vorschau-Thumbnail verfügbar, bevor der Upload abgeschlossen ist

---

## 8. Push-Benachrichtigungen & Aufgabenplanung

| Ereignis | Mechanismus |
|---|---|
| Jahrestagserinnerung | BullMQ Cron-Job, täglich prüfen; FCM-Push |
| Zeitgesteuerte Nachricht | BullMQ Delayed Job mit Zielzeitpunkt |
| Post-Mortem-Aktivierung | BullMQ Job nach erfolgreicher Verifikation |
| Dead Man's Switch | BullMQ Repeatable Job, Inaktivität prüfen |

---

## 9. API-Design

Die API folgt RESTful-Prinzipien mit optionalem GraphQL-Endpoint für komplexe Abfragen.

### 9.1 REST-Endpunkte (Auswahl)

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh

GET    /users/me
PATCH  /users/me

GET    /books
POST   /books
GET    /books/:id
PATCH  /books/:id
DELETE /books/:id

GET    /books/:id/chapters
POST   /books/:id/chapters
PATCH  /books/:id/chapters/:chapterId

POST   /media/upload        (Multipart, gibt Pre-Signed S3 URL zurück)
GET    /media/:id

GET    /messages
POST   /messages
DELETE /messages/:id

GET    /trusted-persons
POST   /trusted-persons
DELETE /trusted-persons/:id

POST   /memorial/:userId/activate   (Post-Mortem-Aktivierung)
GET    /memorial/:userId
```

### 9.2 Versionierung

APIs werden unter `/v1/` versioniert. Breaking Changes erfordern eine neue Major-Version.

---

## 10. Projektphasen & Roadmap

| Phase | Inhalt | Zeitrahmen (geschätzt) |
|---|---|---|
| **Phase 1 – MVP** | Nutzerprofil, Lebensbuch (Text + Fotos), einfache Galerieverwaltung, Web + Mobile App | 3–4 Monate |
| **Phase 2 – Nachrichten** | Zeitgesteuerte Briefe und Videonachrichten, Vertrauenspersonen-Verwaltung | 2–3 Monate |
| **Phase 3 – Post-Mortem** | Gedenkseite, Jahrestagserinnerungen, Dead Man's Switch, Post-Mortem-Verifikation | 2–3 Monate |
| **Phase 4 – KI & Extras** | KI-gestützte Zusammenfassungen, Chatbot-Interaktion, Enterprise-Features | laufend |

---

## 11. Qualitätssicherung

- **Unit Tests**: >80 % Code-Coverage für Business-Logik (Backend: Jest; Flutter: flutter_test / React Native: Jest + React Native Testing Library)
- **Integrationstests**: API-Integrationstests mit SuperTest
- **E2E-Tests**: Kritische Flows (Registrierung, Inhalt erstellen, Nachricht senden) mit Playwright (Web) und Patrol (Flutter) bzw. Maestro (React Native)
- **Performance**: API-Antwortzeiten <200 ms (p95) unter Last; Medien-Upload mit Progress-Feedback
- **Accessibility**: Automatisiertes Testen mit axe-core; manuelle Tests mit VoiceOver / TalkBack
