# Mess Menu & Feedback — Frontend

Plain HTML/CSS/JS frontend for the Mess Menu & Feedback System. No build step needed.

## Files
- `index.html` — page structure (Student view + Admin view, tab-switched)
- `style.css` — styling
- `app.js` — all logic: fetches menu, submits feedback, adds menu entries (admin), loads feedback summary (admin)

## Setup
1. Open `app.js` and confirm `API_BASE_URL` points to your live Render backend URL.
2. Open `index.html` directly in a browser to test locally, or deploy the whole folder to Vercel/Netlify.

## Features
- **Student View:** browse the current menu, submit a rating + comment for any listed meal.
- **Admin View:** add new menu entries, refresh and view average rating + feedback count per meal.
