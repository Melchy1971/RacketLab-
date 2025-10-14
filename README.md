# RacketLab

Interaktive, vollständig clientseitige Webanwendung für Tischtennisspieler*innen.

## Features

- **Materialfinder & Vergleich** – Fragebogen mit dynamischen Empfehlungen, Detailkarten, Nutzerfeedback und Vergleichsfunktion.
- **Material-Explorer** – Filterbare Materialdatenbank mit Karten- und Tabellenansicht, Favoriten, Vergleich und Set-Verwaltung mit localStorage-Persistenz.
- **KI-Trainingsplan-Generator** – Personalisiert Übungen aus einer Trainingsbibliothek, zeigt Fortschritt und lässt Übungen abhaken.
- **Technikanalyse** – Simuliertes KI-Feedback auf Basis eines Video-Uploads mit Stärken/Schwächen, passenden Profi-Videos und direkten Übungs-Empfehlungen.

## Entwicklung & Nutzung

Da es sich um eine reine Frontend-App handelt, genügt es, die `index.html` in einem aktuellen Browser zu öffnen. Für lokale Entwicklung kann ein einfacher HTTP-Server genutzt werden, z. B.:

```bash
python -m http.server 3000
```

und anschließend `http://localhost:3000` im Browser aufrufen.

## Struktur

```
.
├── index.html
├── scripts
│   ├── app.js
│   └── data.js
├── styles
│   └── main.css
└── README.md
```

## Speicherung

Favoriten, Vergleiche und Trainingsfortschritt werden im Browser via `localStorage` (Schlüssel `racketlab-state-v1`) gespeichert.
