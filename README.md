# Nature Tourism Center Full Stack

Nature Tourism Center Full Stack is a modern tourism and travel management platform designed to promote eco-tourism experiences through an interactive web application. The platform provides package discovery, dynamic pricing, AI-powered assistance, sentiment analysis, booking management, and an engaging user experience.

> This repository is an academic prototype developed for educational and portfolio purposes. Backend services and databases are lightweight and intended for demonstration use only.

## Key Features

- Responsive tourism website interface
- Package exploration and filtering
- Dynamic pricing simulation
- AI-powered tourism chatbot
- NLP-based sentiment analysis
- Booking receipt generation
- Dark mode support
- SQLite database integration
- Python backend server
- Image-rich and interactive UI
- Mobile-friendly design
- Modern CSS and JavaScript components

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
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python Standard Library (http.server & sqlite3 API) |
| Database | SQLite |
| Styling | Custom CSS |
| Client Interaction | JavaScript DOM Manipulation |
| AI Features | NLP Lexicon Analyzer, Speech Synthesis & Rule-Based Chatbot |
| Deployment | GitHub Pages (Frontend static demo fallback) |

## Project Structure

```text
nature-tourism-center-full-stack/
├── css/
│   └── main.css
├── img/
│   ├── avatar.png
│   ├── bg1.jpg
│   ├── logo.png
│   └── ...
├── js/
│   └── app.js
├── screenshots/
│   ├── homepage.png
│   ├── ai_chatbot.png
│   ├── package_filter.png
│   ├── dynamic_pricing.png
│   ├── booking_receipt.png
│   ├── dark_theme.png
│   └── nlp_sentiment.png
├── greenhaven.db
├── index.html
├── server.py
├── .gitignore
└── README.md
```

## Features Overview

### Tourism Package Management

- Discover tourism destinations.
- Filter packages based on preferences.
- Explore curated eco-tourism experiences.

### Dynamic Pricing

- Simulates demand-based pricing.
- Demonstrates intelligent travel pricing concepts.

### AI Chatbot

- Assists users in selecting packages.
- Provides tourism-related recommendations.

### NLP Sentiment Analysis

- Performs sentiment analysis on customer feedback.
- Categorizes responses into positive, negative, and neutral.

### Booking Management

- Generates booking confirmations.
- Stores records using SQLite.

## Prerequisites

- Python 3.10+
- Modern Web Browser
- Git

## Running the Project

### Clone the Repository

```powershell
git clone https://github.com/kompalwargangotri/nature-tourism-center-full-stack.git
cd nature-tourism-center-full-stack
```

### Start the Backend

```powershell
python server.py
```

The backend will run at:

```text
http://127.0.0.1:8080
```

### Open the Frontend

Open:

```text
index.html
```

or visit:

```text
http://127.0.0.1:8080
```

(depending on your server configuration)

## Database

The application uses SQLite:

```text
greenhaven.db
```

The database stores:

- Booking records
- Package information
- User interactions
- Demonstration tourism data

## Testing

### Manual Verification
1. Open the website, click on **Book Now**, enter a booking, and select dates in monsoon (e.g., July) to see dynamic seasonal discounts.
2. Click **Confirm Booking** to generate the scannable gate-pass ticket.
3. Submit a review with words like "beautiful", "cozy", or "terrible" to see real-time NLP sentiment analysis.
4. Interact with the floating **Aranya AI Concierge Chatbot** at the bottom-right corner for voice-narrated assistance.

## Repository Data Policy

The following files are excluded from version control:

- Python cache files
- Environment files
- Build artifacts
- IDE configuration files
- Logs

## Future Improvements

- User authentication
- Payment gateway integration
- Google Maps integration
- Real-time weather updates
- Recommendation engine
- Cloud deployment
- Admin dashboard

## Author

**Gangotri Kompalwar**

- GitHub: <https://github.com/kompalwargangotri>
- LinkedIn: <https://www.linkedin.com/in/gangotri-kompalwar-4635b9359>
