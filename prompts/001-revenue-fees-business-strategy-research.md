<research_objective>
Create a comprehensive financial and business operations document for GymRats, a React Native fitness app using RevenueCat for subscription management.

This research will serve as the **master reference document** for:
- Understanding exactly how money flows from users to your bank account
- All fees, commissions, and costs at each step
- Tax obligations and considerations
- Revenue projections at scale milestones
- Business infrastructure requirements as the app grows

Thoroughly explore all aspects of mobile app monetization, payment processing, and business scaling requirements.
</research_objective>

<scope>
<focus_areas>
1. **RevenueCat Integration & Payment Flow**
   - How RevenueCat works with App Store Connect and Google Play Console
   - Where bank account/payout information is configured (hint: it's in the app stores, not RevenueCat)
   - RevenueCat's role vs the app stores' role
   - RevenueCat pricing tiers and when paid plans become necessary

2. **App Store Fees (Apple & Google)**
   - Standard commission rates (30% vs 15% small business program)
   - How to qualify for reduced rates
   - Payment schedules and holds
   - Chargeback handling
   - Regional variations if any

3. **Tax Implications**
   - Sales tax / VAT handling (who collects, who remits)
   - Income tax considerations for app revenue
   - 1099-K thresholds and reporting
   - International tax considerations
   - What the app stores handle vs what you're responsible for

4. **Revenue Projections**
   Create detailed projections for these user milestones:
   - 100 paying subscribers
   - 1,000 paying subscribers
   - 10,000 paying subscribers
   - 100,000 paying subscribers
   - 500,000 paying subscribers

   For each tier, calculate:
   - Gross revenue (assume $9.99/month subscription as baseline)
   - App store fees (show both 30% and 15% scenarios)
   - RevenueCat fees (if applicable at that tier)
   - Payment processing that's already included
   - Estimated tax obligations
   - **Net revenue to founder**

5. **Business Infrastructure Scaling**
   At each revenue milestone, document requirements for:

   **Legal**
   - When to form LLC vs operate as sole proprietor
   - When to consider S-Corp election
   - When to hire a lawyer (and what kind)
   - Terms of Service / Privacy Policy requirements
   - GDPR, CCPA compliance

   **Banking**
   - When personal accounts become inadequate
   - Business checking account requirements
   - When to consider more sophisticated treasury management
   - Payment processor relationships

   **Security & Compliance**
   - PCI compliance (what RevenueCat/stores handle vs you)
   - Data protection requirements
   - When to get cyber insurance
   - When to hire security consultants

   **Accounting**
   - When to hire a bookkeeper
   - When to hire a CPA
   - Accounting software needs
   - Financial reporting requirements

   **Operations**
   - Customer support scaling
   - Refund handling
   - Dispute resolution
</focus_areas>

<sources_to_use>
- Apple App Store Connect documentation
- Google Play Console documentation
- RevenueCat official documentation and pricing page
- IRS guidelines for app/digital income
- Small Business Administration resources
- Current 2024/2025 fee structures and thresholds
</sources_to_use>

<out_of_scope>
- Specific legal advice (document should note "consult a lawyer" where appropriate)
- Specific tax advice (document should note "consult a CPA" where appropriate)
- Marketing and user acquisition costs (separate analysis)
- Development costs
</out_of_scope>
</scope>

<deliverables>

<primary_document>
Create a comprehensive markdown document saved to: `./docs/business/REVENUE-AND-FEES-MASTER.md`

Structure the document as follows:

```markdown
# GymRats Revenue & Business Operations Master Document

## Executive Summary
[High-level overview of the payment flow and key numbers]

## Part 1: Payment Flow Architecture
### How Money Moves: User → App Store → Your Bank
### RevenueCat's Role (Tracking, Not Payment Processing)
### Where to Configure Bank/Payout Information

## Part 2: Fee Structure
### Apple App Store Fees
### Google Play Store Fees
### Small Business Program Qualification
### RevenueCat Fees by Tier
### Summary: Total Fee Stack

## Part 3: Tax Considerations
### What the App Stores Handle
### Your Tax Obligations
### Quarterly Estimated Payments
### International Considerations

## Part 4: Revenue Projections

### Assumptions
- Subscription price: $9.99/month
- Mix: 70% monthly, 30% annual ($79.99/year)
- Churn rate estimates by tier

### Projection Tables
[Table for each milestone: 100, 1K, 10K, 100K, 500K subscribers]

| Metric | Amount |
|--------|--------|
| Gross Monthly Revenue | $X |
| App Store Fee (15%) | $X |
| App Store Fee (30%) | $X |
| RevenueCat Fee | $X |
| Estimated Taxes | $X |
| **Net to Founder** | $X |

## Part 5: Business Infrastructure Roadmap

### Stage 1: Pre-Launch to 1,000 Users
- Legal: [requirements]
- Banking: [requirements]
- Accounting: [requirements]
- Security: [requirements]

### Stage 2: 1,000 to 10,000 Users
[Same structure]

### Stage 3: 10,000 to 100,000 Users
[Same structure]

### Stage 4: 100,000+ Users
[Same structure]

## Part 6: Action Items & Timeline
### Immediate (Before Launch)
### At $1K MRR
### At $10K MRR
### At $100K MRR

## Appendix
### A: RevenueCat Setup Checklist
### B: App Store Connect Payout Setup
### C: Google Play Console Payout Setup
### D: Useful Links and Resources
```
</primary_document>

<secondary_deliverable>
Create a quick-reference cheat sheet: `./docs/business/FEES-CHEAT-SHEET.md`

Single-page summary with:
- Fee percentages at a glance
- Revenue calculator formula
- Key thresholds to remember
- "When to upgrade" triggers
</secondary_deliverable>

</deliverables>

<research_instructions>
1. **Use web search** to find current (2024-2025) fee structures - these change periodically
2. **Verify RevenueCat pricing** at revenuecat.com/pricing
3. **Check Apple's Small Business Program** current requirements
4. **Check Google's service fee** current requirements
5. **Cross-reference** multiple sources for accuracy
6. **Note any pending changes** or announced updates to fee structures
7. **Include specific links** to official documentation where users can verify/update information
</research_instructions>

<evaluation_criteria>
The research is complete when:
- [ ] All five user milestone projections are calculated with real numbers
- [ ] Fee structures are verified against current official sources
- [ ] Payment flow is clearly explained (where exactly to set up banking)
- [ ] Tax obligations are outlined (with appropriate "consult professional" caveats)
- [ ] Business infrastructure roadmap has concrete recommendations per stage
- [ ] All links to official documentation are included
- [ ] Cheat sheet provides quick-reference value
</evaluation_criteria>

<verification>
Before completing:
1. Verify all percentage fees cited against official sources
2. Confirm RevenueCat's current pricing tiers
3. Check that Apple's Small Business Program threshold is current ($1M)
4. Validate projection math is correct
5. Ensure all "when to" recommendations are tied to specific revenue thresholds
6. Confirm document is saved to correct path
</verification>

<context>
This is for the GymRats fitness app project. The app uses:
- RevenueCat for subscription management (already installed: react-native-purchases)
- Likely subscription model with premium features
- Target platforms: iOS and Android

Read the project's CLAUDE.md for any relevant context about the app's premium features and pricing strategy.
</context>
