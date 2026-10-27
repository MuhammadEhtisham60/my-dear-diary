# Chronicle Diary — Backend Architecture & Implementation Plan

Comprehensive backend plan for the Chronicle Personal Diary & Notes application.

---

## 1. Technology Stack Recommendation

### Recommended: **Node.js + Express.js + MongoDB (Mongoose)**

| Component | Choice | Rationale |
| :--- | :--- | :--- |
| **Runtime** | **Node.js (v18+)** | Fast event-driven I/O, unified JavaScript ecosystem with the React frontend. |
| **Web Framework** | **Express.js (v4/v5)** | Lightweight, robust, industry-standard with minimal overhead and rich middleware ecosystem. |
| **Database** | **MongoDB** | Diary entries are naturally document-based (unstructured text, flexible tags arrays, dynamic mood attributes). |
| **ODM** | **Mongoose (v8+)** | Schema validation, type casting, query building, lifecycle hooks, and virtual properties. |
| **Authentication** | **JWT (`jsonwebtoken`) + `bcryptjs`** | Stateless authentication matching the current `localStorage` token handling in the frontend. |
| **Validation** | **`express-validator`** or **`zod`** | Strict validation of incoming payloads (auth, entries, notes). |
| **Environment & Security** | **`dotenv`, `cors`, `helmet`, `express-rate-limit`** | Secure headers, rate-limited auth endpoints, and CORS origin restriction. |

---

## 2. System Architecture & Directory Structure

Recommended layout under `diary-backend/` (sibling to `diary-frontend/`):

```
diary-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & event listeners
│   ├── models/
│   │   ├── User.js               # User accounts & preferences
│   │   ├── Entry.js              # Diary entries, tags, mood, word count
│   │   └── Note.js               # Future notes, reminders, priority
│   ├── controllers/
│   │   ├── authController.js     # Signup, login, password reset, get current user
│   │   ├── entryController.js    # CRUD, pagination, search, calendar, favorite toggle
│   │   ├── noteController.js     # CRUD, completion toggle
│   │   └── userController.js     # Profile updates, password changes, stats calculation
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── entryRoutes.js        # /api/entries
│   │   ├── noteRoutes.js         # /api/notes
│   │   └── userRoutes.js         # /api/users
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification & populates req.user
│   │   ├── errorHandler.js       # Centralized error handler
│   │   └── validate.js           # Schema / body validation middleware
│   ├── utils/
│   │   ├── streakCalculator.js   # Consecutive diary writing streak logic
│   │   └── tokenHelper.js        # JWT token generation & verification
│   └── app.js                    # Express app configuration & middleware
├── server.js                     # Server entrypoint (listens on PORT)
├── .env.example                  # Environment variable template
├── .gitignore                    # Node modules, environment files
└── package.json
```

---

## 3. Database Schemas

### 3.1. `User` Schema
```javascript
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  bio: {
    type: String,
    default: '',
    maxlength: 300,
  },
  avatar: {
    type: String,
    default: null,
  },
  timezone: {
    type: String,
    default: 'America/New_York',
  },
  dateFormat: {
    type: String,
    default: 'MMM dd, yyyy',
  },
  weekStart: {
    type: String,
    enum: ['Monday', 'Sunday'],
    default: 'Monday',
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'light',
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', UserSchema);
```

### 3.2. `Entry` Schema (Diary Entries)
```javascript
import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true,
  },
  mood: {
    type: String,
    enum: [
      'happy', 'excited', 'calm', 'thoughtful',
      'sad', 'anxious', 'grateful', 'tired', 'angry', 'neutral'
    ],
    default: 'neutral',
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    index: true,
  }],
  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },
  isDraft: {
    type: Boolean,
    default: false,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Auto-calculate word count prior to saving
EntrySchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.wordCount = this.content ? this.content.trim().split(/\s+/).filter(Boolean).length : 0;
  }
  next();
});

// Compound index for fast user date range queries & search
EntrySchema.index({ userId: 1, date: -1 });
EntrySchema.index({ userId: 1, title: 'text', content: 'text' });

export default mongoose.model('Entry', EntrySchema);
```

### 3.3. `Note` Schema (Future Notes / Reminders)
```javascript
import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: String, // YYYY-MM-DD (target date)
    required: true,
    index: true,
  },
  reminderTime: {
    type: String, // HH:mm format, e.g. "09:00"
    default: '09:00',
  },
  completed: {
    type: Boolean,
    default: false,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Note', NoteSchema);
```

---

## 4. API Specification

All protected endpoints require header: `Authorization: Bearer <token>`.

### 4.1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Payload / Query | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new user | `{ name, email, password }` | `{ user, token }` |
| `POST` | `/api/auth/login` | Authenticate user | `{ email, password }` | `{ user, token }` |
| `GET` | `/api/auth/me` | Fetch currently logged in user | Header token | `{ user }` |
| `POST` | `/api/auth/forgot-password` | Request password reset | `{ email }` | `{ message }` |
| `POST` | `/api/auth/logout` | Invalidate token / client log out | None | `{ success: true }` |

### 4.2. Diary Entries (`/api/entries`)
| Method | Endpoint | Description | Payload / Query | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/entries` | List entries (with pagination & filters) | `?search=&mood=&tags=&favorites=&sort=&page=1&limit=12` | `{ entries, total, page, totalPages }` |
| `GET` | `/api/entries/:id` | Get single entry by ID | None | `{ entry }` |
| `POST` | `/api/entries` | Create new entry | `{ title, content, date, mood, tags, isFavorite, isDraft }` | Created `{ entry }` |
| `PUT` | `/api/entries/:id` | Update an existing entry | `{ title, content, date, mood, tags, isDraft }` | Updated `{ entry }` |
| `DELETE`| `/api/entries/:id` | Delete an entry | None | `{ success: true }` |
| `PATCH`| `/api/entries/:id/favorite` | Toggle favorite flag | None | `{ id, isFavorite }` |
| `GET` | `/api/entries/by-date/:date` | Get entries for a single day | Parameter `:date` (YYYY-MM-DD) | `[ ...entries ]` |
| `GET` | `/api/entries/calendar` | Get array of active dates in month | `?year=2026&month=10` | `["2026-10-01", "2026-10-03", ...]` |

### 4.3. Future Notes & Reminders (`/api/notes`)
| Method | Endpoint | Description | Payload / Query | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notes` | Get all notes for user (sorted by date) | None | `[ ...notes ]` |
| `POST` | `/api/notes` | Create a new future note | `{ title, description, date, reminderTime, tags, priority }` | Created `{ note }` |
| `PUT` | `/api/notes/:id` | Update note | `{ title, description, date, reminderTime, tags, priority }` | Updated `{ note }` |
| `DELETE`| `/api/notes/:id` | Delete note | None | `{ success: true }` |
| `PATCH`| `/api/notes/:id/toggle` | Toggle `completed` state | None | Updated `{ note }` |

### 4.4. User Profile & Analytics (`/api/users`)
| Method | Endpoint | Description | Payload / Query | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Get full user profile | None | `{ user }` |
| `PUT` | `/api/users/profile` | Update profile fields | `{ name, bio, timezone, dateFormat, weekStart, theme, avatar }` | Updated `{ user }` |
| `PUT` | `/api/users/change-password` | Update account password | `{ currentPassword, newPassword }` | `{ message }` |
| `GET` | `/api/users/stats` | Aggregate dashboard statistics | None | `{ totalEntries, currentStreak, longestStreak, favorites, moodBreakdown, totalWords }` |

---

## 5. Key Business Logic Implementations

### 5.1. Writing Streak Calculation Algorithm
Calculated dynamically from the user's entry dates:
1. Fetch distinct entry dates for the user sorted descending: `['2026-10-02', '2026-10-01', ...]`.
2. Check if the latest entry is today or yesterday. If neither, `currentStreak = 0`.
3. Count consecutive days backward until a missing day is found.
4. Calculate `longestStreak` across all historic entry dates.

### 5.2. Search & Filter Queries
```javascript
const filter = { userId: req.user._id };

if (search) {
  filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { content: { $regex: search, $options: 'i' } },
    { tags: { $regex: search, $options: 'i' } },
  ];
}
if (mood) filter.mood = mood;
if (tags && tags.length > 0) filter.tags = { $all: Array.isArray(tags) ? tags : [tags] };
if (favorites === 'true' || favorites === true) filter.isFavorite = true;
```

---

## 6. Frontend Integration Plan

Once the backend is running:

1. **Environment Variable in Frontend (`diary-frontend/.env`)**:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Connecting `src/services/api.js`**:
   Replace mock arrays and mock timeouts with an HTTP client (e.g. `fetch` or `axios`) attaching the JWT token from `localStorage.getItem('chronicle_token')`:
   ```javascript
   const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

   async function request(endpoint, options = {}) {
     const token = localStorage.getItem('chronicle_token');
     const headers = {
       'Content-Type': 'application/json',
       ...(token ? { Authorization: `Bearer ${token}` } : {}),
       ...options.headers,
     };

     const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
     const data = await res.json();
     if (!res.ok) throw new Error(data.message || 'API request failed');
     return data;
   }
   ```

---

## 7. Step-by-Step Execution Plan

- [ ] **Phase 1: Project Scaffolding**
  - Create directory `diary-backend`
  - Initialize `package.json` with `express`, `mongoose`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `helmet`, `morgan`
  - Setup `.env.example`, `.gitignore`, and Express server listener
- [ ] **Phase 2: Database & Models**
  - Connect to MongoDB via Mongoose
  - Implement `User`, `Entry`, and `Note` schemas with indexing
- [ ] **Phase 3: Auth & Security**
  - Implement user registration, password hashing (`bcryptjs`), and JWT token generator
  - Implement login and `authMiddleware` for protected route guards
- [ ] **Phase 4: Diary CRUD & Special Endpoints**
  - Implement entries list with search, mood, tags, and pagination
  - Implement favorite toggle, calendar date highlights, and by-date lookups
- [ ] **Phase 5: Notes & Analytics**
  - Implement future notes CRUD and complete toggle
  - Implement stats aggregation (streak calculation, mood counts, total words)
- [ ] **Phase 6: Frontend Wire-up & Verification**
  - Update `diary-frontend/src/services/api.js` to target the live backend
  - Test registration, entry creation, calendar highlights, and notes end-to-end
