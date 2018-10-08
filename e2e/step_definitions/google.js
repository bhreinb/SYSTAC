const { When, Then } = require('cucumber');

When(/^I am typing my search request "([^"]*)" on Google$/, async function searchGoogle(text) {
  const pageInstance = this.getPageObjectFromCurrentPage();
  const { testCafeTestController } = global.process;
  await this.addScreenShotToReport();
  await testCafeTestController.typeText(pageInstance.googleSearchBox, text);
});

Then(/^I press the "([^"]*)" key on Google$/, async (text) => {
  const { testCafeTestController } = global.process;
  await testCafeTestController.pressKey(text);
});

Then(/^I should see that the first Google's result is "([^"]*)"$/, async function checkFirstGoogleResult(text) {
  const pageInstance = this.getPageObjectFromCurrentPage();
  const { testCafeTestController } = global.process;
  await testCafeTestController
    .expect(pageInstance.googleFirstSearchResult.innerText).contains(text);
});
