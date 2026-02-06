# Server Infrastructure and Scaling Documentation

**GymRats Fitness App**
**Last Updated:** 2026-02-05
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Overview](#2-current-architecture-overview)
3. [Scaling Strategy by User Tier](#3-scaling-strategy-by-user-tier)
4. [Platform Comparison](#4-platform-comparison)
5. [Media Storage Strategy](#5-media-storage-strategy)
6. [Database Performance](#6-database-performance)
7. [Real-time and WebSocket Scaling](#7-real-time-and-websocket-scaling)
8. [Development and Staging Environments](#8-development-and-staging-environments)
9. [Cost Projection Tables](#9-cost-projection-tables)
10. [Migration Playbook](#10-migration-playbook)
11. [Monitoring and Alerting](#11-monitoring-and-alerting)
12. [Security Considerations](#12-security-considerations)

---

## 1. Executive Summary

This document provides a comprehensive infrastructure roadmap for scaling GymRats from 10 users to 500,000 users. It covers hosting strategy, capacity planning, cost projections, and migration triggers.

**Key Recommendations:**

| User Count | Recommended Platform | Monthly Cost Estimate | Key Action |
|------------|---------------------|----------------------|------------|
| 10-1,000 | Supabase Free/Pro | $0-$50 | Stay on Supabase |
| 1,000-10,000 | Supabase Pro | $50-$200 | Monitor limits |
| 10,000-50,000 | Supabase Pro + Add-ons | $200-$800 | Add compute, consider CDN |
| 50,000-100,000 | Supabase Team or AWS | $800-$2,500 | Evaluate migration |
| 100,000-500,000 | AWS/GCP | $2,500-$10,000+ | Full cloud migration |

---

## 2. Current Architecture Overview

### 2.1 Current Stack

```mermaid
graph TB
    subgraph "Client Layer"
        RN[React Native App]
        AS[AsyncStorage - Local]
        ZS[Zustand Stores]
    end

    subgraph "Sync Layer"
        SO[SyncOrchestrator]
        NM[NetworkMonitor]
        POQ[PendingOperationsQueue]
        CR[ConflictResolver]
    end

    subgraph "Supabase Backend"
        AUTH[Supabase Auth]
        DB[(PostgreSQL)]
        RT[Realtime - WebSockets]
        STORE[Storage Buckets]
        EF[Edge Functions]
    end

    RN --> ZS
    ZS --> AS
    ZS --> SO
    SO --> NM
    SO --> POQ
    SO --> CR
    SO --> AUTH
    SO --> DB
    SO --> RT
    SO --> STORE
```

### 2.2 Current Supabase Configuration

| Resource | Current Setup | Limits |
|----------|--------------|--------|
| Database | PostgreSQL (Free/Pro) | 500MB (Free) / 8GB (Pro) |
| Auth | Supabase Auth | 50K MAU (Free) / 100K MAU (Pro) |
| Storage | Supabase Storage | 1GB (Free) / 100GB (Pro) |
| Realtime | WebSocket connections | 200 (Free) / 500 (Pro) |
| Edge Functions | Serverless functions | 500K invocations (Free) |

### 2.3 Current Database Schema

**Core Tables:**
- `users` - User profiles with gamification data
- `workouts` - Workout sessions
- `workout_sets` - Individual sets within workouts
- `routines` - User-created routines
- `routine_exercises` - Exercises within routines
- `friendships` - Social connections
- `posts` - Social feed posts
- `post_reactions` / `post_comments` - Engagement
- `chat_threads` / `chat_messages` - Direct messaging
- `user_gamification` - XP, levels, streaks

### 2.4 Current Bottlenecks

| Area | Bottleneck | Impact | Threshold |
|------|-----------|--------|-----------|
| Database Connections | 60 direct / 200 pooled | Connection exhaustion at peak | ~100 concurrent users |
| Realtime Connections | 200-500 concurrent | Chat/feed updates lag | ~200 concurrent users |
| Storage Egress | 2GB (Free) / 250GB (Pro) | Video delivery slowdown | Heavy video usage |
| Query Performance | No read replicas | Slow reads during writes | ~10K active users |

### 2.5 Data Flow Diagrams

**Workout Logging Flow:**

```mermaid
sequenceDiagram
    participant App
    participant Zustand
    participant AsyncStorage
    participant SyncOrchestrator
    participant Supabase

    App->>Zustand: Log set (weight, reps)
    Zustand->>AsyncStorage: Persist immediately
    Zustand->>SyncOrchestrator: Queue mutation

    alt Online
        SyncOrchestrator->>Supabase: POST /workouts
        Supabase-->>SyncOrchestrator: Success
        SyncOrchestrator->>Zustand: Update sync status
    else Offline
        SyncOrchestrator->>AsyncStorage: Queue for later
        Note over AsyncStorage: Retry on reconnect
    end
```

**Social Feed Flow:**

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Supabase Realtime
    participant PostgreSQL

    User->>App: Create post
    App->>PostgreSQL: INSERT post
    PostgreSQL->>Supabase Realtime: Broadcast change
    Supabase Realtime->>App: Push to subscribers
    App->>User: Show in feed
```

---

## 3. Scaling Strategy by User Tier

### 3.1 Tier 1: 10 Users (Beta/Testing)

**Traffic Assumptions:**
- Daily Active Users (DAU): 5-7 (50-70%)
- Concurrent Users (peak): 2-3 (20-30%)
- Workouts per day: 3-5
- Posts per day: 1-2

**Infrastructure Configuration:**
- **Plan:** Supabase Free
- **Database:** 500 MB PostgreSQL
- **Compute:** Shared Micro (1 vCPU, 1GB RAM)
- **Storage:** 1 GB for avatars
- **Realtime:** 200 connections (ample headroom)

**Monthly Cost Breakdown:**

| Item | Cost |
|------|------|
| Supabase Free | $0 |
| Domain/SSL | $0 (included) |
| **Total** | **$0** |

**Key Metrics to Monitor:**
- Database size (approaching 500MB)
- Storage usage
- Error rates in sync operations

---

### 3.2 Tier 2: 100 Users (Early Adopters)

**Traffic Assumptions:**
- DAU: 30-50 (30-50%)
- Concurrent Users (peak): 10-20 (10-20%)
- Workouts per day: 20-40
- Posts per day: 5-15
- Database reads: ~5,000/day
- Database writes: ~500/day

**Infrastructure Configuration:**
- **Plan:** Supabase Pro ($25/month)
- **Database:** 8 GB PostgreSQL
- **Compute:** Micro (1 vCPU, 1GB RAM) with $10 credit
- **Storage:** 100 GB
- **Realtime:** 500 connections
- **Egress:** 250 GB included

**Monthly Cost Breakdown:**

| Item | Cost |
|------|------|
| Supabase Pro | $25 |
| Compute (Micro - covered by credit) | $0 |
| Storage overage | $0 |
| **Total** | **$25** |

**Key Actions:**
- Enable automated backups (daily)
- Set up basic monitoring dashboard
- Configure connection pooling

---

### 3.3 Tier 3: 1,000 Users (Traction)

**Traffic Assumptions:**
- DAU: 200-400 (20-40%)
- Concurrent Users (peak): 50-100 (5-10%)
- Workouts per day: 150-300
- Posts per day: 30-60
- Chat messages per day: 200-500
- Database reads: ~50,000/day
- Database writes: ~5,000/day
- Storage: ~5GB avatars, ~20GB media

**Infrastructure Configuration:**
- **Plan:** Supabase Pro
- **Database:** 8 GB (monitor closely)
- **Compute:** Small (2 vCPU, 2GB RAM) - $50/month
- **Storage:** 100 GB (within limits)
- **Realtime:** 500 connections (approaching limit at peak)

**Monthly Cost Breakdown:**

| Item | Cost |
|------|------|
| Supabase Pro | $25 |
| Compute (Small) | $50 - $10 credit = $40 |
| Additional egress (50GB) | $4.50 |
| **Total** | **$70** |

**Key Actions:**
- Implement database indexes for common queries
- Enable connection pooling via Supavisor
- Add image compression (client-side)
- Monitor realtime connection patterns

---

### 3.4 Tier 4: 10,000 Users (Growth)

**Traffic Assumptions:**
- DAU: 1,500-3,000 (15-30%)
- Concurrent Users (peak): 300-600 (3-6%)
- Workouts per day: 1,000-2,000
- Posts per day: 200-400
- Chat messages per day: 2,000-5,000
- Database reads: ~500,000/day
- Database writes: ~50,000/day
- Storage: ~50GB avatars, ~200GB media/videos

**Infrastructure Configuration:**
- **Plan:** Supabase Pro with add-ons
- **Database:** 8GB base + growth monitoring
- **Compute:** Medium (4 vCPU, 4GB RAM) - $100/month
- **Storage:** 250GB (may need overage)
- **Realtime:** Purchase additional connections
- **CDN:** Consider CloudFront for videos

**Monthly Cost Breakdown:**

| Item | Cost |
|------|------|
| Supabase Pro | $25 |
| Compute (Medium) | $100 - $10 credit = $90 |
| Storage overage (150GB) | $0.021/GB = $3.15 |
| Egress overage (200GB) | $0.09/GB = $18 |
| Realtime connections (1K peak) | $10 |
| **Total** | **$150** |

**Key Actions:**
- Implement query caching (Redis consideration)
- Add read replica for analytics queries
- Implement video transcoding pipeline
- Set up external CDN for media delivery
- Database query optimization audit

---

### 3.5 Tier 5: 50,000 Users (Scale)

**Traffic Assumptions:**
- DAU: 7,500-15,000 (15-30%)
- Concurrent Users (peak): 1,500-3,000 (3-6%)
- Workouts per day: 5,000-10,000
- Posts per day: 1,000-2,000
- Chat messages per day: 10,000-25,000
- Database reads: ~2,500,000/day
- Database writes: ~250,000/day
- Storage: ~250GB avatars, ~1TB videos

**Infrastructure Configuration:**
- **Plan:** Supabase Team ($599/month) OR begin AWS migration
- **Database:** Large compute (8 vCPU, 16GB RAM)
- **Storage:** 1TB+ with CDN
- **Realtime:** 3,000+ concurrent connections
- **Caching:** Redis for hot data

**Monthly Cost Breakdown (Supabase Team Path):**

| Item | Cost |
|------|------|
| Supabase Team | $599 |
| Compute (Large) | $110 - $10 credit = $100 |
| Storage overage (900GB) | ~$20 |
| Egress (1TB) | ~$70 |
| Realtime connections (3K) | $30 |
| External CDN (CloudFront) | ~$100 |
| **Total** | **$920** |

**Key Actions:**
- Evaluate AWS/GCP migration cost-benefit
- Implement database sharding strategy
- Add read replicas
- Full CDN implementation
- Load testing and capacity planning

---

### 3.6 Tier 6: 100,000 Users (Major Scale)

**Traffic Assumptions:**
- DAU: 15,000-30,000 (15-30%)
- Concurrent Users (peak): 3,000-6,000 (3-6%)
- Workouts per day: 10,000-20,000
- Posts per day: 2,000-5,000
- Database reads: ~5,000,000/day
- Database writes: ~500,000/day
- Storage: ~500GB avatars, ~2TB videos

**Infrastructure Configuration:**
- **Recommended:** AWS or GCP migration
- **Database:** RDS PostgreSQL db.r6g.large or Cloud SQL
- **Storage:** S3/Cloud Storage with CloudFront/Cloud CDN
- **Realtime:** Pusher/Ably or self-hosted
- **Caching:** ElastiCache Redis

**Monthly Cost Breakdown (AWS Path):**

| Item | Cost |
|------|------|
| RDS db.r6g.large (Multi-AZ) | ~$400 |
| RDS storage (500GB) | ~$60 |
| S3 storage (2.5TB) | ~$60 |
| CloudFront (5TB transfer) | ~$400 |
| ElastiCache Redis | ~$100 |
| Lambda/API Gateway | ~$100 |
| Pusher/Ably realtime | ~$200 |
| Monitoring/misc | ~$50 |
| **Total** | **$1,370** |

---

### 3.7 Tier 7: 500,000 Users (Enterprise Scale)

**Traffic Assumptions:**
- DAU: 75,000-150,000 (15-30%)
- Concurrent Users (peak): 15,000-30,000 (3-6%)
- Workouts per day: 50,000-100,000
- Posts per day: 10,000-25,000
- Database reads: ~25,000,000/day
- Database writes: ~2,500,000/day
- Storage: ~2TB avatars, ~10TB videos

**Infrastructure Configuration:**
- **Platform:** AWS or GCP (enterprise)
- **Database:** RDS PostgreSQL db.r6g.xlarge with read replicas
- **Storage:** S3 with intelligent tiering
- **CDN:** CloudFront with edge caching
- **Realtime:** Self-hosted or enterprise Pusher
- **Caching:** Redis cluster
- **Search:** ElasticSearch for social search

**Monthly Cost Breakdown (AWS Path):**

| Item | Cost |
|------|------|
| RDS primary + 2 read replicas | ~$1,500 |
| RDS storage (2TB) | ~$250 |
| S3 storage (12TB) | ~$280 |
| CloudFront (25TB transfer) | ~$1,500 |
| ElastiCache Redis cluster | ~$400 |
| Lambda/API Gateway | ~$500 |
| Self-hosted realtime (EC2) | ~$400 |
| ElasticSearch | ~$300 |
| Monitoring/logging | ~$200 |
| **Total** | **$5,330** |

---

## 4. Platform Comparison

### 4.1 Supabase Path

**Advantages:**
- Fastest development velocity
- Built-in auth, storage, realtime
- PostgreSQL with Row Level Security
- Generous free tier for starting
- Edge Functions for serverless logic

**Limitations:**
- Fixed compute tiers (less granular scaling)
- Realtime connection limits require add-ons
- Limited multi-region support
- Team tier expensive for compliance features

**Pricing Tiers:**

| Plan | Monthly Cost | Key Limits |
|------|-------------|-----------|
| Free | $0 | 500MB DB, 1GB storage, 50K MAU, 200 realtime |
| Pro | $25 | 8GB DB, 100GB storage, 100K MAU, 500 realtime |
| Team | $599 | Pro + SSO, SOC2, 28-day logs |
| Enterprise | Custom | Dedicated, SLA, 24/7 support |

**Compute Add-ons:**

| Size | vCPU | RAM | Price | DB Connections |
|------|------|-----|-------|----------------|
| Micro | 1 | 1GB | $10 (included in Pro credit) | 60 direct |
| Small | 2 | 2GB | $50 | 90 direct |
| Medium | 4 | 4GB | $100 | 120 direct |
| Large | 8 | 16GB | $110 | 160 direct |
| XL | 16 | 32GB | $220 | 240 direct |

**When to Choose Supabase:**
- 0-50,000 users
- Rapid prototyping and MVP
- Small team without dedicated DevOps
- Budget-conscious with predictable growth

---

### 4.2 AWS Path

**Advantages:**
- Infinite scalability
- Granular resource control
- Global regions (20+ locations)
- Mature enterprise features
- Reserved instance discounts (up to 60%)

**Limitations:**
- Higher operational complexity
- No built-in BaaS features
- Requires more DevOps expertise
- Cold start latency for Lambda

**Equivalent Services:**

| Supabase | AWS Equivalent | Notes |
|----------|---------------|-------|
| PostgreSQL | RDS PostgreSQL | Managed, Multi-AZ |
| Auth | Cognito | More complex setup |
| Storage | S3 | Industry standard |
| Realtime | AppSync / API Gateway WebSocket | Requires architecture |
| Edge Functions | Lambda@Edge | Global execution |
| CDN | CloudFront | Excellent performance |

**AWS Cost Estimate by User Tier:**

| Users | Compute | Database | Storage | Network | Total |
|-------|---------|----------|---------|---------|-------|
| 1K | $20 | $25 | $5 | $5 | $55 |
| 10K | $80 | $100 | $30 | $40 | $250 |
| 50K | $300 | $400 | $100 | $200 | $1,000 |
| 100K | $500 | $600 | $200 | $400 | $1,700 |
| 500K | $1,500 | $2,000 | $500 | $2,000 | $6,000 |

**When to Choose AWS:**
- 50,000+ users expected
- Need multi-region deployment
- Require specific compliance (HIPAA, PCI)
- Have DevOps resources
- Need granular cost optimization

---

### 4.3 GCP Path

**Advantages:**
- Competitive pricing (often cheaper than AWS)
- Excellent BigQuery for analytics
- Strong Kubernetes support (GKE)
- Firebase integration options
- Sustained use discounts (automatic)

**Limitations:**
- Smaller service ecosystem than AWS
- Less mature some enterprise features
- Fewer regions than AWS

**Equivalent Services:**

| Supabase | GCP Equivalent | Notes |
|----------|---------------|-------|
| PostgreSQL | Cloud SQL | Managed PostgreSQL |
| Auth | Firebase Auth or Identity Platform | Firebase is simpler |
| Storage | Cloud Storage | Good CDN integration |
| Realtime | Firebase Realtime DB / Firestore | Native mobile support |
| Edge Functions | Cloud Functions | Good cold start times |
| CDN | Cloud CDN | Integrated with Storage |

**GCP Cost Estimate by User Tier:**

| Users | Compute | Database | Storage | Network | Total |
|-------|---------|----------|---------|---------|-------|
| 1K | $15 | $20 | $5 | $5 | $45 |
| 10K | $70 | $90 | $25 | $35 | $220 |
| 50K | $280 | $350 | $90 | $180 | $900 |
| 100K | $450 | $550 | $180 | $350 | $1,530 |
| 500K | $1,400 | $1,800 | $450 | $1,800 | $5,450 |

**When to Choose GCP:**
- Cost-sensitive at scale
- Heavy analytics requirements
- Already using Firebase
- Kubernetes-native architecture preference

---

### 4.4 Recommendation Matrix

| User Tier | Best Platform | Reason |
|-----------|--------------|--------|
| 10-100 | Supabase Free | Zero cost, fastest setup |
| 100-1,000 | Supabase Pro | Best value, simple scaling |
| 1,000-10,000 | Supabase Pro + Add-ons | Still cost-effective |
| 10,000-50,000 | Supabase Pro/Team | Monitor for migration trigger |
| 50,000-100,000 | **Migration Point**: Evaluate AWS vs Supabase Team | Cost and feature comparison |
| 100,000+ | AWS or GCP | Full control, better unit economics |

**Migration Trigger Checklist:**
- [ ] Monthly Supabase bill exceeds $800
- [ ] Hitting realtime connection limits frequently
- [ ] Need multi-region for latency
- [ ] Compliance requirements (HIPAA, SOC2 beyond Team)
- [ ] Need custom database configurations

---

## 5. Media Storage Strategy

### 5.1 Storage Categories

| Media Type | Typical Size | Frequency | Storage Class |
|------------|-------------|-----------|---------------|
| Avatars | 200KB-2MB | 1 per user | Hot |
| Post Images | 500KB-5MB | 2-5 per post | Hot |
| Workout Videos | 5MB-50MB | Occasional | Hot → Warm |
| Video Thumbnails | 50KB-200KB | 1 per video | Hot |
| PR Celebration Clips | 10MB-30MB | Rare | Warm |

### 5.2 Storage Architecture

```mermaid
graph LR
    subgraph "Upload Flow"
        App[Mobile App] --> Compress[Client Compression]
        Compress --> Upload[Upload API]
        Upload --> Storage[(Primary Storage)]
    end

    subgraph "Delivery Flow"
        Storage --> CDN[CDN Edge]
        CDN --> App2[Mobile App]
    end

    subgraph "Tiering"
        Storage --> Warm[Warm Storage 30d+]
        Warm --> Cold[Cold Storage 90d+]
    end
```

### 5.3 Video Transcoding Pipeline

For workout videos (15-60 seconds):

```mermaid
graph LR
    Upload[Raw Upload] --> Queue[Transcode Queue]
    Queue --> Transcode[FFmpeg Worker]
    Transcode --> Low[480p - 2MB]
    Transcode --> Med[720p - 5MB]
    Transcode --> High[1080p - 15MB]
    Low --> Storage[(Storage)]
    Med --> Storage
    High --> Storage
    Storage --> CDN[CDN]
```

**Transcoding Cost (AWS MediaConvert):**
- ~$0.015 per minute of video
- For 500K users with 1% uploading 30-sec videos daily:
  - 5,000 videos × 0.5 min × $0.015 = $37.50/day = ~$1,125/month

### 5.4 CDN Strategy

**Supabase (0-50K users):**
- Use Supabase Storage with built-in CDN
- Cached egress: $0.03/GB
- Uncached egress: $0.09/GB

**CloudFront (50K+ users):**
- First 10TB: $0.085/GB (US/Europe)
- Next 40TB: $0.080/GB
- Origin (S3): $0.023/GB storage

**Cost Comparison for 1TB Monthly Egress:**

| Platform | Cost |
|----------|------|
| Supabase (uncached) | $90 |
| Supabase (cached) | $30 |
| CloudFront | $85 |
| Cloud CDN (GCP) | $80 |

### 5.5 Storage Cost by Tier

| Users | Avatars | Images | Videos | Monthly Storage Cost |
|-------|---------|--------|--------|---------------------|
| 1K | 1GB | 5GB | 20GB | $0.60 |
| 10K | 10GB | 50GB | 200GB | $6.00 |
| 50K | 50GB | 250GB | 1TB | $30.00 |
| 100K | 100GB | 500GB | 2TB | $60.00 |
| 500K | 500GB | 2.5TB | 10TB | $300.00 |

---

## 6. Database Performance

### 6.1 Index Strategy

**Critical Indexes for GymRats:**

```sql
-- Workout queries (most frequent)
CREATE INDEX idx_workouts_user_date ON workouts(user_id, started_at DESC);
CREATE INDEX idx_workout_sets_workout ON workout_sets(workout_id);
CREATE INDEX idx_workout_sets_exercise ON workout_sets(exercise_id, user_id);

-- Social feed
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id, created_at DESC);
CREATE INDEX idx_friendships_user ON friendships(user_id, status);

-- Chat (realtime critical)
CREATE INDEX idx_chat_messages_thread ON chat_messages(thread_id, created_at DESC);
CREATE INDEX idx_chat_threads_participants ON chat_threads USING GIN(participant_ids);

-- Full-text search
CREATE INDEX idx_users_display_name_trgm ON users USING GIN(display_name gin_trgm_ops);
```

### 6.2 Connection Pooling Configuration

**Supavisor Settings (Recommended):**

| User Tier | Pool Size | Max Clients | Mode |
|-----------|-----------|-------------|------|
| 1K | 15 | 100 | Transaction |
| 10K | 30 | 300 | Transaction |
| 50K | 60 | 600 | Transaction |
| 100K | 100 | 1000 | Transaction |

**Connection String Format:**
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 6.3 Read Replica Strategy

**When to Add Read Replicas:**
- Database CPU consistently >70%
- Read/write ratio >10:1
- Analytics queries impacting app performance

**Supabase:** Contact enterprise for read replicas
**AWS RDS:** Add replicas via console (~$100-400/month each)
**GCP Cloud SQL:** Add replicas (~$80-350/month each)

**Query Routing:**
```typescript
// Route read-heavy queries to replica
const readClient = createClient(REPLICA_URL, ANON_KEY);
const writeClient = createClient(PRIMARY_URL, ANON_KEY);

// Use readClient for: feed, history, leaderboards
// Use writeClient for: workout logging, posts, mutations
```

### 6.4 Query Optimization Guidelines

**Hot Queries to Optimize:**

| Query | Frequency | Target Latency |
|-------|-----------|----------------|
| Get user's recent workouts | Very High | <50ms |
| Load social feed | High | <100ms |
| Check PR for exercise | High | <30ms |
| Search users by name | Medium | <200ms |
| Get chat messages | High | <50ms |

**Optimization Techniques:**
1. **Pagination:** Always use cursor-based pagination
2. **Selective columns:** Never `SELECT *`
3. **Batch queries:** Combine related queries
4. **Denormalization:** Cache computed values (total_sets, pr_count)

### 6.5 Caching Layer

**When to Add Redis:**
- 10,000+ users
- Repeated expensive queries
- Session/rate limit storage needed

**Cache Strategy:**

| Data | TTL | Invalidation |
|------|-----|--------------|
| User profiles | 5 min | On profile update |
| Leaderboards | 15 min | Scheduled refresh |
| Exercise PRs | 1 hour | On new PR |
| Feed posts | 1 min | On new post |

**Redis Sizing:**

| Users | Memory | Cost (ElastiCache) |
|-------|--------|-------------------|
| 10K | 1GB | ~$30/month |
| 50K | 4GB | ~$100/month |
| 100K | 8GB | ~$180/month |

---

## 7. Real-time and WebSocket Scaling

### 7.1 Supabase Realtime Limits

| Plan | Concurrent Connections | Messages/Month | Overage |
|------|----------------------|----------------|---------|
| Free | 200 | 2M | N/A |
| Pro | 500 | 5M | $10/1K connections, $2.50/1M messages |
| Team | 500 | 5M | Same overage rates |

### 7.2 Connection Estimation

**Concurrent Connection Formula:**
```
Peak Connections = DAU × Concurrent % × Features Using Realtime

Example (10K users):
- DAU: 3,000
- Concurrent: 10% = 300 users
- Features: Feed (100%), Chat (30%) = 1.3 multiplier
- Peak: 300 × 1.3 = 390 connections
```

### 7.3 Alternative Providers

**Pusher:**
- Startup: $49/month - 500 connections, 1M messages/day
- Pro: $99/month - 2,000 connections, 10M messages/day
- Business: $299/month - 10,000 connections, unlimited

**Ably:**
- Standard: $29/month base + usage
- Pro: $99/month base + usage
- Enterprise: Custom

**Self-Hosted (Socket.io on EC2):**
- t3.medium: ~$30/month - handles ~5,000 connections
- t3.large: ~$60/month - handles ~15,000 connections

### 7.4 Scaling Strategy

```mermaid
graph TB
    subgraph "0-10K Users"
        S1[Supabase Realtime]
    end

    subgraph "10K-50K Users"
        S2[Supabase + Connection Add-ons]
    end

    subgraph "50K-100K Users"
        S3[Pusher/Ably OR Self-hosted]
    end

    subgraph "100K+ Users"
        S4[Self-hosted Cluster]
        S4 --> N1[Node 1]
        S4 --> N2[Node 2]
        S4 --> N3[Node N]
        Redis[(Redis Pub/Sub)]
        N1 --> Redis
        N2 --> Redis
        N3 --> Redis
    end
```

### 7.5 Fallback Strategies

**Graceful Degradation:**
1. WebSocket unavailable → Long polling (30s intervals)
2. Long polling fails → Pull-to-refresh only
3. Display "Real-time updates paused" indicator

**Implementation:**
```typescript
const realtimeConfig = {
  primary: 'websocket',
  fallback: 'longpoll',
  pollInterval: 30000,
  maxRetries: 3,
  backoffMultiplier: 2,
};
```

---

## 8. Development and Staging Environments

### 8.1 Environment Architecture

```mermaid
graph TB
    subgraph "Local Development"
        DEV[Developer Machine]
        LOCAL_DB[(Local Supabase)]
        DEV --> LOCAL_DB
    end

    subgraph "Staging"
        STAGE_APP[Staging App]
        STAGE_DB[(Staging Supabase)]
        STAGE_APP --> STAGE_DB
    end

    subgraph "Production"
        PROD_APP[Production App]
        PROD_DB[(Production Supabase)]
        PROD_APP --> PROD_DB
    end

    DEV -->|PR Merge| STAGE_APP
    STAGE_APP -->|Release| PROD_APP
```

### 8.2 Supabase Project Setup

**Recommended Projects:**

| Environment | Supabase Project | Plan | Purpose |
|-------------|-----------------|------|---------|
| Local | supabase start (CLI) | Free | Development |
| Staging | gymrats-staging | Free | Integration testing |
| Production | gymrats-production | Pro+ | Live users |

### 8.3 Local Development Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Local URLs (default)
# API: http://localhost:54321
# Studio: http://localhost:54323
# DB: postgresql://postgres:postgres@localhost:54322/postgres
```

**Environment Variables (.env.local):**
```bash
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
```

### 8.4 Data Anonymization for Testing

**Staging Data Policy:**
- Never copy production user data to staging
- Use seed scripts with fake data
- Anonymize any exported data

**Seed Script Example:**
```typescript
// scripts/seedStaging.ts
const fakeUsers = Array.from({ length: 100 }, (_, i) => ({
  id: `test-user-${i}`,
  email: `testuser${i}@example.com`,
  display_name: faker.person.firstName(),
}));
```

### 8.5 CI/CD Pipeline

```mermaid
graph LR
    PR[Pull Request] --> Lint[ESLint/TypeScript]
    Lint --> Test[Jest Tests]
    Test --> Build[EAS Build]
    Build --> Deploy[Deploy to Staging]
    Deploy --> E2E[E2E Tests]
    E2E --> Review[Manual Review]
    Review --> Prod[Production Release]
```

**EAS Configuration:**
```json
{
  "build": {
    "development": {
      "env": { "ENVIRONMENT": "development" }
    },
    "staging": {
      "env": { "ENVIRONMENT": "staging" }
    },
    "production": {
      "env": { "ENVIRONMENT": "production" }
    }
  }
}
```

---

## 9. Cost Projection Tables

### 9.1 Total Monthly Cost by Platform

| Users | Supabase | AWS | GCP | Best Value |
|-------|----------|-----|-----|------------|
| 10 | $0 | $30 | $25 | Supabase |
| 100 | $25 | $55 | $45 | Supabase |
| 1,000 | $70 | $100 | $85 | Supabase |
| 10,000 | $200 | $350 | $300 | Supabase |
| 50,000 | $920 | $1,200 | $1,050 | Supabase* |
| 100,000 | $1,500 | $1,700 | $1,530 | GCP |
| 500,000 | $4,000+ | $6,000 | $5,450 | GCP |

*Supabase best value up to ~50K if features sufficient

### 9.2 Compute Costs

| Users | Supabase | AWS (EC2/Lambda) | GCP (Cloud Run) |
|-------|----------|------------------|-----------------|
| 1,000 | $40 | $40 | $35 |
| 10,000 | $90 | $120 | $100 |
| 50,000 | $200 | $400 | $350 |
| 100,000 | $400 | $600 | $500 |
| 500,000 | $800 | $1,800 | $1,500 |

### 9.3 Database Costs

| Users | Supabase | AWS RDS | GCP Cloud SQL |
|-------|----------|---------|---------------|
| 1,000 | Included | $50 | $40 |
| 10,000 | Included | $150 | $130 |
| 50,000 | Included* | $500 | $420 |
| 100,000 | ~$300 | $800 | $680 |
| 500,000 | ~$800 | $2,500 | $2,100 |

*Supabase includes database in base price; large scale requires compute add-ons

### 9.4 Storage Costs

| Users | Est. Storage | Supabase | AWS S3 | GCP Storage |
|-------|-------------|----------|--------|-------------|
| 1,000 | 25GB | Included | $0.60 | $0.50 |
| 10,000 | 250GB | Included | $6 | $5 |
| 50,000 | 1.25TB | ~$30 | $30 | $25 |
| 100,000 | 2.5TB | ~$60 | $60 | $50 |
| 500,000 | 12.5TB | ~$300 | $290 | $250 |

### 9.5 Bandwidth/Egress Costs

| Users | Est. Monthly Egress | Supabase | CloudFront | Cloud CDN |
|-------|-------------------|----------|------------|-----------|
| 1,000 | 100GB | Included | $9 | $8 |
| 10,000 | 500GB | ~$25 | $43 | $40 |
| 50,000 | 2.5TB | ~$200 | $200 | $180 |
| 100,000 | 5TB | ~$400 | $400 | $360 |
| 500,000 | 25TB | ~$2,000 | $1,900 | $1,700 |

### 9.6 Cost Per User Analysis

| Users | Total Cost | Cost/User/Month | Cost/User/Year |
|-------|------------|-----------------|----------------|
| 100 | $25 | $0.25 | $3.00 |
| 1,000 | $70 | $0.07 | $0.84 |
| 10,000 | $200 | $0.02 | $0.24 |
| 50,000 | $920 | $0.018 | $0.22 |
| 100,000 | $1,530 | $0.015 | $0.18 |
| 500,000 | $5,450 | $0.011 | $0.13 |

**Key Insight:** Cost per user decreases significantly at scale, making premium features sustainable with even small subscription revenue.

---

## 10. Migration Playbook

### 10.1 Migration Decision Framework

**Evaluate Migration When:**
- [ ] Monthly Supabase bill consistently >$800
- [ ] Realtime connections hitting 80% of limit daily
- [ ] Database size approaching 8GB
- [ ] Need features not available (multi-region, HIPAA)
- [ ] Latency requirements for specific regions

### 10.2 Supabase Pro to Team Migration

**Trigger:** Need SSO, SOC2 compliance, longer log retention

**Steps:**
1. Review Team tier features vs current needs
2. Contact Supabase sales for pricing discussion
3. Plan migration window (usually instant upgrade)
4. Update billing information
5. Verify new features activated

**Downtime:** Zero (instant upgrade)

### 10.3 Supabase to AWS Migration

**Pre-Migration Checklist:**
- [ ] Document all Supabase features in use
- [ ] Map to AWS equivalents (see Section 4.2)
- [ ] Set up AWS account with proper IAM
- [ ] Create VPC and security groups
- [ ] Provision RDS PostgreSQL (same version)
- [ ] Set up S3 buckets with proper policies
- [ ] Configure CloudFront distributions
- [ ] Set up Cognito or alternative auth
- [ ] Build realtime replacement (Pusher/self-hosted)
- [ ] Create new environment variables

**Migration Steps:**

```mermaid
graph TB
    subgraph "Phase 1: Parallel Setup (Week 1-2)"
        A1[Provision AWS Infrastructure]
        A2[Deploy API layer]
        A3[Configure monitoring]
    end

    subgraph "Phase 2: Data Migration (Week 2-3)"
        B1[Export Supabase data]
        B2[Transform schema if needed]
        B3[Import to RDS]
        B4[Migrate storage to S3]
    end

    subgraph "Phase 3: Testing (Week 3-4)"
        C1[Integration tests]
        C2[Load testing]
        C3[Staging deployment]
    end

    subgraph "Phase 4: Cutover (Week 4)"
        D1[Enable maintenance mode]
        D2[Final data sync]
        D3[DNS switch]
        D4[Monitor closely]
    end

    A1 --> B1
    B3 --> C1
    C3 --> D1
```

**Data Export Script:**
```bash
# Export from Supabase
pg_dump -h db.[ref].supabase.co -U postgres -d postgres > backup.sql

# Import to RDS
psql -h mydb.xxx.rds.amazonaws.com -U postgres -d gymrats < backup.sql
```

**Rollback Plan:**
1. Keep Supabase project active for 30 days post-migration
2. Maintain DNS ability to switch back
3. Keep data sync running initially (dual-write)

**Expected Downtime:** 15-30 minutes (with proper planning)

### 10.4 Storage Migration

**S3 Migration from Supabase Storage:**

```bash
# Install Supabase CLI and AWS CLI
# List all buckets
supabase storage ls

# For each bucket, sync to S3
aws s3 sync ./supabase-export/avatars s3://gymrats-avatars/
aws s3 sync ./supabase-export/posts s3://gymrats-posts/
```

**Update App Code:**
```typescript
// Before (Supabase)
const avatarUrl = supabase.storage
  .from('avatars')
  .getPublicUrl(path);

// After (S3 + CloudFront)
const avatarUrl = `https://d1xxx.cloudfront.net/avatars/${path}`;
```

---

## 11. Monitoring and Alerting

### 11.1 Key Metrics to Track

**Database Metrics:**
| Metric | Warning Threshold | Critical Threshold |
|--------|------------------|-------------------|
| CPU Utilization | >70% | >90% |
| Memory Usage | >80% | >95% |
| Storage Used | >70% | >90% |
| Connection Count | >80% of max | >95% of max |
| Query Latency (p95) | >200ms | >500ms |

**Application Metrics:**
| Metric | Warning | Critical |
|--------|---------|----------|
| API Latency (p95) | >300ms | >1000ms |
| Error Rate | >1% | >5% |
| Sync Failures | >5% | >15% |
| Realtime Disconnections | >10/min | >50/min |

**Business Metrics:**
| Metric | Track For |
|--------|-----------|
| DAU/MAU | User engagement |
| Workouts/Day | Feature adoption |
| Sync Success Rate | App health |
| Chat Messages/Day | Social engagement |

### 11.2 Recommended Monitoring Tools

**Supabase Phase (0-50K users):**
- Supabase Dashboard (built-in)
- Sentry (error tracking) - Free tier
- LogRocket or similar (session replay) - Optional

**AWS Phase (50K+ users):**
- CloudWatch (AWS native)
- Datadog or New Relic (APM)
- PagerDuty (alerting)

### 11.3 Alert Configuration

**PagerDuty/Opsgenie Rules:**

```yaml
# Example alert rules
alerts:
  - name: High Database CPU
    condition: cpu > 90% for 5 minutes
    severity: critical
    notify: on-call

  - name: Elevated Error Rate
    condition: error_rate > 5% for 2 minutes
    severity: critical
    notify: on-call

  - name: Storage Warning
    condition: storage_used > 70%
    severity: warning
    notify: slack-infra
```

### 11.4 Dashboard Template

**Essential Dashboard Panels:**
1. Active Users (real-time)
2. API Request Rate
3. API Latency (p50, p95, p99)
4. Error Rate by Endpoint
5. Database Connections
6. Storage/Egress Usage
7. Sync Success Rate
8. Realtime Connection Count

---

## 12. Security Considerations

### 12.1 Authentication Architecture

```mermaid
graph TB
    subgraph "Client"
        App[Mobile App]
        Token[JWT Token Storage]
    end

    subgraph "Auth Layer"
        Auth[Supabase Auth / Cognito]
        OAuth[OAuth Providers]
    end

    subgraph "API Layer"
        API[API Gateway]
        RLS[Row Level Security]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
    end

    App --> Auth
    OAuth --> Auth
    Auth --> Token
    Token --> API
    API --> RLS
    RLS --> DB
```

**Current Auth Methods:**
- Email/password
- Google OAuth
- Apple Sign-In

### 12.2 API Security

**Rate Limiting:**

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Auth endpoints | 5 req | 1 minute |
| Read endpoints | 100 req | 1 minute |
| Write endpoints | 30 req | 1 minute |
| File uploads | 10 req | 1 minute |

**Implementation (Supabase Edge Function):**
```typescript
const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 100,
});
```

**Input Validation:**
- All inputs validated via Zod schemas
- SQL injection prevented via parameterized queries
- XSS prevented via input sanitization

### 12.3 Data Encryption

**In Transit:**
- All connections use TLS 1.3
- Certificate pinning in mobile app (optional)

**At Rest:**
- Supabase: AES-256 encryption (automatic)
- AWS RDS: AES-256 with KMS
- S3: Server-side encryption (SSE-S3 or SSE-KMS)

### 12.4 Access Control

**Row Level Security Policies:**
```sql
-- Users can only see their own data
CREATE POLICY "Users see own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can see friends' posts
CREATE POLICY "Users see friends posts"
  ON posts FOR SELECT
  USING (
    author_id = auth.uid() OR
    author_id IN (
      SELECT friend_id FROM friendships
      WHERE user_id = auth.uid() AND status = 'accepted'
    )
  );
```

### 12.5 Backup Strategy

**Supabase (Automatic):**
- Pro: Daily backups, 7-day retention
- Team: Daily backups, 14-day retention
- Point-in-time recovery (PITR) available

**AWS RDS:**
- Automated backups: Enable with 7-30 day retention
- Manual snapshots: Before major changes
- Cross-region replication: For disaster recovery

**Backup Testing:**
- Monthly restore test to staging
- Verify data integrity after restore
- Document recovery time (RTO target: <1 hour)

### 12.6 Audit Logging

**What to Log:**
- Authentication events (login, logout, password changes)
- Permission changes
- Data exports
- Admin actions
- Failed access attempts

**Retention:**
- Security logs: 90 days minimum
- Access logs: 30 days
- Application logs: 14 days

---

## Appendix A: Quick Reference

### Cost Calculator Formula

```
Monthly Cost = Base Plan + Compute + Storage Overage + Egress Overage + Realtime

Where:
- Base Plan: $0 (Free) / $25 (Pro) / $599 (Team)
- Compute: $10-$220/month based on tier
- Storage Overage: $0.021/GB over quota
- Egress Overage: $0.09/GB (uncached) / $0.03/GB (cached)
- Realtime: $10/1000 peak connections over quota
```

### Capacity Planning Cheat Sheet

| Metric | Per 1K Users | Example (10K) |
|--------|-------------|---------------|
| DAU | 200-400 | 2,000-4,000 |
| Concurrent | 30-60 | 300-600 |
| DB Storage | 50MB | 500MB |
| File Storage | 25GB | 250GB |
| Monthly Egress | 50GB | 500GB |
| DB Reads/Day | 50K | 500K |
| DB Writes/Day | 5K | 50K |

### Emergency Contacts

| Situation | Contact | Response Time |
|-----------|---------|---------------|
| Supabase Outage | status.supabase.com | Check status |
| Database Emergency | Pro: Email support | 24 hours |
| Security Incident | security@supabase.com | ASAP |
| Billing Issues | Dashboard support | 48 hours |

---

## Appendix B: References

### Pricing Sources (2025-2026)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Compute Docs](https://supabase.com/docs/guides/platform/compute-and-disk)
- [Supabase Realtime Pricing](https://supabase.com/docs/guides/realtime/pricing)
- [AWS RDS Pricing](https://aws.amazon.com/rds/pricing/)
- [AWS CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
- [GCP Cloud SQL Pricing](https://cloud.google.com/sql/pricing)

### Architecture References
- [Supabase Architecture Docs](https://supabase.com/docs/guides/getting-started/architecture)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

*Document Version: 1.0*
*Last Updated: 2026-02-05*
*Next Review: 2026-05-05*
