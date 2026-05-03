📡 PulseCheck

A production-oriented distributed uptime monitoring system inspired by modern observability tools like Pingdom and Datadog.

PulseCheck continuously monitors service availability, detects failures in real time, and manages incident lifecycles using a scalable, queue-driven architecture.

🚀 Key Highlights

⚡ Asynchronous architecture using Redis + BullMQ for high scalability
🔁 Idempotent & retry-safe workers with exponential backoff
📊 Real-time analytics via incremental aggregation (90% faster queries)
🔐 Secure system with JWT-based authentication
📉 Optimized MongoDB indexing & query design (ESR, partial indexes)
🧠 Designed with production trade-offs & failure scenarios in mind

🏗️ System Architecture


```mermaid 
graph TD
    %% Styling Classes for Slate & Indigo Theme
    classDef client fill:#0f172a,stroke:#6366f1,stroke-width:2px,color:#ffffff;
    classDef api fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#ffffff;
    classDef queue fill:#0f172a,stroke:#4f46e5,stroke-width:2px,color:#ffffff;
    classDef worker fill:#1e293b,stroke:#4f46e5,stroke-width:2px,color:#ffffff;
    classDef db fill:#0f172a,stroke:#4338ca,stroke-width:2px,color:#ffffff;
    classDef endpoint fill:#1e1b4b,stroke:#a5b4fc,stroke-dasharray: 5 5,color:#ffffff;

    Client[🖥️ Client Request]:::client --> API[🚀 API Server Node.js/Express]:::api
    API -->|Push Job| Queue[(⌛ Redis + BullMQ Queue)]:::queue
    Worker[⚙️ Background Worker]:::worker -->|Poll Jobs| Queue
    Worker -->|Execute Check| Endpoints[🌐 Target URL/Endpoint]:::endpoint
    Worker -->|Save Heartbeat| DB[(💾 MongoDB Database)]:::db

    subgraph Core Architecture
        API
        Queue
        Worker
        DB
    end
    style Core Architecture fill:#020617,stroke:#334155,stroke-width:1px,color:#ffffff;

```

Client → API (Express)
            ↓
        Queue (BullMQ + Redis)
            ↓
        Worker (Background Processor)
            ↓
        MongoDB

How it works

User creates a monitor via API
A repeatable job is scheduled in BullMQ
Worker picks jobs and performs HTTP checks
Heartbeats are stored in MongoDB
Failure detection triggers incident lifecycle
Aggregation layer maintains analytics data

🔄 Data Flow
Heartbeat → Failure Detection → Incident Lifecycle → Aggregation → Analytics API

```mermaid
flowchart LR
    %% Theme Styling
    classDef step fill:#0f172a,stroke:#6366f1,stroke-width:2px,color:#ffffff;
    classDef alert fill:#450a0a,stroke:#ef4444,stroke-width:2px,color:#fca5a5;
    classDef success fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#a7f3d0;
    classDef db fill:#1e1b4b,stroke:#818cf8,stroke-width:1px,color:#ffffff;

    Start([Periodic Job Trigger]):::step --> Check[Perform HTTP Request]:::step
    Check --> Status{HTTP Status & Response Time?}:::step
    
    Status -->|Success| HB[Create Heartbeat: UP]:::success
    Status -->|Failure| HBD[Create Heartbeat: DOWN]:::alert
    
    HB --> Agg[Hourly Incremental Aggregation]:::step
    HBD --> FailCheck{3 Consecutive DOWNs?}:::step
    
    FailCheck -->|No| Agg
    FailCheck -->|Yes| Incident[Trigger/Open Incident]:::alert
    
    Incident --> Agg
    Agg --> Cache[(MongoDB Bucketed Analytics)]:::db
    Cache --> API[📊 Analytics API Response]:::step

```

⚙️ Core Features

🌐 Monitoring Engine
Periodic URL checks using repeatable jobs
Measures:
Response time
HTTP status
Error states

❤️ Heartbeat System

Each check generates:
monitorId
status (up/down)
responseTime
statusCode
error
checkedAt

🚨 Failure Detection

Uses last 3 heartbeats
Marks failure on 3 consecutive DOWN states

```meramid
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#0f172a', 'primaryTextColor': '#ffffff', 'primaryBorderColor': '#6366f1', 'lineColor': '#818cf8', 'secondaryColor': '#1e1b4b', 'tertiaryColor': '#020617' } } }%%
stateDiagram-v2
    [*] --> UP
    
    UP --> DOWN: 1st Down Heartbeat
    DOWN --> UP: 1st Up Heartbeat (Recovers)
    
    state DOWN {
        [*] --> Strike1
        Strike1 --> Strike2: 2nd consecutive failure
        Strike2 --> Strike3: 3rd consecutive failure
        Strike3 --> [*]: Trigger Incident Lifecycle
    }
    
    Strike3 --> ActiveIncident
    ActiveIncident --> Resolved: Up Heartbeat Detected
    Resolved --> UP: Auto-Resolves & Closes Incident

```

📟 Incident Management
Prevents duplicate incidents
Auto-resolves on recovery
Tracks full lifecycle

📊 Analytics Engine (Optimized)
Problem:

Heavy aggregation queries don’t scale well

Solution:
Built incremental hourly aggregation system
Uses bucketed writes during worker execution
Impact:
⚡ ~90% reduction in query latency
📉 ~80% reduction in DB load

📈 Summary API

Returns:
Uptime %
Avg response time
Total downtime
Failure count

🔐 Authentication & Security
JWT-based authentication (cookie-based)
Monitor ownership validation
Prevents cross-user access
Secure middleware-based access control

🧠 Advanced Engineering Decisions

🗃️ MongoDB Optimization
Compound indexing (ESR pattern)
Partial indexes for active incidents
Covered queries for pagination
Cursor-based pagination (O(1) performance)

🔁 Worker Reliability

Idempotent writes
Retry strategy:
Exponential backoff
Retry only on 5xx & network errors
Dead letter queue support
Concurrency-safe design

⚖️ Trade-offs

Cron-based worker (due to free tier limits)
Known limitation:
Aggregation may miss data if retry fails mid-process
Chose simplicity over over-engineering

🧪 Testing & Performance
40+ unit & integration tests
Stress tested with 10,000+ incidents per monitor

Results:
IXSCAN queries
No in-memory sorting
~1ms query latency
Consistent pagination performance

🖥️ Frontend

React + TypeScript + TailwindCSS
React Query (auto refetching)

Dashboard with:
Monitor overview
Incident history
Analytics charts (ShadCN)
Infinite scrolling (heartbeats & incidents)

🐳 DevOps & Deployment
Dockerized services (API, Worker, DB)
Docker Compose setup
CI pipeline (test + build + deploy)
Hosted on Render

📦 Tech Stack

Backend
Node.js, Express
MongoDB

Queue & Workers
Redis
BullMQ

Frontend
React, TypeScript, TailwindCSS

DevOps
Docker, CI/CD
⚠️ Limitations
Cron-based worker may introduce delays
Not fully real-time without dedicated worker infra

🚀 Future Improvements
Real-time alerts (WebSockets / Email)
Status pages
Distributed worker scaling
SLA tracking
Alert policies

🧑‍💻 Getting Started
git clone https://github.com/Vishwas2607/pulse-check-mern.git
cd pulse-check-mern
npm install

Create .env:
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
REDIS_URL=your_redis_url

Run:
npm run dev

Worker:
node src/index.js