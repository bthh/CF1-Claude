# CF1 Platform: Core Context & Operations

CF1 is an enterprise-grade blockchain platform for Real-World Asset (RWA) tokenization with U.S. Reg CF compliance.

## 🚀 Project URLs

**🔴 PRODUCTION (LIVE USERS):**
- Frontend: https://rwa2.netlify.app
- Backend: https://cf1-claude-production.up.railway.app
- Admin: https://rwa2.netlify.app/admin

**🟡 STAGING (TESTING):**
- Frontend: https://68c95aa850920f69596abcd1--rwa2.netlify.app
- Backend: https://cf1-claude-production.up.railway.app (shared)
- Admin: https://68c95aa850920f69596abcd1--rwa2.netlify.app/admin

## 💻 My Core Capabilities & Directives

### **🤖 Specialized Subagent Team**
I have access to a full team of specialized subagents. **ALWAYS delegate tasks** to appropriate specialists:

- `cosmwasm-security-auditor` - Smart contract security analysis
- `frontend-component-architect` - React/TypeScript enterprise patterns
- `blockchain-integration-specialist` - Cosmos SDK/Neutron optimization
- `testing-coverage-enforcer` - Test coverage improvement (target: 95%)
- `ai-service-optimizer` - FastAPI performance & Claude API integration
- `regulatory-compliance-checker` - Reg CF compliance verification
- `cosmwasm-gas-optimizer` - Gas efficiency optimization
- `production-deployment-engineer` - Infrastructure & deployment
- `ux-consistency-guardian` - "TradFi Feel, DeFi Engine" design philosophy
- `documentation-sync-specialist` - Technical documentation maintenance

### **🌐 Live Web Interaction**
I'm integrated with **Browserbase SDK** for live webpage interaction:
- Create browser sessions to view/test live sites
- Visual regression testing and UI auditing
- Multi-environment validation (production, staging, local)
- Performance analysis and accessibility testing

### **⚙️ Quality Assurance Pipeline**
**CI/CD Pipeline**: `.github/workflows/visual-regression.yml`
- Automatically runs on every Pull Request
- Visual regression testing with Playwright
- Performance monitoring and validation
- Cross-browser compatibility checks

## 🔧 Standard Operating Procedures

### **Deployment Workflow**
```bash
# 1. Code changes
git add .
git commit -m "Description"
git push origin main

# 2. Backend deployment
cd backend && railway up --detach

# 3. Frontend deployment
# STAGING FIRST (always test here)
netlify deploy  # NO --prod flag

# 4. Production (only after staging approval)
netlify deploy --prod  # WITH --prod flag
```

### **Admin Authentication**
Super Admin Accounts:
- bthardwick@gmail.com / BrockCF1Admin2025!
- brian.d.towner@gmail.com / BrianCF1Admin2025!
- brian (username) / BrianCF1Admin2025!

### **Tech Stack**
- **Frontend**: React 19 + TypeScript + Vite + Tailwind + CosmJS
- **Backend**: Node.js + Express + TypeScript + SQLite + JWT
- **Smart Contracts**: CosmWasm (Rust) on Neutron blockchain
- **Testing**: Vitest + React Testing Library (75.9% coverage)
- **Deployment**: Railway (backend) + Netlify (frontend)

## 🚨 Critical Constraints

### **Deployment Safety**
- **NEVER deploy directly to production**
- **ALWAYS test on staging first**
- Staging URL: https://68c95aa850920f69596abcd1--rwa2.netlify.app
- Production URL: https://rwa2.netlify.app

### **Task Delegation Protocol**
- **Specialized tasks** → Delegate to appropriate subagent
- **Complex features** → Multiple subagents in parallel
- **Code changes** → Always involve relevant specialist
- **Architecture decisions** → Main orchestrator coordinates

### **Quality Gates**
- TypeScript: 0 compilation errors required
- Testing: Maintain 75.9%+ coverage, target 95%
- Security: JWT-based auth with comprehensive validation
- Performance: Web Vitals monitoring active
- Accessibility: WCAG 2.1 AA compliance maintained

### **CLI Connections Status**
- ✅ GitHub: Connected to https://github.com/bthh/CF1-Claude.git
- ✅ Railway: Connected for backend deployment
- ✅ Netlify: Connected for frontend deployment

## 🎯 Current Development Focus

1. **Testing Enhancement**: 75.9% → 95% coverage
2. **Mobile Navigation**: Recently fixed hamburger menu functionality
3. **Portfolio Asset Details**: Dynamic asset-specific data implemented
4. **Performance Optimization**: Bundle splitting and lazy loading
5. **Smart Contract Integration**: CosmWasm deployment on Neutron

---

**Last Updated**: September 2025
**Platform Status**: ✅ Production Ready & Live