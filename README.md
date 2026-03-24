📡 PulseCheck

A distributed uptime monitoring system that tracks service health, detects failures, and manages incident lifecycles in real time.

📌 Overview

PulseCheck is designed as a scalable monitoring system that continuously checks the availability of configured endpoints and records their health status.

It follows an asynchronous architecture using a queue-based processing model to ensure reliability and scalability.

🏗️ Architecture

API (Node.js/Express)
        ↓
Queue (Redis + BullMQ)
        ↓
Worker (Background Process)
        ↓
MongoDB

🔄 Flow
Client Request → API → Queue → Worker → Database

✅ Features Implemented

🔧 Core System
API server built with Node.js & Express
MongoDB integration
Monitor creation endpoint
Redis-backed job queue using BullMQ
Dedicated worker process for background jobs

🌐 Monitoring Engine

Periodic URL checks using repeatable jobs
Measures:
Response time
HTTP status
Stores results as heartbeats

❤️ Heartbeat Model

Each check generates a heartbeat record:

monitorId
status (up / down)
responseTime
statusCode
error (if any)
checkedAt

🚨 Failure Detection

Evaluates last 3 heartbeats
Marks as failure if:
3 consecutive down statuses

📟 Incident Management System

Incident Model
monitorId
status (open / resolved)
startedAt
resolvedAt
Logic
Creates incident only if no active incident exists
Prevents duplicate incidents
Automatically resolves when service recovers
Prevents repeated resolution

🔁 System Behavior

Heartbeat → Failure Detection → Incident Lifecycle
❌ Not Implemented Yet
API to fetch heartbeats
API to fetch incidents
Monitor status endpoint
Authentication / Authorization
Frontend UI
Alerting system (Email / WebSockets)

🚀 Getting Started

1. Clone the repository
git clone https://github.com/Vishwas2607/pulse-check-mern.git
cd PulseCheck

2. Install dependencies
npm install

3. Setup environment variables
Create a .env file:

PORT=5000
MONGO_URI=<your-mongodb-uri>
NODE_ENV=development

4. Run services

Start API server
npm run dev
Start worker (separate process)
node worker.js

📦 Tech Stack

Backend: Node.js, Express
Queue: Redis, BullMQ
Database: MongoDB
Worker: Node.js background process

📈 Future Improvements

Real-time alerts (Email / WebSocket)
Dashboard UI
Authentication system
Monitor analytics & history
Status pages
Horizontal scaling for workers