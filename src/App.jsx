import { useEffect } from "react";
import "./styles/main.css";
import { initRacketLab } from "./lib/racketlab.js";

function App() {
  useEffect(() => {
    initRacketLab();
  }, []);

  return (
    <div data-racketlab-root className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <span className="brand-icon" role="img" aria-label="Tischtennis">
              🏓
            </span>
            <h1>RacketLab</h1>
          </div>
          <nav className="main-nav">
            <a href="#material-finder">Materialfinder</a>
            <a href="#material-explorer">Material-Explorer</a>
            <a href="#training-planner">KI-Trainingsplan</a>
            <a href="#video-analysis">Technikanalyse</a>
            <a href="#dashboard">Mein Bereich</a>
          </nav>
        </div>
      </header>

      <main className="layout">
        <section className="hero">
          <div className="hero-text">
            <h2>Dein ganzheitlicher Tischtennis-Coach</h2>
            <p>
              Finde das perfekte Material, erhalte smarte Trainingspläne und bekomme
              KI-gestütztes Feedback zu deiner Technik – alles in einer
              interaktiven Plattform.
            </p>
            <button className="primary" data-scroll-target="#material-finder">
              Jetzt starten
            </button>
          </div>
          <div className="hero-visual">
            <div className="card-stack">
              <div className="card">Individuelle Schlägerkombinationen</div>
              <div className="card">Adaptive Trainingspläne</div>
              <div className="card">Videoanalyse mit Profi-Tipps</div>
            </div>
          </div>
        </section>

        <section id="material-finder" className="panel">
          <div className="panel-header">
            <h3>Materialfinder &amp; Vergleich</h3>
            <p>
              Beantworte ein paar Fragen und erhalte sofort passende
              Schlägerkombinationen inklusive Wertevergleich und Erfahrungsberichten.
            </p>
          </div>
          <div className="panel-grid">
            <form className="card form" id="finder-form">
              <div className="form-group">
                <label htmlFor="playstyle">Spielstil</label>
                <select id="playstyle" name="playstyle" required defaultValue="allround">
                  <option value="allround">Allround</option>
                  <option value="offensive">Angriff</option>
                  <option value="defensive">Abwehr</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="experience">Erfahrungslevel</label>
                <select
                  id="experience"
                  name="experience"
                  required
                  defaultValue="beginner"
                >
                  <option value="beginner">Einsteiger*in</option>
                  <option value="intermediate">Fortgeschritten</option>
                  <option value="advanced">Leistung</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="budget">Budget</label>
                <select id="budget" name="budget" required defaultValue="under150">
                  <option value="under150">bis 150 €</option>
                  <option value="150-250">150 – 250 €</option>
                  <option value="over250">über 250 €</option>
                </select>
              </div>
              <button type="submit" className="primary">
                Empfehlung anzeigen
              </button>
            </form>

            <div className="card results" id="finder-results">
              <div className="results-header">
                <h4>Empfohlene Setups</h4>
                <div className="results-filters">
                  <label>
                    Sortieren nach
                    <select id="finder-sort" defaultValue="match">
                      <option value="match">Beste Übereinstimmung</option>
                      <option value="price">Preis</option>
                      <option value="tempo">Tempo</option>
                      <option value="control">Kontrolle</option>
                    </select>
                  </label>
                  <label className="toggle">
                    <input type="checkbox" id="finder-carbon-filter" />
                    <span>Nur Carbon/Fiberglas</span>
                  </label>
                </div>
              </div>
              <div className="results-content" id="finder-recommendations"></div>
            </div>
          </div>
        </section>

        <section id="material-explorer" className="panel">
          <div className="panel-header">
            <h3>Material-Explorer</h3>
            <p>
              Durchstöbere die umfangreiche Materialdatenbank und stelle dir dein
              persönliches Setup zusammen.
            </p>
          </div>
          <div className="panel-grid">
            <aside className="card form filters" id="explorer-filters"></aside>
            <div className="card explorer">
              <div className="explorer-toolbar">
                <div className="view-toggle" role="group" aria-label="Darstellung">
                  <button className="active" data-view="cards" type="button">
                    Karten
                  </button>
                  <button data-view="table" type="button">Tabelle</button>
                </div>
                <button className="secondary" id="save-set" type="button">
                  Set speichern
                </button>
              </div>
              <div className="explorer-content" id="explorer-content"></div>
            </div>

            <div className="card dashboard" id="dashboard">
              <h4>Gespeicherte Sets &amp; Favoriten</h4>
              <div className="dashboard-section">
                <h5>Aktuelles Set</h5>
                <div id="current-set"></div>
              </div>
              <div className="dashboard-section">
                <h5>Vergleich</h5>
                <div id="comparison"></div>
              </div>
              <div className="dashboard-section">
                <h5>Favoriten</h5>
                <div id="favorites"></div>
              </div>
            </div>
          </div>
        </section>

        <section id="training-planner" className="panel">
          <div className="panel-header">
            <h3>KI-basierter Trainingsplan</h3>
            <p>
              Ein adaptiver Plan, der deine Ziele, verfügbare Zeit und dein Level
              berücksichtigt.
            </p>
          </div>
          <div className="panel-grid">
            <form className="card form" id="training-form">
              <div className="form-group">
                <label htmlFor="skill-level">Spielstärke</label>
                <select id="skill-level" name="skill-level" defaultValue="beginner">
                  <option value="beginner">Einsteiger*in</option>
                  <option value="intermediate">Vereinsspieler*in</option>
                  <option value="advanced">Leistungsklasse</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ziele</label>
                <div className="chip-group" id="goal-group"></div>
              </div>
              <div className="form-group">
                <label htmlFor="time-availability">Trainingszeit pro Woche</label>
                <input
                  type="range"
                  id="time-availability"
                  name="time-availability"
                  min="2"
                  max="12"
                  step="1"
                  defaultValue="6"
                />
                <span id="time-value">6 Stunden</span>
              </div>
              <button type="submit" className="primary">
                Plan generieren
              </button>
            </form>

            <div className="card training-plan" id="training-plan"></div>
          </div>
        </section>

        <section id="video-analysis" className="panel">
          <div className="panel-header">
            <h3>Technikanalyse mit Video-Feedback</h3>
            <p>
              Lade ein kurzes Video hoch und erhalte innerhalb weniger Sekunden
              analysierte Hinweise zu Schlagtechnik, Fußarbeit und Timing.
            </p>
          </div>
          <div className="panel-grid">
            <form className="card form" id="analysis-form">
              <div className="form-group">
                <label htmlFor="video-upload">Video hochladen</label>
                <input type="file" id="video-upload" name="video-upload" accept="video/*" />
              </div>
              <div className="form-group">
                <label htmlFor="focus-area">Fokus</label>
                <select id="focus-area" name="focus-area" defaultValue="topspin">
                  <option value="topspin">Topspin-Technik</option>
                  <option value="footwork">Fußarbeit</option>
                  <option value="serve">Aufschlag</option>
                  <option value="return">Rückschlag</option>
                </select>
              </div>
              <button type="submit" className="primary">
                Analyse simulieren
              </button>
            </form>

            <div className="card analysis-results" id="analysis-results"></div>
          </div>
        </section>

        <section className="panel" id="insights">
          <div className="panel-header">
            <h3>Insights &amp; Profi-Tipps</h3>
            <p>
              Erhalte automatisch passende Trainingsvideos, Technikschwerpunkte und
              Übungsempfehlungen.
            </p>
          </div>
          <div className="panel-grid">
            <div className="card" id="pro-videos"></div>
            <div className="card" id="analysis-insights"></div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div>
            <h4>RacketLab</h4>
            <p>Dein digitaler Assistent für Tischtennis-Material, Training und Technik.</p>
          </div>
          <div>
            <h5>Kontakt</h5>
            <p>hello@racketlab.app</p>
          </div>
          <div>
            <h5>Folge uns</h5>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer">
                YouTube
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                TikTok
              </a>
            </div>
          </div>
        </div>
        <p className="footer-note">© {new Date().getFullYear()} RacketLab. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}

export default App;
