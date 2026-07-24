# ICAO/NATO/IMO Spelling Alphabet

This project is a lightweight, interactive learning app for the International Radiotelephony Spelling Alphabet. It brings together letters, numbers, pronunciation, filters and simple progress tracking in one dependency-free web experience.

## Highlights

- 26 letters and 10 numbers in a clear card-based layout
- real pronunciation via the Web Speech API
- search and filters for vowels, consonants and numbers
- found counter and short feedback messages
- basic PWA support with manifest, service worker and offline fallback

## Project structure

- index.html — main page and app shell
- assets/css/styles.css — shared styles
- assets/js/app.js — app logic, rendering and animations
- offline.html — fallback page for offline use
- sw.js — service worker for caching and offline support
- assets/icons/ — icons and web app manifest
- README.md — technical overview
- info.md — background and project context

## Run locally

You can open the app directly in a browser or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Notes

The implementation is intentionally simple and dependency-free so it stays easy to maintain and extend.
