# CF1 UI Component Library

A comprehensive collection of reusable UI components built for the CF1 platform, featuring consistent design, accessibility, and dark mode support.

## Components Overview

### Core Components

#### LoadingSpinner
A customizable loading spinner with multiple sizes and colors.

```tsx
<LoadingSpinner size="medium" color="primary" />
```

**Props:**
- `size`: 'small' | 'medium' | 'large'
- `color`: 'primary' | 'secondary' | 'white'
- `className`: Additional CSS classes

#### Button
A versatile button component with multiple variants and states.

```tsx
<Button 
  variant="primary" 
  size="medium" 
  loading={false}
  icon={PlusIcon}
  onClick={() => {}}
>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
- `size`: 'small' | 'medium' | 'large'
- `loading`: boolean
- `disabled`: boolean
- `icon`: LucideIcon
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean

#### Card
A flexible container component with customizable styling.

```tsx
<Card padding="medium" shadow="small" hoverable>
  <p>Card content</p>
</Card>
```

**Props:**
- `padding`: 'none' | 'small' | 'medium' | 'large'
- `shadow`: 'none' | 'small' | 'medium' | 'large'
- `border`: boolean
- `hoverable`: boolean
- `onClick`: function

### Status & Feedback

#### StatusBadge
Visual indicators for status information with color coding.

```tsx
<StatusBadge 
  status="success" 
  text="Active" 
  icon={CheckIcon}
  size="medium" 
/>
```

**Props:**
- `status`: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'draft'
- `text`: string
- `icon`: LucideIcon
- `size`: 'small' | 'medium' | 'large'

#### ProgressBar
Animated progress indicator with customizable appearance.

```tsx
<ProgressBar 
  value={75} 
  max={100}
  color="primary"
  showLabel
  label="Progress"
  animated
/>
```

**Props:**
- `value`: number
- `max`: number
- `size`: 'small' | 'medium' | 'large'
- `color`: 'primary' | 'success' | 'warning' | 'danger'
- `showLabel`: boolean
- `label`: string
- `animated`: boolean

#### Toast Notifications
Rich notification system with multiple types and actions.

```tsx
// Provider setup
<ToastProvider position="top-right" maxToasts={5}>
  <App />
</ToastProvider>

// Usage with hooks
const { success, error, warning, info } = useToastHelpers();

success('Success!', 'Operation completed successfully', {
  duration: 5000,
  action: {
    label: 'View Details',
    onClick: () => navigate('/details')
  }
});
```

**Toast Types:**
- `success`: Green theme for positive actions
- `error`: Red theme for errors and failures
- `warning`: Yellow theme for warnings
- `info`: Blue theme for informational messages

### Input Components

#### SearchInput
Advanced search input with debouncing and suggestions.

```tsx
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search assets..."
  suggestions={['Apple', 'Banana', 'Cherry']}
  loading={isSearching}
  debounceMs={300}
/>
```

**Props:**
- `value`: string
- `onChange`: function
- `placeholder`: string
- `loading`: boolean
- `suggestions`: string[]
- `onSuggestionClick`: function
- `debounceMs`: number

### Utility Components

#### EmptyState
Consistent empty state presentations with optional actions.

```tsx
<EmptyState
  icon={FileTextIcon}
  title="No items found"
  description="Try adjusting your search criteria"
  action={{
    label: 'Create New',
    onClick: () => navigate('/create')
  }}
  size="medium"
/>
```

**Props:**
- `icon`: LucideIcon
- `title`: string
- `description`: string
- `action`: { label: string, onClick: function, variant?: string }
- `size`: 'small' | 'medium' | 'large'

#### Tooltip
Contextual information overlay with multiple positioning options.

```tsx
<Tooltip 
  content="This is helpful information"
  position="top"
  trigger="hover"
>
  <button>Hover me</button>
</Tooltip>
```

**Props:**
- `content`: string | ReactNode
- `position`: 'top' | 'bottom' | 'left' | 'right'
- `trigger`: 'hover' | 'click'
- `disabled`: boolean

## Design Principles

### Consistency
- Unified color palette across all components
- Consistent sizing system (small, medium, large)
- Standardized spacing and typography

### Accessibility
- ARIA labels and roles where appropriate
- Keyboard navigation support
- High contrast ratios for all text
- Focus indicators for interactive elements

### Dark Mode Support
- All components support dark mode automatically
- Uses CSS custom properties for theme switching
- Consistent color mapping between light and dark themes

### Performance
- Optimized re-renders with React.memo where beneficial
- Efficient state management with minimal prop drilling
- Lazy loading capabilities for complex components

## Usage Guidelines

### Import Components
```tsx
import { Button, Card, StatusBadge } from '../components/UI';
```

### Consistent Styling
- Use the predefined size and color variants
- Maintain consistent spacing using Tailwind utilities
- Follow the established visual hierarchy

### Error Handling
- Always provide loading states for async operations
- Use appropriate status badges for different states
- Implement proper error boundaries

### Testing
- All components include comprehensive test coverage
- Use the provided test utilities for consistent testing
- Test both light and dark mode variants

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When adding new components:
1. Follow the established patterns and naming conventions
2. Include TypeScript interfaces for all props
3. Add comprehensive tests
4. Document component usage and examples
5. Ensure dark mode compatibility
6. Test across different screen sizes