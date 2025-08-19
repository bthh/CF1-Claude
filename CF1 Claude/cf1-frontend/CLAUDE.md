# CF1 Platform - Development Guide

CF1 is an enterprise-grade blockchain platform for Real-World Asset (RWA) tokenization, featuring launchpad, governance, marketplace, and compliance modules. Built with quality over speed, targeting enterprise adoption with U.S. Reg CF compliance.

## 🚨 MANDATORY SUB-AGENT PROTOCOL - READ FIRST 🚨

### **AUTOMATIC SUB-AGENT DELEGATION RULES**

**CRITICAL: You MUST automatically delegate to specialized sub-agents for ANY task matching these triggers:**

#### **IMMEDIATE DELEGATION TRIGGERS (No Exceptions):**
- **ANY component building/editing** → `cf1-frontend-specialist`
- **ANY UX/design work** → `cf1-ux-designer`  
- **ANY testing work** → `cf1-testing-engineer`
- **ANY smart contract work** → `cf1-smart-contract-dev`
- **ANY store/API work** → `cf1-data-integration-specialist`
- **ANY performance work** → `cf1-performance-optimizer`
- **ANY security work** → `cf1-security-auditor`
- **ANY deployment/CI work** → `cf1-devops-engineer`
- **ANY documentation work** → `cf1-documentation-architect`

#### **COMPLEX TASK AUTO-DELEGATION:**
If user request contains **2+ specialized domains** → **IMMEDIATE PARALLEL DELEGATION**

**Example Pattern Recognition:**
```typescript
// User: "Fix admin navigation and authentication errors"
// Auto-Analysis: UX design + Security → PARALLEL DELEGATION

IMMEDIATE RESPONSE:
→ cf1-ux-designer: "Design consolidated admin navigation UX"
→ cf1-security-auditor: "Fix authentication validation errors"
→ Main Orchestrator: Integration + quality gates
```

#### **CONTEXT WINDOW OPTIMIZATION:**
- **Main Context**: Architecture decisions, integration, quality gates only
- **Never implement** in main context what agents can do
- **Always prefer** parallel execution over sequential
- **Maximum delegation** for optimal performance

### **SUB-AGENT RECOGNITION PATTERNS**

**Auto-delegate when you see these keywords:**
- **Frontend**: component, React, store, UI, styling, responsive → `cf1-frontend-specialist`
- **Design/UX**: navigation, workflow, accessibility, user flow → `cf1-ux-designer`
- **Security**: authentication, validation, permissions, audit → `cf1-security-auditor`
- **Performance**: optimization, bundle, loading, speed → `cf1-performance-optimizer`
- **Testing**: test, coverage, mock, debug → `cf1-testing-engineer`
- **Data**: store, API, integration, sync → `cf1-data-integration-specialist`
- **Smart Contracts**: contract, CosmWasm, Rust, blockchain → `cf1-smart-contract-dev`
- **Deploy**: build, CI/CD, deployment, environment → `cf1-devops-engineer`
- **Docs**: documentation, guide, README → `cf1-documentation-architect`

## CF1 Development Sub-Agent Team - ACTIVE

**Team Status**: ✅ **9 SPECIALIZED AGENTS ACTIVE**
**Architecture**: Independent Sonnet 4 agents with separate context windows

### **Core Development Team**

#### 1. **`cf1-frontend-specialist`**
**Auto-Delegate For**: React components, Zustand stores, UI implementation, styling, responsive design, component debugging

#### 2. **`cf1-ux-designer`**
**Auto-Delegate For**: User experience design, navigation flows, accessibility compliance, interface optimization, user journey mapping

#### 3. **`cf1-testing-engineer`**
**Auto-Delegate For**: Test automation, coverage improvement, mock strategies, integration testing, test debugging

#### 4. **`cf1-smart-contract-dev`**
**Auto-Delegate For**: CosmWasm/Rust development, blockchain integration, contract optimization, deployment

#### 5. **`cf1-data-integration-specialist`**
**Auto-Delegate For**: Store architecture, API integration, data flow optimization, real-time synchronization

#### 6. **`cf1-performance-optimizer`**
**Auto-Delegate For**: Bundle optimization, performance monitoring, build optimization, Web Vitals improvement

### **Specialized Support Team**

#### 7. **`cf1-security-auditor`**
**Auto-Delegate For**: Security reviews, vulnerability assessment, authentication fixes, compliance validation

#### 8. **`cf1-devops-engineer`**
**Auto-Delegate For**: CI/CD pipelines, deployment automation, infrastructure optimization, build processes

#### 9. **`cf1-documentation-architect`**
**Auto-Delegate For**: Technical documentation, API docs, system architecture documentation, developer guides

## Current Platform Status (July 2025)

**Platform**: ✅ **PRODUCTION READY** - Enterprise-grade with complete feature set

### **✅ Core Platform Features (Complete)**
- **UI/UX**: Dark mode, responsive design, mobile-first experience
- **Smart Contracts**: Full business logic, CosmWasm on Neutron blockchain
- **State Management**: Zustand global stores with persistence
- **Data Caching**: React Query with optimistic updates
- **Testing**: 75.9% coverage with systematic improvements
- **Security**: XSS protection, CSP headers, rate limiting, input validation
- **Performance**: Web Vitals monitoring, error boundaries, bundle optimization
- **Accessibility**: WCAG 2.1 AA compliance complete

### **✅ Major Features Implemented (July 2025)**
1. **Admin System**: Consolidated navigation, hierarchical access, instant fund functionality
2. **Discovery Hub**: Creator inspiration framework with videos, AI tools, market insights
3. **Dashboard V2**: 3 role-based variants (welcome, investor, creator)
4. **Security Enhancements**: Authentication validation, transaction validation, audit logging
5. **Feature Toggles**: Platform admin controls for marketplace and analytics
6. **Portfolio Integration**: End-to-end admin instant fund → portfolio workflow

### **✅ Recent Completions**
- **Navigation**: Single Admin tab with role-based hierarchical access
- **Authentication**: Fixed admin instant fund session validation
- **Performance**: Build optimization, import fixes, component lazy loading
- **Security**: Multi-layer validation, transaction limits, comprehensive audit trails

## Technical Architecture

**Core Tech Stack**:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + CosmJS
- **Smart Contracts**: CosmWasm (Rust) on Neutron blockchain
- **State**: Zustand global stores with persistence
- **Data**: React Query with optimistic updates and caching
- **Testing**: Vitest + React Testing Library
- **Security**: Rate limiting, access controls, input validation, CSP headers
- **Deploy**: Docker + CI/CD with automated deployment

## Key Business Rules

**Token Lifecycle**:
- Tokens NOT minted until funding goal met
- 12-month regulatory lock-up after minting
- CW20 tokens with escrow system
- Full refunds if funding fails

**Admin Access Levels**:
- **Creator Admin**: Asset management, shareholder relations
- **Platform Admin**: Feature toggles, marketplace controls, analytics
- **Super Admin**: All platform controls, instant fund authority, APY guardrails

**Security Limits**:
- Admin instant fund: $10M transaction limit
- Rate limits: Configurable per operation type
- Multi-layer validation for all admin operations
- Comprehensive audit logging for compliance

## Development Environment Status

- **TypeScript**: 0 compilation errors ✅
- **Build**: Production ready with optimized bundles ✅
- **Frontend**: Complete with mobile-first design ✅
- **Testing**: Ready for enhancement to 95% coverage ✅
- **Security**: Production-grade with comprehensive protections ✅
- **Performance**: Optimized with monitoring and error handling ✅

## Next Priorities

1. **Testing Enhancement**: Continue from 75.9% to 95% coverage target
2. **Bundle Optimization**: Implement dynamic imports for larger components
3. **Smart Contract**: Complete CF1 Portfolio Trust final compilation fixes
4. **Advanced Features**: Multi-chain support, secondary trading enhancements

---

## 🎯 WORKFLOW REMINDER

**For ANY development task:**
1. **Analyze request** → Identify specialized domains
2. **Auto-delegate** → Use appropriate sub-agents immediately
3. **Parallel execution** → Multiple agents for complex tasks
4. **Integration** → Main orchestrator handles final assembly
5. **Quality gates** → Verify all components work together

**Never handle specialized work in main context when sub-agents are available!**