<objective>
Perform a comprehensive code analysis of AUTHENTICATION & SECURITY - the trust layer.

This is Part 8 of a systematic feature-by-feature codebase analysis. Focus on:
- Supabase Auth integration
- OAuth providers (Google, Apple)
- Session management
- Secure storage
- API key handling

WHY: Security issues can destroy user trust. Auth must be bulletproof.
</objective>

<context>
Read all previous analyses for integration context.

GymRats uses Supabase Auth with:
- Email/password
- Google OAuth
- Apple Sign-In
</context>

<scope>
<files_to_analyze>
Auth System:
- `src/lib/auth/` - OAuth implementations
- `src/lib/stores/authStore.ts` - Auth state
- `app/auth/` - Auth screens
- `src/lib/supabase/` - Supabase client

Security:
- Environment variable handling
- Secure storage usage
- Token management
</files_to_analyze>

<analysis_checklist>
1. **Auth Flow**
   - Login/logout reliability
   - Session persistence
   - Token refresh
   - Error handling

2. **OAuth**
   - Provider configuration
   - Callback handling
   - Account linking

3. **Security**
   - No secrets in code
   - Secure storage usage
   - XSS/injection prevention

4. **Session Management**
   - Expiry handling
   - Multi-device support
   - Logout cleanup
</analysis_checklist>
</scope>

<context7_queries>
1. Query: "Supabase auth React Native session management"
   Library: /supabase/supabase-js

2. Query: "expo-auth-session OAuth best practices"
   Library: /expo/expo
</context7_queries>

<output>
<analysis_report>
Create: `./docs/analyses/feature-analysis-auth.md`

Include:
- Auth flow diagram
- Security assessment
- OAuth status per provider
- Vulnerability scan results
</analysis_report>

<code_changes>
- Fix any security issues (CRITICAL)
- Improve error handling
- Standardize auth patterns
- Add session refresh
</code_changes>
</output>

<verification>
1. Login/logout works reliably
2. OAuth providers functional
3. No security vulnerabilities
4. Sessions persist correctly
</verification>

<success_criteria>
- Auth fully secure
- All providers working
- Sessions managed correctly
- No vulnerabilities
</success_criteria>

<next_prompt>
After completing, the next prompt will analyze: Routines & Plans
</next_prompt>
