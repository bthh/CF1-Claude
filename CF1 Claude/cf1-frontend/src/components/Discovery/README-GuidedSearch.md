# Guided Search Questions Feature

## Overview
The Guided Search Questions feature helps users refine their search when they have selected a category but are getting few or no results. It presents contextual questions based on the selected category to understand user preferences better and provide more targeted results.

## Architecture

### Components
1. **GuidedSearchQuestions** - Main component that renders category-specific questions
2. **GuidedSearchEnhancer** - Utility class for enhancing search results based on answers
3. **DiscoveryHub** - Integration point with trigger logic and state management

### State Management
The guided search state is managed in `discoveryStore.ts`:
```typescript
interface GuidedSearchState {
  isActive: boolean;
  category: string;
  originalQuery: string;
  answers: GuidedAnswer[];
  showAfterResultCount?: number;
  showAfterSeconds?: number;
}
```

## Trigger Conditions

The guided search suggestions appear when:
1. User has selected a category from the filter buttons
2. User has entered a search query (≥2 characters)
3. **Either:**
   - Search returns 0 results (immediate suggestion)
   - Search returns 1-2 results (suggestion after 3 seconds)

## Category-Specific Questions

### Real Estate
- **Location**: Urban, Suburban, Rural, International, Vacation
- **Property Type**: Residential, Commercial, Industrial, Mixed-Use, Hospitality, Land
- **Investment Amount**: Range slider ($10K - $10M)
- **Timeline**: Short-term, Medium-term, Long-term, Flexible  
- **Key Features**: Cash Flow, Appreciation, Tax Benefits, Low Maintenance, etc.

### Technology
- **Industry Focus**: AI, Fintech, HealthTech, CleanTech, SaaS, Gaming, etc.
- **Investment Stage**: Early Stage, Growth Stage, Mature/Pre-IPO, Public, Mixed
- **Market Size**: Niche, Regional, National, Global, Emerging
- **Technical Focus**: B2B, Consumer, Infrastructure, Data/Analytics, etc.

### Commodities  
- **Commodity Type**: Precious Metals, Energy, Agricultural, Industrial, Rare Earth
- **Geographic Exposure**: North America, Europe, Asia-Pacific, Emerging, Global
- **Contract Duration**: Short-term, Medium-term, Long-term, Physical Storage
- **Risk Tolerance**: Conservative, Moderate, Aggressive, Speculative

### Collectibles
- **Category**: Art, Sports Memorabilia, Wine, Classic Cars, Watches, etc.
- **Authentication**: Professional required, Certified only, Documented, Flexible
- **Storage**: Personal, Professional, Climate-Controlled, Bank Vault
- **Investment Approach**: Long-term, Personal Enjoyment, Diversification, Trading

### Energy
- **Energy Type**: Solar, Wind, Hydro, Nuclear, Natural Gas, Oil, Geothermal, Storage
- **Location**: Domestic, Developed International, Emerging, Offshore, Rural
- **Capacity Scale**: Residential, Commercial, Utility, Industrial, Mixed
- **Investment Structure**: Direct Ownership, REITs, MLPs, Public Companies, Funds

## Features

### Progressive Question Flow
- Questions are presented one at a time
- Progress indicator shows completion status  
- Navigation allows going back to previous questions
- "Start Over" button resets the entire flow

### Real-Time Result Enhancement
- Search results are enhanced as user answers questions
- Enhanced results show:
  - Higher relevance scores
  - "Enhanced" badges for boosted results
  - Relevance reason tags explaining why results match
  - Mock additional results when original results are sparse

### Visual Indicators
- Progress bar with percentage completion
- Dot indicators showing current/completed questions
- Color-coded question types (multiple choice, sliders, text)
- Enhanced result badges and relevance tags

## User Experience Flow

1. **User searches** "Real Estate + AirBNB" with Real Estate category selected
2. **System returns few results** and shows guided search suggestion after 3 seconds
3. **User clicks "Help Me Search"** to start guided questions
4. **Progressive questioning**:
   - Location preferences (multiple choice)
   - Property type selection (multiple choice) 
   - Investment budget (range slider)
   - Timeline preferences (multiple choice)
   - Key features priority (multiple choice)
5. **Real-time enhancement** as each question is answered
6. **Completion** shows enhanced results with relevance explanations

## Testing Scenarios

### Scenario 1: Real Estate + AirBnB Search
```
1. Select "Real Estate" category
2. Search "airbnb investment"  
3. Guided search triggers (low results)
4. Answer questions:
   - Location: "Vacation Destinations"
   - Property Type: "Hospitality (Hotels/AirBnB)"  
   - Budget: $100K - $500K
   - Timeline: "Medium-term (3-5 years)"
   - Features: "High Cash Flow", "Passive Income"
5. Enhanced results show AirBnB-specific opportunities
```

### Scenario 2: Technology + AI Search  
```
1. Select "Technology" category
2. Search "AI startup investment"
3. Guided search triggers
4. Answer questions:
   - Industry: "Artificial Intelligence"
   - Stage: "Early Stage (Seed/Series A)"
   - Market: "Global"  
   - Focus: "B2B Solutions"
5. Enhanced results prioritize AI B2B startups
```

### Scenario 3: No Results Trigger
```
1. Select "Collectibles" category  
2. Search "rare baseball cards"
3. No results found - immediate guided search suggestion
4. Complete sports memorabilia questions
5. Mock enhanced results for sports card investing
```

## Implementation Details

### Question Types
- **Multiple Choice**: Checkbox-style with multiple selections
- **Range Slider**: Min/max values with currency/unit formatting  
- **Text Input**: Free-form text entry with placeholder
- **Single Choice**: Radio-style single selection (future enhancement)

### Enhancement Algorithm
The `GuidedSearchEnhancer` applies category-specific logic:
- Keyword matching between answers and content
- Relevance score boosting (0.0 - 0.4 bonus)
- Mock result generation for sparse original results
- Reason generation explaining relevance matches

### Performance Considerations
- Lazy loading of question components
- Debounced search with timeout management
- Memoized search results and handlers
- Efficient state updates in Zustand store

## Future Enhancements

1. **Machine Learning Integration**: Use actual ML models for result ranking
2. **Answer Persistence**: Remember user preferences across sessions
3. **Advanced Question Types**: Date pickers, multi-range sliders, conditional questions
4. **Analytics**: Track question completion rates and result satisfaction
5. **A/B Testing**: Test different question flows and trigger conditions
6. **Integration**: Connect with real search APIs and content databases

## Configuration

The guided search can be configured via the discoveryStore:
```typescript
// Trigger after 2 results instead of 3
startGuidedSearch(category, query, { showAfterResultCount: 2 });

// Trigger after 5 seconds instead of 3  
startGuidedSearch(category, query, { showAfterSeconds: 5000 });
```