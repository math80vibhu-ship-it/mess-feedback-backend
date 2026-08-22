# Mess Menu & Feedback System — Backend

REST API for the Mess Menu & Feedback System (BACSE344 project).
Stack: Node.js, Express, MongoDB Atlas (Mongoose).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string.
3. `npm run dev` (uses nodemon) or `npm start`

## API Endpoints

### Menu
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/menu | Create a menu entry |
| GET | /api/menu | Get all menu entries (optional `?day=Monday`) |
| GET | /api/menu/:id | Get a single menu entry |
| PUT | /api/menu/:id | Update a menu entry |
| DELETE | /api/menu/:id | Delete a menu entry |

### Feedback
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/feedback | Submit feedback for a meal |
| GET | /api/feedback/summary | Average rating + count per meal |
| GET | /api/feedback/:menuId | Get all feedback for a specific meal |
| DELETE | /api/feedback/:id | Delete a feedback entry |

## Sample Request Bodies

**POST /api/menu**
```json
{
  "day": "Monday",
  "mealType": "Lunch",
  "items": ["Rice", "Sambar", "Curd", "Papad"]
}
```

**POST /api/feedback**
```json
{
  "menuId": "<menu_id_from_menu_response>",
  "studentName": "Vibhuti",
  "rollNo": "21BCE1234",
  "rating": 4,
  "comment": "Sambar was good, rice was a bit undercooked"
}
```
