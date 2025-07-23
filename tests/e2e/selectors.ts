/**
 * Centralized selectors for e2e tests
 * This file contains all test IDs and selectors used across e2e tests
 * If you need to change a selector, update it here and all tests will use the new value
 */

export const SELECTORS = {
  // Hero section
  HERO_SECTION: 'hero-section',

  // Booking form section
  BOOKING_FORM_SECTION: 'booking-form-section',
  BOOKING_FORM_TITLE: 'booking-form-title',
  BOOKING_FORM_SUBTITLE: 'booking-form-subtitle',
  DATE_PICKER_CONTAINER: 'date-picker-container',
  DATE_PICKER: 'date-picker',
  CALENDAR: 'calendar',
  NEXT_AVAILABLE_DATE_BUTTON: 'next-available-date-button',
  AVAILABLE_LESSONS_CONTAINER: 'available-lessons-container',

  // Contact form section
  CONTACT_FORM_SECTION: 'contact-form-section',
  CONTACT_FORM_TITLE: 'contact-form-title',
  CONTACT_FORM_NAME: 'contact-form-name',

  // Calendar specific selectors
  AVAILABLE_DATES: '[data-modifier="available"] button'
} as const;

/**
 * Helper functions to get selectors with proper typing
 */
export const getTestId = (selector: keyof typeof SELECTORS) =>
  `[data-testid="${SELECTORS[selector]}"]`;

export const getByTestId = (selector: keyof typeof SELECTORS) =>
  `[data-testid="${SELECTORS[selector]}"]`;

/**
 * Page-specific selectors
 */
export const HOME_PAGE_SELECTORS = {
  // Hero
  heroSection: () => `[data-testid="${SELECTORS.HERO_SECTION}"]`,

  // Booking form
  bookingFormSection: () => `[data-testid="${SELECTORS.BOOKING_FORM_SECTION}"]`,
  bookingFormTitle: () => `[data-testid="${SELECTORS.BOOKING_FORM_TITLE}"]`,
  bookingFormSubtitle: () => `[data-testid="${SELECTORS.BOOKING_FORM_SUBTITLE}"]`,
  datePickerContainer: () => `[data-testid="${SELECTORS.DATE_PICKER_CONTAINER}"]`,
  datePicker: () => `[data-testid="${SELECTORS.DATE_PICKER}"]`,
  calendar: () => `[data-testid="${SELECTORS.CALENDAR}"]`,
  nextAvailableDateButton: () => `[data-testid="${SELECTORS.NEXT_AVAILABLE_DATE_BUTTON}"]`,
  availableLessonsContainer: () => `[data-testid="${SELECTORS.AVAILABLE_LESSONS_CONTAINER}"]`,

  // Contact form
  contactFormSection: () => `[data-testid="${SELECTORS.CONTACT_FORM_SECTION}"]`,
  contactFormTitle: () => `[data-testid="${SELECTORS.CONTACT_FORM_TITLE}"]`,
  contactFormName: () => `[data-testid="${SELECTORS.CONTACT_FORM_NAME}"]`,

  // Calendar
  availableDates: () => SELECTORS.AVAILABLE_DATES
} as const;
