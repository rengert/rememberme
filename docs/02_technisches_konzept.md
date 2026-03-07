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

| Ebene | Technologie | Begründung |
|---|---|---|
| Mobile & Web | **Flutter** | Echter nativer Code für iOS, Android und Web aus einer Codebasis; starke Community, Google-Unterstützung |
| Zustandsverwaltung | **Riverpod** | Reaktives, testbares State-Management für Flutter |
| Lokale Datenbank | **Drift (SQLite)** | Typsichere, lokale Datenbank für Offline-First |
| Lokale Medienspeicherung | Dateisystem + Gerätegalerie | Direkte Integration über Flutter-Plugins |
| Authentifizierung | **Firebase Auth** (oder Auth0) | Bewährte, sichere Authentifizierung; Social Login + E-Mail/Passwort |

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

- **Unit Tests**: >80 % Code-Coverage für Business-Logik (Backend: Jest; Flutter: flutter_test)
- **Integrationstests**: API-Integrationstests mit SuperTest
- **E2E-Tests**: Kritische Flows (Registrierung, Inhalt erstellen, Nachricht senden) mit Playwright (Web) und Patrol (Flutter)
- **Performance**: API-Antwortzeiten <200 ms (p95) unter Last; Medien-Upload mit Progress-Feedback
- **Accessibility**: Automatisiertes Testen mit axe-core; manuelle Tests mit VoiceOver / TalkBack
