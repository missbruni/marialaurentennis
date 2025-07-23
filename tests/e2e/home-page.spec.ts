import { test, expect } from '@playwright/test';
import { HomePage } from './helpers';

test.describe('Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('should load the home page and display booking form', async ({ page }) => {
    await homePage.navigate();
    await homePage.expectHeroSectionVisible();
    await homePage.expectBookingFormSectionVisible();
    await homePage.expectBookingFormTitle();
    await homePage.expectBookingFormSubtitle();
  });

  test('should allow date selection and show availability', async ({ page }) => {
    await homePage.navigate();
    await homePage.expectDatePickerContainerVisible();
    await homePage.expectDatePickerVisible();
    await homePage.expectCalendarVisible();

    const dateClicked = await homePage.clickAvailableDate();

    if (dateClicked) {
      await homePage.expectAvailableLessonsContainerVisible();
    } else {
      await homePage.expectNextAvailableDateButtonVisible();
      console.log('No available dates found, but next available date button is present');
    }
  });

  test('should display contact form at the bottom', async ({ page }) => {
    await homePage.navigate();
    await homePage.expectContactFormVisible();
    await homePage.expectContactFormTitle();
    await homePage.expectContactFormName();
  });
});
