const { When, Then } = require('cucumber');

When(/^I am typing my search request "([^"]*)" on GitHub$/, async function typeSearchRequest(text) {
  const pageInstance = this.getPageObjectFromCurrentPage();
  const { gitHubSearchBox } = pageInstance;
  await this.classBasePage.testCafeActionsTypeText(gitHubSearchBox, text, {});
});

Then(/^I am pressing (.*) key on GitHub$/, async (text) => {
  await this.classBasePage.testCafeActionsPressKey(text, {});
});

Then(/^I should see that the first GitHub's result is (.*)$/, async function getFirstResult(text) {
  const pageInstance = this.getPageObjectFromCurrentPage();
  const { testCafeTestController } = global.process;
  await testCafeTestController.expect(pageInstance.firstResultPostSearch.innerText).contains(text);
});

Then(/^I am trying to use a Role$/, async function useRole() {
  const pageInstance = this.getPageObjectFromCurrentPage();
  const { testCafeTestController } = global.process;
  await testCafeTestController.useRole(pageInstance.signOnRole);
  await testCafeTestController.expect(pageInstance.resultSignOnRole).eql('Incorrect username or password!');
});

When(/^I navigate to page "([^"]*)"$/, async function navigateToPage(pageName) {
  const pageInstance = this.getPageObjectFromName(pageName);
  const { testCafeTestController } = global.process;
  const pageNav = await pageInstance.testCafeNavigateToPage(this.page);
  await testCafeTestController.expect(pageNav)
    .ok(`Failed To Navigate To Page Name [${pageInstance.pageName}]`);
});

Then(/^I should see the following features$/, async function getAllGithubFeatures(table) {
  const expectedGithubFeatures = table.raw().pop();
  const pageInstance = this.getPageObjectFromCurrentPage();
  const { testCafeTestController } = global.process;
  const githubFeatures = await this.classBasePage
    .testCafeGetTextFromArrayOfElementsViaClientFunction(pageInstance.gitHubFeaturesCssLocator);
  console.error(`expectedGithubFeatures ${expectedGithubFeatures}`);
  console.error(`githubFeatures ${githubFeatures}`);
  await testCafeTestController.expect(expectedGithubFeatures).eql(githubFeatures);
});
