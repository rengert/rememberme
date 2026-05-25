# Remember Me

Eine Plattform, um Erinnerungen, Lebensgeschichten und persönliche Nachrichten für die Nachwelt festzuhalten – *Wie soll man sich an mich erinnern?*

## Konzept

Das Projekt beginnt mit einem vollständigen fachlichen und technischen Konzept, das als Grundlage für die spätere Umsetzung dient:

| Dokument | Beschreibung |
|---|---|
| [Fachliches Konzept](docs/01_fachliches_konzept.md) | Vision, Zielgruppe, Kernfunktionen, User Stories, Datenschutz & Monetarisierung |
| [Technisches Konzept](docs/02_technisches_konzept.md) | Architektur, Technologie-Stack, Datenmodell, Sicherheit, API-Design & Roadmap |

## Web-Prototyp

Ein erster Web-Prototyp wurde als React-Anwendung umgesetzt, um die grundlegenden Interaktionsmuster zu erproben.

### Features

- ✅ Einträge hinzufügen
- ✔️ Einträge als erledigt markieren
- 🗑️ Einzelne Einträge löschen
- 🧹 Alle erledigten Einträge auf einmal löschen
- 🔍 Filtern nach Alle / Aktiv / Erledigt
- 💾 Lokale Persistenz via `localStorage`

### Getting Started

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Tests ausführen
npm test
```

### Tech Stack

- [Vite](https://vite.dev) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com/) für Unit-Tests

