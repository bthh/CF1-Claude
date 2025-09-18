# CF1 Visual Regression CI/CD Pipeline

## 🎯 Overview

This document describes the automated visual regression and performance testing pipeline for CF1, designed to maintain "TradFi Feel, DeFi Engine" design consistency and enterprise-grade user experience.

## 🚀 Pipeline Components

### 1. Visual Regression Testing
- **File**: `.github/workflows/visual-regression.yml`
- **Trigger**: Pull requests to `main` or `develop` branches
- **Coverage**: Core CF1 pages (Dashboard, Marketplace, Portfolio, Admin, Discovery)
- **Browsers**: Chrome Desktop + Mobile (optimized for enterprise users)
- **Standards**: WCAG 2.1 AA compliance, mobile responsiveness, dark mode

### 2. Performance Baselines
- **File**: `lighthouse.config.js`
- **Metrics**: Core Web Vitals, Accessibility scores, Performance budgets
- **Thresholds**: Performance >85, Accessibility >95 (enterprise standards)
- **Pages**: All critical user journeys

### 3. Test Suite
- **File**: `e2e/cf1-visual-regression.spec.ts`
- **Focus Areas**:
  - Core page layouts and consistency
  - Component states (sidebar, filters, navigation)
  - Mobile responsive design
  - Accessibility compliance (focus states, contrast)

## 🛠️ Setup Instructions

### 1. GitHub Repository Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
BROWSERBASE_API_KEY=your_browserbase_api_key_here
BROWSERBASE_PROJECT_ID=your_browserbase_project_id_here
```

### 2. Local Development Setup

```bash
# Install browser dependencies (if running locally)
sudo npx playwright install-deps

# Install Chromium for Playwright
npx playwright install chromium

# Generate baseline screenshots
npm run visual:baseline

# Run visual tests
npm run visual:test

# View test reports
npm run visual:report
```

### 3. CI/CD Commands

```bash
# Build and run visual tests
npm run ci:visual

# Run performance tests
npm run ci:performance

# Clean test artifacts
npm run visual:clean

# Update baselines (after intentional UI changes)
npm run visual:update
```

## 📊 How It Works

### Visual Regression Flow
1. **Trigger**: PR created/updated → GitHub Actions triggers
2. **Build**: Application built with production settings
3. **Screenshots**: Playwright captures screenshots of key pages
4. **Compare**: New screenshots compared against approved baselines
5. **Report**: Visual differences highlighted in PR comments
6. **Approval**: Developer reviews and approves/rejects changes

### Performance Monitoring
1. **Lighthouse**: Runs Core Web Vitals analysis
2. **Budgets**: Enforces performance standards for enterprise users
3. **Accessibility**: Validates WCAG 2.1 AA compliance
4. **Results**: Posted as PR comments with actionable insights

## 🎯 CF1-Specific Quality Gates

### Visual Standards
- ✅ "TradFi Feel, DeFi Engine" design consistency
- ✅ Professional enterprise appearance
- ✅ Mobile-first responsive design
- ✅ Dark mode compatibility
- ✅ Accessibility compliance (focus indicators, contrast)

### Performance Standards
- ✅ Performance Score: >85 (TradFi user expectations)
- ✅ Accessibility Score: >95 (WCAG 2.1 AA compliance)
- ✅ Largest Contentful Paint: <2.5s
- ✅ Cumulative Layout Shift: <0.1
- ✅ Total Blocking Time: <300ms

### Key Test Coverage
- **Dashboard**: Landing experience and widget layouts
- **Marketplace**: Asset discovery and filtering
- **Discovery**: Smart search with bubble tag filters
- **Portfolio**: Investment tracking and performance charts
- **Admin**: Platform management interface
- **Components**: Sidebar states, navigation, forms

## 🔄 Developer Workflow

### Making UI Changes
1. **Create PR** with your changes
2. **CI Runs** automatically and captures screenshots
3. **Review Results** in PR comments and artifacts
4. **If Changes Intentional**: Run `npm run visual:update` locally and push
5. **If Regression**: Fix the issue and push updates
6. **Merge** once all checks pass

### Handling Visual Differences
```bash
# Download and review visual diff report from GitHub Actions
# If changes are intentional:
npm run visual:update
git add e2e/cf1-visual-regression.spec.ts-snapshots/
git commit -m "Update visual baselines for intentional UI changes"
git push
```

## 📈 Continuous Improvement

### Phase 1: Foundation (Current)
- ✅ Visual regression prevention
- ✅ Performance baseline enforcement
- ✅ Accessibility compliance checking
- ✅ Mobile responsiveness validation

### Phase 2: Enhancement (Future)
- [ ] Cross-browser compatibility (Firefox, Safari)
- [ ] Component-level visual testing
- [ ] Integration with design system tokens
- [ ] A/B testing visual validation

### Phase 3: Advanced (Future)
- [ ] Production synthetic monitoring
- [ ] Visual regression alerts
- [ ] Automated baseline updates
- [ ] Performance regression tracking

## 🚨 Troubleshooting

### Common Issues

1. **Visual test failures due to timing**
   - Solution: Increase wait times in test setup
   - Check for loading spinners and animations

2. **Performance budget failures**
   - Solution: Review Lighthouse recommendations
   - Optimize bundle size and critical rendering path

3. **Accessibility test failures**
   - Solution: Check focus states and color contrast
   - Validate ARIA labels and semantic HTML

4. **Browser dependency issues (local)**
   - Solution: Run `sudo npx playwright install-deps`
   - Use CI environment for consistent results

### Contact & Support
- **Repository**: https://github.com/bthh/CF1-Claude
- **Documentation**: This file and inline code comments
- **Issues**: Create GitHub issues for pipeline problems

---

## 💡 Next Steps

1. **Set up repository secrets** for Browserbase integration
2. **Run initial baseline generation** on clean main branch
3. **Test pipeline** with a sample PR
4. **Train team** on visual regression workflow
5. **Monitor and optimize** pipeline performance

This pipeline ensures CF1 maintains enterprise-grade visual consistency and performance standards throughout development.