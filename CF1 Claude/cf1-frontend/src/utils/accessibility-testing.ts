/**
 * CF1 Enterprise Accessibility Testing Utilities
 *
 * Comprehensive accessibility testing and validation system for CF1 components
 * ensuring WCAG 2.1 AA compliance and enterprise accessibility standards.
 *
 * @version 1.0.0
 * @author CF1 Platform Team
 */

// === Accessibility Testing Types ===

export interface AccessibilityTestResult {
  /** Test identifier */
  testId: string;
  /** Test description */
  description: string;
  /** Test result */
  passed: boolean;
  /** Error message if test failed */
  error?: string;
  /** Suggested fix for the issue */
  suggestion?: string;
  /** WCAG criterion reference */
  wcagReference?: string;
}

export interface AccessibilityAuditReport {
  /** Component being tested */
  componentName: string;
  /** Overall compliance score (0-100) */
  complianceScore: number;
  /** Total number of tests run */
  totalTests: number;
  /** Number of tests passed */
  passedTests: number;
  /** Number of tests failed */
  failedTests: number;
  /** Individual test results */
  results: AccessibilityTestResult[];
  /** Timestamp of the audit */
  timestamp: Date;
}

// === Color Contrast Testing ===

/**
 * Calculate relative luminance of a color
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Relative luminance value
 */
export const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * @param color1 First color as RGB array [r, g, b]
 * @param color2 Second color as RGB array [r, g, b]
 * @returns Contrast ratio (1-21)
 */
export const calculateContrastRatio = (
  color1: [number, number, number],
  color2: [number, number, number]
): number => {
  const lum1 = calculateLuminance(...color1);
  const lum2 = calculateLuminance(...color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Test color contrast compliance for WCAG AA/AAA
 * @param foreground Foreground color RGB
 * @param background Background color RGB
 * @param level Compliance level ('AA' | 'AAA')
 * @param textSize Text size ('normal' | 'large')
 * @returns Test result
 */
export const testColorContrast = (
  foreground: [number, number, number],
  background: [number, number, number],
  level: 'AA' | 'AAA' = 'AA',
  textSize: 'normal' | 'large' = 'normal'
): AccessibilityTestResult => {
  const contrastRatio = calculateContrastRatio(foreground, background);

  // WCAG contrast requirements
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 }
  };

  const required = requirements[level][textSize];
  const passed = contrastRatio >= required;

  return {
    testId: 'color-contrast',
    description: `Color contrast ratio (${level} ${textSize})`,
    passed,
    error: passed ? undefined : `Contrast ratio ${contrastRatio.toFixed(2)} is below required ${required}`,
    suggestion: passed ? undefined : 'Increase color contrast by darkening text or lightening background',
    wcagReference: level === 'AA' ? 'WCAG 1.4.3' : 'WCAG 1.4.6'
  };
};

// === Touch Target Testing ===

/**
 * Test touch target size compliance
 * @param width Target width in pixels
 * @param height Target height in pixels
 * @returns Test result
 */
export const testTouchTargetSize = (
  width: number,
  height: number
): AccessibilityTestResult => {
  const minSize = 44; // WCAG 2.1 AA minimum
  const passed = width >= minSize && height >= minSize;

  return {
    testId: 'touch-target-size',
    description: 'Touch target minimum size (44x44px)',
    passed,
    error: passed ? undefined : `Target size ${width}x${height}px is below minimum 44x44px`,
    suggestion: passed ? undefined : 'Increase button padding or minimum size to meet 44x44px requirement',
    wcagReference: 'WCAG 2.1 2.5.5'
  };
};

// === Focus Management Testing ===

/**
 * Test element focus visibility
 * @param element DOM element to test
 * @returns Test result
 */
export const testFocusVisibility = (element: HTMLElement): AccessibilityTestResult => {
  // Simulate focus to check visibility
  element.focus();
  const styles = window.getComputedStyle(element, ':focus');

  // Check for focus indicators
  const hasOutline = styles.outline !== 'none' && styles.outline !== '';
  const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
  const hasBackground = styles.backgroundColor !== element.style.backgroundColor;
  const hasBorder = styles.borderColor !== element.style.borderColor;

  const passed = hasOutline || hasBoxShadow || hasBackground || hasBorder;

  return {
    testId: 'focus-visibility',
    description: 'Focus indicator visibility',
    passed,
    error: passed ? undefined : 'No visible focus indicator detected',
    suggestion: passed ? undefined : 'Add focus:ring or focus:outline styles for keyboard navigation',
    wcagReference: 'WCAG 2.4.7'
  };
};

/**
 * Test keyboard navigation support
 * @param element DOM element to test
 * @returns Test result
 */
export const testKeyboardNavigation = (element: HTMLElement): AccessibilityTestResult => {
  const isInteractive = element.matches('button, a, input, select, textarea, [tabindex]');
  const hasTabIndex = element.hasAttribute('tabindex');
  const tabIndex = element.getAttribute('tabindex');

  let passed = true;
  let error: string | undefined;

  if (isInteractive && tabIndex === '-1') {
    passed = false;
    error = 'Interactive element has tabindex="-1", removing it from keyboard navigation';
  } else if (!isInteractive && !hasTabIndex && element.onclick) {
    passed = false;
    error = 'Element has click handler but is not keyboard accessible';
  }

  return {
    testId: 'keyboard-navigation',
    description: 'Keyboard navigation accessibility',
    passed,
    error,
    suggestion: passed ? undefined : 'Add tabindex="0" or use semantic interactive elements',
    wcagReference: 'WCAG 2.1.1'
  };
};

// === ARIA Testing ===

/**
 * Test ARIA label presence and quality
 * @param element DOM element to test
 * @returns Test result
 */
export const testAriaLabeling = (element: HTMLElement): AccessibilityTestResult => {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const textContent = element.textContent?.trim();

  const hasLabel = !!(ariaLabel || ariaLabelledBy || textContent);
  const isInteractive = element.matches('button, a, input, select, textarea');

  const passed = !isInteractive || hasLabel;

  return {
    testId: 'aria-labeling',
    description: 'ARIA labeling for screen readers',
    passed,
    error: passed ? undefined : 'Interactive element lacks accessible name',
    suggestion: passed ? undefined : 'Add aria-label, aria-labelledby, or visible text content',
    wcagReference: 'WCAG 4.1.2'
  };
};

/**
 * Test ARIA state and property usage
 * @param element DOM element to test
 * @returns Test result
 */
export const testAriaStates = (element: HTMLElement): AccessibilityTestResult => {
  const errors: string[] = [];

  // Check for conflicting ARIA states
  const ariaPressed = element.getAttribute('aria-pressed');
  const ariaSelected = element.getAttribute('aria-selected');
  const ariaExpanded = element.getAttribute('aria-expanded');

  if (ariaPressed && !['true', 'false', 'mixed'].includes(ariaPressed)) {
    errors.push('aria-pressed must be "true", "false", or "mixed"');
  }

  if (ariaSelected && !['true', 'false', 'undefined'].includes(ariaSelected)) {
    errors.push('aria-selected must be "true", "false", or "undefined"');
  }

  if (ariaExpanded && !['true', 'false', 'undefined'].includes(ariaExpanded)) {
    errors.push('aria-expanded must be "true", "false", or "undefined"');
  }

  const passed = errors.length === 0;

  return {
    testId: 'aria-states',
    description: 'ARIA state and property validation',
    passed,
    error: passed ? undefined : errors.join('; '),
    suggestion: passed ? undefined : 'Use valid ARIA state values according to specification',
    wcagReference: 'WCAG 4.1.2'
  };
};

// === Component Testing Functions ===

/**
 * Run comprehensive accessibility audit on a component
 * @param element DOM element or component to test
 * @param componentName Name of the component for reporting
 * @returns Complete audit report
 */
export const runAccessibilityAudit = (
  element: HTMLElement,
  componentName: string
): AccessibilityAuditReport => {
  const tests: AccessibilityTestResult[] = [];

  // Run all accessibility tests
  tests.push(testFocusVisibility(element));
  tests.push(testKeyboardNavigation(element));
  tests.push(testAriaLabeling(element));
  tests.push(testAriaStates(element));

  // Test touch target size if element is interactive
  if (element.matches('button, a, input, select, textarea')) {
    const rect = element.getBoundingClientRect();
    tests.push(testTouchTargetSize(rect.width, rect.height));
  }

  // Calculate compliance score
  const passedTests = tests.filter(test => test.passed).length;
  const totalTests = tests.length;
  const complianceScore = Math.round((passedTests / totalTests) * 100);

  return {
    componentName,
    complianceScore,
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    results: tests,
    timestamp: new Date()
  };
};

/**
 * Test CF1 button accessibility compliance
 * @param buttonElement Button element to test
 * @returns Audit report
 */
export const auditCF1Button = (buttonElement: HTMLButtonElement): AccessibilityAuditReport => {
  return runAccessibilityAudit(buttonElement, 'CF1Button');
};

/**
 * Test CF1 card accessibility compliance
 * @param cardElement Card element to test
 * @returns Audit report
 */
export const auditCF1Card = (cardElement: HTMLElement): AccessibilityAuditReport => {
  return runAccessibilityAudit(cardElement, 'CF1Card');
};

/**
 * Test CF1 search input accessibility compliance
 * @param inputElement Input element to test
 * @returns Audit report
 */
export const auditCF1SearchInput = (inputElement: HTMLInputElement): AccessibilityAuditReport => {
  return runAccessibilityAudit(inputElement, 'CF1SearchInput');
};

// === Reporting Functions ===

/**
 * Generate accessibility report in markdown format
 * @param report Audit report to format
 * @returns Markdown formatted report
 */
export const generateAccessibilityReport = (report: AccessibilityAuditReport): string => {
  const { componentName, complianceScore, totalTests, passedTests, failedTests, results, timestamp } = report;

  let markdown = `# ${componentName} Accessibility Audit Report\n\n`;
  markdown += `**Generated:** ${timestamp.toISOString()}\n`;
  markdown += `**Compliance Score:** ${complianceScore}% (${passedTests}/${totalTests} tests passed)\n\n`;

  if (failedTests > 0) {
    markdown += `## ❌ Failed Tests (${failedTests})\n\n`;
    results
      .filter(test => !test.passed)
      .forEach(test => {
        markdown += `### ${test.description}\n`;
        markdown += `- **Error:** ${test.error}\n`;
        markdown += `- **Suggestion:** ${test.suggestion}\n`;
        markdown += `- **WCAG Reference:** ${test.wcagReference}\n\n`;
      });
  }

  if (passedTests > 0) {
    markdown += `## ✅ Passed Tests (${passedTests})\n\n`;
    results
      .filter(test => test.passed)
      .forEach(test => {
        markdown += `- ${test.description}\n`;
      });
  }

  return markdown;
};

/**
 * Log accessibility audit results to console
 * @param report Audit report to log
 */
export const logAccessibilityReport = (report: AccessibilityAuditReport): void => {
  console.group(`🔍 ${report.componentName} Accessibility Audit`);
  console.log(`Compliance Score: ${report.complianceScore}%`);
  console.log(`Tests: ${report.passedTests}/${report.totalTests} passed`);

  if (report.failedTests > 0) {
    console.group('❌ Failed Tests');
    report.results
      .filter(test => !test.passed)
      .forEach(test => {
        console.error(`${test.description}: ${test.error}`);
        console.info(`💡 ${test.suggestion}`);
      });
    console.groupEnd();
  }

  console.groupEnd();
};