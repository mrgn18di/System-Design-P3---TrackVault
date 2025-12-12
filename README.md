# TrackVault – System Design Project 3

TrackVault is a full-stack application that allows users to search songs using the iTunes Search API and save favourites using MongoDB Atlas.

## Features
- Search songs from iTunes
- Save / remove favourite tracks
- MongoDB cloud storage
- Node.js + Express backend
- Frontend with HTML/CSS/JS

## Installation
npm install
node server.js

## Environment Variables
Create a .env file with:
MONGODB_URI=your_uri_here
PORT=3000

## API Routes
GET /api/search
POST /api/favorites
GET /api/favorites
DELETE /api/favorites/:id

## Tech Stack
- Node.js
- Express
- MongoDB (Atlas)
- iTunes Search API
- Frontend: HTML/CSS/JS
