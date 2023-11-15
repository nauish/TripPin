# TripPin 旅圖：旅遊規劃、社交網站

TripPin is a web application that helps you plan your trips, find the best deals, and share your experiences with other travelers.

## Why use TripPin?

Planning a trip can be difficult, especially when you have to search for information from different sources like Google or Blog posts, find deals on Hotel and flight booking websites, all while discussing with friends and families and jot them all down on a notebook.

What if you could see your itinerary on a map, and adjust the time and order of each activity? What if you could discuss with your friends and figure out your travel plans together?

TripPin aims to make the process of planning a trip easier and more enjoyable. You can start by creating a simple plan, then share your plans with your friends, or make them public for others to use. You can also browse other people’s plans, and customize them to suit your needs.

## Main Features

- Create trips with basic criteria, such as:
  - Budget
  - Region
  - Country
  - Travel preferences (e.g. sightseeing, food, culture, etc.)
  - Transportation (e.g. car rental, driving, etc.)
  - Accommodation
  - Travel duration
- View and book flights from various websites
- See their itinerary on a map, and edit the order and duration of each activity.
- Share plans with friends, or make public for others to see and use.
- Upload photos or videos of their trip, and join travel plans.
- Text with friends and discuss upon trip locations.

## Planned Upcoming Features

- Chat with an AI assistant who can help them with planning, and answer their questions
- Video call or text with other travelers who have been to or live in their destination, and get their tips and recommendations

## Technologies used

- Backend

  - Server: Express in TypeScript on EC2
  - Database: PostgreSQL (on Amazon RDS)
  - Static storage: S3, Cloudfront
  - Cache: Redis (on ElastiCache)

- Frontend:

  - Framework: Vite + React, Tailwind
  - Video call: WebRTC\*
  - Text chat: Socket.io

- Third Party:
  - Third Party Login integration: Google, Facebook
  - AI: OpenAI DaVinci 3.5 API\*
  - API: Google Maps, SkyScanner

\* = Planned

## Deployment

1. Start PostgreSQL server
2. Create config: `.env` for back-end (You can copy the schema from template: `.env-template`)
3. Install server dependencies `npm install`

### Run Develop Server

```
npm run dev
```

### Run Production Sever

```
npm run build
npm run start
```

### Run Queue

```
npm run queue
```
