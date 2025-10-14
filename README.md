# RacketLab (Loveable.dev Edition)

Interaktive Loveable.dev Webanwendung für Tischtennisspieler*innen auf Basis einer React Single Page App.

## Features

- **Materialfinder & Vergleich** – Fragebogen mit dynamischen Empfehlungen, Detailkarten, Nutzerfeedback und Vergleichsfunktion.
- **Material-Explorer** – Filterbare Materialdatenbank mit Karten- und Tabellenansicht, Favoriten, Vergleich und Set-Verwaltung mit localStorage-Persistenz.
- **KI-Trainingsplan-Generator** – Personalisiert Übungen aus einer Trainingsbibliothek, zeigt Fortschritt und lässt Übungen abhaken.
- **Technikanalyse** – Simuliertes KI-Feedback auf Basis eines Video-Uploads mit Stärken/Schwächen, passenden Profi-Videos und direkten Übungs-Empfehlungen.

## Projektstruktur

```
.
├── index.html
├── loveable.config.json
├── package.json
├── src
│   ├── App.jsx
│   ├── data
│   │   └── index.js
│   ├── lib
│   │   └── racketlab.js
│   ├── main.jsx
│   └── styles
│       └── main.css
└── vite.config.js
```

## Entwicklung & Nutzung

Das Projekt nutzt den Loveable.dev Stack mit Vite + React. Für die lokale Entwicklung:

```bash
npm install
npm run dev
```

Anschließend ist die Anwendung unter `http://localhost:5173` verfügbar.

Für einen Produktionsbuild:

```bash
npm run build
```

### Loveable.dev Integration

Die Datei `loveable.config.json` beschreibt das Projekt für die Verwendung in Loveable.dev Workspaces. Der Einstiegspunkt der GUI befindet sich in `src/main.jsx`, die Oberfläche im React-Komponentenbaum `src/App.jsx`.

## Speicherung

Favoriten, Vergleiche und Trainingsfortschritt werden im Browser via `localStorage` (Schlüssel `racketlab-state-v1`) gespeichert.
