# CF1 Platform - Development Guide

CF1 is an enterprise-grade blockchain platform for Real-World Asset (RWA) tokenization, featuring launchpad, governance, marketplace, and compliance modules. Built with quality over speed, targeting enterprise adoption with U.S. Reg CF compliance.

## Core Mission & Philosophy

**Mission**: Create a regulated RWA tokenization ecosystem with institutional-grade UX that abstracts blockchain complexity while maintaining DeFi benefits.

**User Experience**: "TradFi Feel, DeFi Engine"
- Clean, professional UI resembling institutional investment platforms
- Abstracted wallet interactions through CF1 UI only
- Frictionless onboarding - wallet connection only required for first investment
- No direct on-chain transfers outside platform rules

## Technical Architecture

**Current Tech Stack**:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: CosmWasm smart contracts (Rust) on Cosmos SDK
- Future: CosmJS for blockchain integration

**Development Plan**:
1. Complete UI layer with all pages and user flows
2. Build backend feature by feature
3. Connect backend to UI feature by feature
4. Deploy to Cosmos testnet

## Core Modules & Rules

**Modular Design**: Launchpad, Governance, Marketplace, Compliance

**Asset-Level Governance**: Each tokenized RWA has independent governance - no platform-wide DAO

**Token Lifecycle (Non-Negotiable)**:
- Tokens NOT minted until funding goal met
- 12-month regulatory lock-up period after launch
- CW20 tokens (not NFTs)
- Escrow system with full refunds if funding fails

**Launchpad Flow**:
- Creator-defined terms: valuation, price, supply, deadline (7-120 days)
- Funds held in escrow until goal met

**Voting Mechanism**:
- Share-weighted voting with locked/held requirement
- Snapshot taken at proposal submission
- Simple Yes/No MVP system

## Current Status

**✅ Completed UI Enhancements**:
- Core UI Pages: Dashboard, Marketplace, Portfolio, Launchpad, Governance
- Navigation system with header and sidebar
- Component architecture with consistent patterns
- Dashboard: Changed to "Top Performers" showing non-held assets, graph titled "Total RWA Tokenized on CF1"
- Portfolio: Added performance graph matching other pages
- Launchpad: Updated with 6 cards showing relevant category icons instead of letters
- Governance: Enhanced with bigger/better icons (w-5 h-5 for proposals, w-8 h-8 for stats)
- Header: Quick Actions dropdown implemented (positioned left of Connect Wallet)
- Profile & Settings system with navigation dropdown
- Multi-step proposal creation wizard with form validation

**✅ Dark Mode Implementation (Latest Session)**:
- Full dark mode toggle in profile dropdown with localStorage persistence
- Updated Tailwind config with `darkMode: 'class'` setting
- Comprehensive dark mode styling across all components:
  - Layout, Header, Sidebar with proper dark backgrounds
  - All form inputs, search bars, dropdowns with dark styling
  - Chart backgrounds and grid lines adapted for dark theme
  - Table headers and content with proper contrast
  - Status badges and icons with dark mode variants
- Custom CSS classes in index.css for semantic theming (card, text-secondary-*, bg-primary-*, etc.)
- Fixed specific issues: marketplace filter overflow, portfolio grid headers, dashboard quick actions

**🔄 Immediate Next Priority (Option A)**:
- Launchpad proposal detail pages (/launchpad/proposal/:id) - FULL IMPLEMENTATION
- Investment modal connected to proposal pages
- Complete user journey: discovery → details → investment initiation

**📋 Pending Detail Work**:
1. Marketplace asset detail pages (/marketplace/asset/:id)
2. Authentication & wallet connection flow
3. User profile & settings pages

## Governance v1.0 Roadmap (~2000+ hours)

**Agent G1 (Phases 1-2)**: Core Engine & Execution
- Foundational governance contract
- Proposal submission & voting mechanism
- Vote tallying & execution framework
- Basic admin roles

**Agent G2 (Phases 3-4)**: Advanced Features & Hardening
- Python CLI tool
- Granular admin roles (Firm Admin)
- Security reviews & gas optimization

**Agent G3 (Phases 5-6)**: Integration & Future-Proofing
- Cross-module hooks (Treasury, Launchpad)
- IBC architecture scaffolding
- Production documentation

## Code Standards

- TypeScript strict mode
- Component-based architecture
- Consistent naming: kebab-case routes, PascalCase components
- Tailwind utility classes following design patterns
- Card-based UI design across all pages
- Sample data structured for easy backend integration

## Architecture Notes

- SimpleSidebar handles page-specific navigation
- Layout component manages sidebar types by route
- All pages follow consistent card-based design patterns
- Quick Actions dropdown provides cross-platform functionality access