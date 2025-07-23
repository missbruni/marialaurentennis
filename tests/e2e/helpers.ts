import { Page, expect } from '@playwright/test';
import { SELECTORS } from './selectors';

/**
 * Helper functions for common test operations
 */
export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to the home page and wait for it to load
   */
  async navigateToHomePage() {
    await this.page.goto('/');
    // Wait for the hero section to be visible instead of networkidle
    await this.page.waitForSelector(`[data-testid="${SELECTORS.HERO_SECTION}"]`, {
      timeout: 10000
    });
  }

  /**
   * Scroll to the bottom of the page
   */
  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for a specific test ID to be visible
   */
  async waitForTestId(testId: keyof typeof SELECTORS) {
    await this.page.waitForSelector(`[data-testid="${SELECTORS[testId]}"]`);
  }

  /**
   * Get a locator by test ID
   */
  getByTestId(testId: keyof typeof SELECTORS) {
    return this.page.getByTestId(SELECTORS[testId]);
  }

  /**
   * Assert that an element with test ID is visible
   */
  async expectTestIdVisible(testId: keyof typeof SELECTORS) {
    await expect(this.getByTestId(testId)).toBeVisible();
  }

  /**
   * Assert that an element with test ID has specific text
   */
  async expectTestIdHasText(testId: keyof typeof SELECTORS, text: string) {
    await expect(this.getByTestId(testId)).toHaveText(text);
  }
}

/**
 * Page Object for the Home Page
 */
export class HomePage {
  constructor(private page: Page) {}

  private helpers = new TestHelpers(this.page);

  /**
   * Navigate to the home page
   */
  async navigate() {
    await this.helpers.navigateToHomePage();
  }

  /**
   * Verify the hero section is visible
   */
  async expectHeroSectionVisible() {
    await this.helpers.expectTestIdVisible('HERO_SECTION');
  }

  /**
   * Verify the booking form section is visible
   */
  async expectBookingFormSectionVisible() {
    await this.helpers.expectTestIdVisible('BOOKING_FORM_SECTION');
  }

  /**
   * Verify the booking form title is visible and has correct text
   */
  async expectBookingFormTitle() {
    await this.helpers.expectTestIdVisible('BOOKING_FORM_TITLE');
    await this.helpers.expectTestIdHasText('BOOKING_FORM_TITLE', 'Improve your game');
  }

  /**
   * Verify the booking form subtitle is visible and has correct text
   */
  async expectBookingFormSubtitle() {
    await this.helpers.expectTestIdVisible('BOOKING_FORM_SUBTITLE');
    await this.helpers.expectTestIdHasText(
      'BOOKING_FORM_SUBTITLE',
      'Book a session today and take the next step in your tennis journey.'
    );
  }

  /**
   * Verify the date picker container is visible
   */
  async expectDatePickerContainerVisible() {
    await this.helpers.expectTestIdVisible('DATE_PICKER_CONTAINER');
  }

  /**
   * Verify the date picker is visible
   */
  async expectDatePickerVisible() {
    await this.helpers.expectTestIdVisible('DATE_PICKER');
  }

  /**
   * Verify the calendar is visible
   */
  async expectCalendarVisible() {
    await this.helpers.expectTestIdVisible('CALENDAR');
  }

  /**
   * Click on an available date if one exists
   */
  async clickAvailableDate() {
    const availableDates = this.page.locator('[data-modifier="available"] button');

    if ((await availableDates.count()) > 0) {
      await availableDates.first().click();
      await this.page.waitForTimeout(1000);
      return true;
    }
    return false;
  }

  /**
   * Verify available lessons container appears after date selection
   */
  async expectAvailableLessonsContainerVisible() {
    await this.helpers.expectTestIdVisible('AVAILABLE_LESSONS_CONTAINER');
  }

  /**
   * Check if next available date button is visible
   */
  async expectNextAvailableDateButtonVisible() {
    await this.helpers.expectTestIdVisible('NEXT_AVAILABLE_DATE_BUTTON');
  }

  /**
   * Scroll to bottom and verify contact form is visible
   */
  async expectContactFormVisible() {
    await this.helpers.scrollToBottom();
    await this.helpers.expectTestIdVisible('CONTACT_FORM_SECTION');
  }

  /**
   * Verify contact form title is visible and has correct text
   */
  async expectContactFormTitle() {
    await this.helpers.expectTestIdVisible('CONTACT_FORM_TITLE');
    await this.helpers.expectTestIdHasText('CONTACT_FORM_TITLE', 'Contact us');
  }

  /**
   * Verify contact form name is visible and has correct text
   */
  async expectContactFormName() {
    await this.helpers.expectTestIdVisible('CONTACT_FORM_NAME');
    await this.helpers.expectTestIdHasText('CONTACT_FORM_NAME', 'Maria Lauren Wisdom');
  }
}
