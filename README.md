# Leaderboard

A real-time event leaderboard for 90 tribes across 5 venues, built with Next.js, MongoDB, and Tailwind CSS.

## Overview

This system manages scores for inter-venue competitions held on working days in September 2026 (8, 9, 10, 11, 15). Each venue's group leader logs in, creates events, and scores their 18 tribes. A public leaderboard displays all 90 tribes ranked by total points.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB (Mongoose)
- **Styling:** Tailwind CSS v4
- **Auth:** JWT (JSON Web Tokens)
- **Language:** JavaScript

## Project Structure

```
leaderboard/
├── app/
│   ├── layout.jsx              # Root layout
│   ├── page.jsx                # Public leaderboard (home)
│   ├── globals.css             # Tailwind CSS styles
│   ├── login/page.jsx          # Group leader login
│   ├── admin/page.jsx          # Dashboard (events + score entry)
│   └── api/
│       ├── auth/login/route.js # POST login
│       ├── teams/route.js      # GET all teams
│       ├── teams/group/[groupId]/route.js # GET teams by venue
│       ├── events/route.js     # GET/POST events
│       ├── events/[id]/route.js # DELETE event
│       └── scores/
│           ├── leaderboard/route.js # GET ranked leaderboard
│           ├── event/[eventId]/route.js # GET scores per event
│           └── bulk/route.js   # POST bulk score upsert
├── lib/
│   ├── mongodb.js              # MongoDB connection
│   ├── models.js               # All Mongoose schemas
│   └── auth.js                 # JWT auth middleware
├── seed.js                     # Database seeder
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/Rohith200705/leaderboard.git
cd leaderboard
npm install
```

### Environment Variables

Create a `.env` file:

```
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
```

### Seed Database

```bash
npm run seed
```

This creates:
- 5 venues with group leaders
- 90 tribes (18 per venue)
- Login credentials for each venue

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Login Credentials

| Venue | Email | Password |
|---|---|---|
| KRS Seminar Hall | krs@leader.com | 123 |
| ECE Seminar Hall | ece@leader.com | 123 |
| Civil Seminar Hall | civil@leader.com | 123 |
| MS Auditorium | ms@leader.com | 123 |
| MCW | mcw@leader.com | 123 |

## Features

### Public Leaderboard (`/`)
- Ranks all 90 tribes by total points
- Shows top 10 when viewing all venues
- Filter by venue
- Stats: total tribes, total points, average points

### Group Leader Dashboard (`/admin`)
- Create events with name and date (working days only)
- Select an event to score
- Enter points (0-100) for each tribe in the venue
- Bulk save all scores at once
- Only sees and scores their own 18 tribes

### Event Dates
Working days: September 8, 9, 10, 11, 15, 2026

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login |
| GET | `/api/teams` | No | All teams |
| GET | `/api/teams/group/:groupId` | No | Teams by venue |
| GET | `/api/events` | No | All events |
| POST | `/api/events` | Yes | Create event |
| DELETE | `/api/events/:id` | Yes | Delete event |
| GET | `/api/scores/leaderboard` | No | Ranked leaderboard |
| GET | `/api/scores/event/:eventId` | Yes | Scores for event |
| POST | `/api/scores/bulk` | Yes | Bulk save scores |

## Rules

- Max score per tribe per event: **100 points**
- Each venue leader can only score their own 18 tribes
- Events can only be created on working days
- Leaderboard aggregates scores across all events
