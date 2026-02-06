<objective>
Create a comprehensive server infrastructure and scaling documentation for the GymRats fitness app that covers hosting strategy, capacity planning, cost projections, and scaling roadmap from 10 users to 500,000 users.

This documentation is critical for:
1. Making informed infrastructure decisions as the app grows
2. Understanding costs at each growth stage
3. Planning migrations and scaling events proactively
4. Ensuring the app remains fast and responsive regardless of user load
5. Providing a reference for development and operations decisions
</objective>

<context>
GymRats is a React Native fitness app with:
- Real-time workout logging with PR detection
- Social feed with posts, reactions, comments
- Friend system with chat/messaging
- Avatar system with user profile images
- Short workout videos (15-60 seconds for form checks, progress clips)
- Gamification (XP, levels, streaks, achievements)
- Offline-first architecture with sync when online

Current stack:
- Frontend: React Native + Expo
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime)
- State: Zustand with AsyncStorage persistence
- Sync: Custom sync orchestrator with offline queue

Read these files for current implementation context:
@docs/features/backend-sync/feature-backend.md
@src/lib/supabase/client.ts
@src/lib/sync/SyncOrchestrator.ts

The app needs to handle:
- Concurrent workout sessions (users logging sets in real-time)
- Social feed with media (images, short videos)
- Real-time chat and notifications
- Background sync and data consistency
</context>

<requirements>
Create a document at `./docs/infrastructure/SERVER-INFRASTRUCTURE.md` that thoroughly covers:

## 1. Current Architecture Overview
- Document current Supabase setup and capabilities
- Identify current bottlenecks and limitations
- Map data flows for key operations (workout logging, social feed, chat)

## 2. Scaling Strategy by User Tier
Create detailed breakdowns for each tier with the formula: 10, 100, 1K, 10K, 50K, 100K, 500K users

For EACH tier, document:
- Expected concurrent users (assume 5-10% daily active, 1-2% concurrent during peak)
- Database load (reads/writes per second)
- Storage requirements (avatars, images, videos)
- Bandwidth estimates
- Recommended infrastructure configuration
- Estimated monthly costs (itemized)

## 3. Platform Comparison
Compare Supabase vs AWS vs GCP for GymRats specifically:

### Supabase Path
- Free tier limits and when you'll hit them
- Pro tier ($25/mo) capacity
- Team tier capacity
- Enterprise/custom pricing triggers
- Supabase-specific features (Realtime, Edge Functions, Storage)

### AWS Path
- Equivalent services: RDS PostgreSQL, S3, CloudFront, Lambda, API Gateway
- Cost breakdown at each user tier
- Migration complexity from Supabase
- AWS-specific advantages (global regions, enterprise features)

### GCP Path
- Equivalent services: Cloud SQL, Cloud Storage, Cloud CDN, Cloud Functions
- Cost breakdown at each user tier
- Migration complexity from Supabase
- GCP-specific advantages

### Recommendation Matrix
Create a decision matrix: "At X users, use Y platform because Z"

## 4. Media Storage Strategy
Document storage architecture for:
- Avatar images (typical: 200KB-2MB each)
- Post images (typical: 500KB-5MB each)
- Short videos (15-60 sec, typical: 5MB-50MB each)
- Video thumbnails

Include:
- CDN strategy for fast global delivery
- Video transcoding pipeline (if needed)
- Storage tiering (hot/warm/cold)
- Backup and redundancy
- Cost per GB at each tier

## 5. Database Performance
- Index strategy for common queries
- Connection pooling configuration
- Read replica strategy (when needed)
- Query optimization guidelines
- Caching layer recommendations (Redis, edge caching)

## 6. Real-time and WebSocket Scaling
- Supabase Realtime capacity limits
- Alternative: Pusher, Ably, or self-hosted
- Connection limits per user tier
- Fallback strategies (polling, graceful degradation)

## 7. Development and Staging Environments
- Secure development access
- Staging environment configuration
- Data anonymization for testing
- CI/CD pipeline considerations
- Local development setup

## 8. Cost Projection Tables
Create clear tables showing:

| Users | Supabase | AWS | GCP | Best Value |
|-------|----------|-----|-----|------------|
| 10    | $X       | $Y  | $Z  | Platform   |
| 100   | ...      | ... | ... | ...        |
| 1K    | ...      | ... | ... | ...        |
| 10K   | ...      | ... | ... | ...        |
| 50K   | ...      | ... | ... | ...        |
| 100K  | ...      | ... | ... | ...        |
| 500K  | ...      | ... | ... | ...        |

Include separate tables for:
- Compute costs
- Database costs
- Storage costs
- Bandwidth costs
- Total monthly cost

## 9. Migration Playbook
For each potential migration point:
- Triggers (what metrics indicate migration is needed)
- Pre-migration checklist
- Migration steps
- Rollback plan
- Expected downtime (target: zero)

## 10. Monitoring and Alerting
- Key metrics to track
- Alert thresholds
- Recommended monitoring tools
- Performance dashboards

## 11. Security Considerations
- Authentication architecture
- API security (rate limiting, validation)
- Data encryption (at rest, in transit)
- Access control and audit logging
- Backup strategy and disaster recovery basics
</requirements>

<implementation>
Research approach:
1. Use WebSearch to find current Supabase pricing and limits (2025-2026)
2. Use WebSearch to find AWS and GCP equivalent service pricing
3. Use WebSearch for industry benchmarks on fitness/social app infrastructure

Document structure:
- Use clear headers and subheaders
- Include architecture diagrams in Mermaid syntax
- Use tables for all cost comparisons
- Include code snippets for configuration examples
- Add "Key Takeaways" boxes for each section

Writing style:
- Technical but accessible
- Actionable recommendations at each tier
- Clear cost/benefit tradeoffs
- No fluff - every section should be useful

DO NOT:
- Make up pricing numbers - research current 2025-2026 prices
- Over-engineer for 500K users when at 10 users
- Recommend migrations without clear triggers
- Include security compliance (GDPR, SOC2) - keep to basic security
</implementation>

<output>
Create the file: `./docs/infrastructure/SERVER-INFRASTRUCTURE.md`

The document should be:
- 3000-5000 words
- Well-organized with table of contents
- Include at least 3 architecture diagrams (Mermaid)
- Include at least 5 cost comparison tables
- Have clear, numbered recommendations

Also update `./docs/README.md` to add a link to this new infrastructure documentation under an "Infrastructure" section.
</output>

<verification>
Before completing, verify:
1. All cost tables have realistic, researched numbers (not placeholders)
2. Each user tier has specific, actionable recommendations
3. Migration triggers are clear and measurable
4. Mermaid diagrams render correctly (valid syntax)
5. Document links work from docs/README.md
6. No contradictions between sections
</verification>

<success_criteria>
- Document provides clear answer to "what should I do at X users?"
- Cost projections are believable and well-sourced
- A developer could use this to make infrastructure decisions
- Migration paths are clear with specific steps
- Platform comparison is fair and based on GymRats-specific needs
</success_criteria>
