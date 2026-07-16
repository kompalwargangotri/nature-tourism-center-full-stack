# Nature Tourism Center Full Stack

Nature Tourism Center Full Stack is a modern tourism and travel management platform designed to promote eco-tourism experiences through an interactive web application. The platform provides package discovery, dynamic pricing, AI-powered assistance, sentiment analysis, booking management, and an engaging user experience.

> This repository is an academic prototype developed for educational and portfolio purposes. Backend services and databases are lightweight and intended for demonstration use only.

## Key Features

- **Responsive Tourism Website**: Complete single-page layout featuring flex and grid components.
- **Package Exploration & Category Filtering**: Dynamically filters experiences (Adventure, Camping, Deluxe).
- **Predictive Dynamic Pricing Regressor**: Simulates seasonal demand (Monsoons -15%, Winter Peak +12%) and weekend premiums (+5%).
- **AI-Powered Virtual Voice Guide (Aranya)**: Floating concierge widget with keyword NLP responses and text-to-speech synthesis.
- **NLP Sentiment Analysis Classifier**: Classifies review feedback on-input (Positive/Negative/Neutral) with live accuracy updates.
- **Interactive Ticket Receipt Modal**: Printable client-side reservation tickets featuring scannable barcodes.
- **Dark Mode Toggler**: Seamlessly swaps between Light Emerald and Dark Slate HSL theme styling.
- **Lightweight SQLite Database**: Backed by `sqlite3` relational tables for persistent storage of bookings and reviews.
- **Zero-Dependency Python Server**: Built on Python's native `http.server` libraries.
- **Aesthetic Scroll-Reveal Effects**: Enhanced visual motion using the native browser `IntersectionObserver` API.

## Application Screenshots

<table>
  <tr>
    <th>Homepage</th>
    <th>AI Chatbot</th>
    <th>Package Filter</th>
    <th>Dynamic Pricing</th>
  </tr>
  <tr>
    <td><img src="screenshots/homepage.png" width="180"></td>
    <td><img src="screenshots/ai_chatbot.png" width="180"></td>
    <td><img src="screenshots/package_filter.png" width="180"></td>
    <td><img src="screenshots/dynamic_pricing.png" width="180"></td>
  </tr>
  <tr>
    <th>Booking Receipt</th>
    <th>Dark Theme</th>
    <th>NLP Sentiment</th>
  </tr>
  <tr>
    <td><img src="screenshots/booking_receipt.png" width="180"></td>
    <td><img src="screenshots/dark_theme.png" width="180"></td>
    <td><img src="screenshots/nlp_sentiment.png" width="180"></td>
  </tr>
</table>

## Technology Stack

| Layer | Technologies |
|------|------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Python `http.server` (zero dependencies) |
| Database | SQLite (`sqlite3`) |
| Styling | HSL Variables CSS (Glassmorphism, Scroll Reveal animations) |
| Client Interaction | JavaScript DOM, IntersectionObserver API |
| AI/ML Simulators | NLP Sentiment Lexicon, Seasonal Regression, Keyword Bot, Web Speech Synthesis |
| Deployment | GitHub Pages (with dynamic local-storage demo mode fallback) |

## Project Structure

```text
nature-tourism-center-full-stack/
├── css/
│   └── main.css             # Main stylesheet with layout grid, themes, and animations
├── img/
│   ├── logo.png             # GreenHaven retreat branding logo
│   ├── avatar.png           # Aranya AI Concierge profile picture
│   ├── bg1.jpg              # Hero section landscape view
│   └── ...
├── js/
│   └── app.js               # Client controller (NLP engine, pricing regression, virtual guide)
├── screenshots/
│   ├── homepage.png
│   ├── ai_chatbot.png
│   ├── package_filter.png
│   ├── dynamic_pricing.png
│   ├── booking_receipt.png
│   ├── dark_theme.png
│   └── nlp_sentiment.png
├── greenhaven.db            # SQLite relational database
├── index.html               # Main single-page application document
├── server.py                # Python HTTP Server and REST API routers
├── .gitignore
└── README.md
```

## Features Overview

### Tourism Package Management
*   **Destinations Discovery**: Explore a list of retreats, camping locations, and hiking tours.
*   **Preferences Filtering**: Filter package listings using dynamic Category chips.

### Predictive Dynamic Pricing Regressor
*   **Monsoon Discount**: In India, the monsoon season is off-peak; the model applies a **-15% discount** for bookings made in July/August.
*   **Winter Peak Premium**: Applying a **+12% premium** during Christmas/New Year holiday peaks.
*   **Weekend Premium**: Toggles a **+5% rate adjustment** on Friday, Saturday, and Sunday bookings.
*   **Confidence Metrics**: Dynamically adjusts a simulated model confidence rating (e.g. 93% to 97%) based on input date variables.

### AI Virtual Voice Concierge (Aranya)
*   **Interactive Chat Panel**: Allows user messaging with dynamic quick-response chips.
*   **Voice Synthesis**: Uses the browser's native Web Speech API (`speechSynthesis`) to narrate text replies with real-time soundwave animations.
*   **Audio Tour Guide**: Scrolls the window and highlights key sections of the website on-request.

### NLP Sentiment Analysis
*   **Live Text Classifier**: Reviews text inputs on-input to measure positive and negative signal weights.
*   **Polarity Scoring**: Computes numerical positive percentages and assigns a `Positive`, `Neutral`, or `Negative` badge dynamically.
*   **Database Schema**: Posts results to the backend SQLite tables (`sentiment_label` and `sentiment_score`).

### Booking & Ticket Management
*   **SQLite Persistence**: Stores reservation name, email, dates, package, and cost attributes securely.
*   **Barcode Ticket Modal**: Compiles a printable retreat gate-pass modal complete with guest parameters and a custom barcode simulation.

## Prerequisites

*   Python 3.10+
*   Modern Web Browser (Chrome, Edge, Firefox, or Safari)
*   Git

## Running the Project

### Clone the Repository

```powershell
git clone https://github.com/kompalwargangotri/nature-tourism-center-full-stack.git
cd nature-tourism-center-full-stack
```

### Start the Backend Server

```powershell
python server.py
```

The server will initialize relational table migrations and start listening at:

```text
http://127.0.0.1:8080
```

### Open the Application
*   Navigate to `http://127.0.0.1:8080` in your web browser.
*   *Static Hosting Note*: If hosted on a static server (like GitHub Pages) without python running, the application will automatically enter **Demo Mode** using `localStorage` so all interactive calculations, recommendations, and reviews continue to function locally.

## Database

The application uses an SQLite database:

```text
greenhaven.db
```

The database stores:
*   `reviews`: customer comments, review scores, NLP sentiment labels, and sentiment scores.
*   `bookings`: registration details, travel dates, package selected, and final dynamically calculated cost.
*   `contacts`: helpdesk query messages.

## Testing
*   Runs manual and automated browser-subagent validation flows checking responsive grids, dark theme configurations, interactive pricing parameters, NLP form submissions, and ticket rendering.

## Repository Data Policy

The following files are excluded from version control:
*   Python cache files (`__pycache__/`)
*   Local database files (`greenhaven.db` - git-ignored to prevent overwriting user submissions)
*   IDE workspace configuration logs (`.idea/`, `.vscode/`)

## Future Improvements

- User authentication (JWT based)
- Live payment gateway integration (Razorpay/Stripe mockups)
- Interactive Google Maps location pin markers
- Real-time weather update integration
- High-performance cloud server hosting

## Author

**Gangotri Kompalwar**

- GitHub: <https://github.com/kompalwargangotri>
- LinkedIn: <https://www.linkedin.com/in/gangotri-kompalwar-4635b9359>
