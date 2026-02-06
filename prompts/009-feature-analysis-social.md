<objective>
Perform a comprehensive code analysis of SOCIAL FEED & SHARING - the community layer.

This is Part 7 of a systematic feature-by-feature codebase analysis. Focus on:
- Social feed display
- Post creation and reactions
- Friend system
- Workout sharing
- Supabase integration

WHY: Social features drive engagement and retention. They need to feel fast and reliable.
</objective>

<context>
Read all previous analyses for integration context.

Social features use Supabase for:
- Post storage and retrieval
- Real-time updates (potentially)
- Friend relationships
</context>

<scope>
<files_to_analyze>
Feed System:
- `app/(tabs)/feed.tsx` - Feed screen
- Social feed components
- Post/reaction handling

Sharing:
- Workout share functionality
- Image generation for shares
- `react-native-view-shot` usage

Supabase Integration:
- `src/lib/supabase/` - Client and types
- Social-related queries
- Real-time subscriptions
</files_to_analyze>

<analysis_checklist>
1. **Feed Performance**
   - List virtualization
   - Image loading
   - Pagination

2. **Real-time Updates**
   - Subscription management
   - Optimistic updates
   - Conflict resolution

3. **Sharing Flow**
   - Image generation quality
   - Share sheet integration
   - Error handling

4. **Supabase Patterns**
   - Query efficiency
   - Error handling
   - Type safety
</analysis_checklist>
</scope>

<context7_queries>
1. Query: "Supabase realtime subscriptions React"
   Library: /supabase/supabase-js

2. Query: "React Native FlatList performance optimization"
   Library: /facebook/react-native
</context7_queries>

<output>
<analysis_report>
Create: `./docs/analyses/feature-analysis-social.md`

Include:
- Feed architecture
- Supabase integration status
- Sharing flow assessment
- Performance metrics
</analysis_report>

<code_changes>
- Optimize feed performance
- Improve Supabase queries
- Fix sharing issues
- Add error handling
</code_changes>
</output>

<verification>
1. Feed loads quickly
2. Reactions work reliably
3. Sharing produces quality images
4. No Supabase errors
</verification>

<success_criteria>
- Social features analyzed
- Performance optimized
- Supabase integration verified
- Sharing flow reliable
</success_criteria>

<next_prompt>
After completing, the next prompt will analyze: Authentication & Security
</next_prompt>
