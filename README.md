# 🌲 GreenHaven Eco-Retreat

GreenHaven Eco-Retreat is an interactive, responsive, single-page full-stack nature tourism platform. It combines a premium, animated frontend (featuring Light/Dark theme toggling, scroll reveals, and glowing background accent orbs) with a lightweight Python/SQLite backend. It features integrated client-side and server-side AI/ML simulators, including an NLP sentiment classifier for reviews, a dynamic pricing regression engine, an affinity experience recommender, and a speech-enabled AI Concierge chatbot (Aranya).

> This repository is an academic prototype. Generated database binaries, server log caches, and temporary local test assets are intentionally excluded from Git.

## Key Features

- **Interactive AI Chatbot & Voice Concierge (Aranya)**: Keyword NLP response matching, voice output (`speechSynthesis`), dynamic audio soundwave visualizer, and scroll-to-section tour guide.
- **NLP Review Sentiment Classifier**: On-input review analyzer computing sentiment polarity scores (Positive/Negative/Neutral) dynamically in the browser, persisting classification labels to the SQLite database.
- **Predictive Dynamic Pricing Regressor**: Simulates seasonal demand (Monsoons off-peak discount vs peak winter holiday surcharge) and weekend premiums, with variable model confidence predictions.
- **Affinity Recommendation Engine**: Suggests experience add-ons based on the selected package (Starter, Pro, Luxury).
- **Light/Dark Emerald Theme Toggler**: Complete HSL-variable system with client-side setting persistence.
- **Scroll-Reveal Animation System**: Native `IntersectionObserver` scroll triggers with smooth fade and slide delays.
- **Floating Ambient Background Orbs**: Blurred gradient background accent bubbles drifting on CSS keyframes.
- **Pass & Booking Receipt Generator**: Printable entry ticket modal with a simulated barcode scanner layout.
- **Full-Stack REST Architecture**: SQLite database tracking reviews, bookings, and contact details with safe dynamic startup migrations.

## Application Screenshots

<table>
  <tr>
    <th>Homepage</th>
    <th>AI Chatbot</th>
    <th>Dynamic Pricing</th>
    <th>NLP Sentiment</th>
  </tr>
  <tr>
    <td><img src="screenshots/homepage.png" width="180" alt="GreenHaven homepage landing page"></td>
    <td><img src="screenshots/ai_chatbot.png" width="180" alt="AI chatbot Aranya panel"></td>
    <td><img src="screenshots/dynamic_pricing.png" width="180" alt="AI dynamic pricing calculator"></td>
    <td><img src="screenshots/nlp_sentiment.png" width="180" alt="Live review NLP sentiment analysis"></td>
  </tr>
  <tr>
    <th>Dark Theme</th>
    <th>Booking Receipt</th>
    <th>Package Filter</th>
    <th>-</th>
  </tr>
  <tr>
    <td><img src="screenshots/dark_theme.png" width="180" alt="Dark theme emerald layout"></td>
    <td><img src="screenshots/booking_receipt.png" width="180" alt="Scannable ticket receipt modal"></td>
    <td><img src="screenshots/package_filter.png" width="180" alt="Filtered adventure packages"></td>
    <td>-</td>
  </tr>
</table>

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend Layout | HTML5, Vanilla CSS3 (HSL custom variables, Flexbox, Grid) |
| Motion & Animation | CSS Keyframes, JS `IntersectionObserver` API |
| Backend API | Python HTTP server, built-in REST routing |
| Database | SQLite3, relational schema, automated start migrations |
| AI Chatbot / Voice | Web Speech API (`speechSynthesis`), HTML Canvas waves, keyword NLP |
| ML Simulators | Lexicon Sentiment Classifier, Seasonal Pricing Regressor, Affinity Recommender |
| Cache & Local Fallbacks | HTML5 LocalStorage (Static Demo Mode fallback) |

## Project Structure

~~~text
nature-tourism-retreat/
├── css/
│   └── main.css             # Main stylesheet with layout grid, variables, themes, & AI styling
├── js/
│   └── app.js               # Client controller (NLP sentiment, dynamic regressor, chatbot, etc.)
├── img/
│   ├── logo.png             # Brand logo for GreenHaven Eco-Retreat
│   ├── avatar.png           # Profile avatar for Aranya (AI Concierge)
│   └── [photos...]          # Activity assets (trekking, camping, dining)
├── screenshots/
│   ├── homepage.png         # Screenshot of initial landing page
│   ├── ai_chatbot.png       # Screenshot of open chatbot panel
│   ├── dynamic_pricing.png  # Screenshot of active pricing calculations
│   ├── nlp_sentiment.png    # Screenshot of live review sentiment tagging
│   ├── dark_theme.png       # Screenshot of dark slate theme
│   ├── booking_receipt.png  # Screenshot of generated barcode pass modal
│   └── package_filter.png   # Screenshot of filtered adventure cards
├── server.py                # Python HTTP Server and REST API routers
├── greenhaven.db            # Relational SQLite database
├── README.md                # Project documentation
└── .gitignore               # Excludes database files and cache logs from git tracking
~~~

## Prerequisites

- Python 3.x installed
- A modern web browser with speech support (e.g., Google Chrome)

## Backend Setup

Run this command from the repository root:

~~~powershell
python server.py
~~~

*The console will initialize, run database migrations, seed default reviews, and start listening.*

The API runs at:

~~~text
http://127.0.0.1:8080
~~~

## Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/reviews` | Retrieve all validated testimonials and NLP ratings |
| POST | `/api/reviews` | Submit new testimonial with NLP sentiment metrics |
| POST | `/api/bookings` | Submit a dynamic booking request |
| POST | `/api/contact` | Submit contact helpdesk inquiries |

## Testing and Validation

Validate the Python source:

~~~powershell
python -m compileall server.py
~~~

## Repository Data Policy

- The local SQLite database binary (`greenhaven.db`) is excluded from Git to keep the repository lightweight.
- The Python server runs migrations and seeds default test data automatically on startup if the database is missing.

## Author

**Gangotri Kompalwar**

- GitHub: [kompalwargangotri](https://github.com/kompalwargangotri)
- LinkedIn: [Gangotri Kompalwar](https://www.linkedin.com/in/gangotri-kompalwar-4635b9359)
