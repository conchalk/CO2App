CO2 PWA (Quiz + Footprint Calculator)

How to run locally:
1) Use a local web server (service workers require http://localhost or https).
   Example (Python):
     python -m http.server 8000
2) Open:
     http://localhost:8000/

How to deploy:
- Upload the folder contents to any static hosting (GitHub Pages, Netlify, etc.).
- First visit online -> the app caches assets -> then it can work offline.

Notes:
- Quiz questions are in: assets/questions/quiz2.json
- Footprint model (bases + factors) is in: assets/footprintModel.json
