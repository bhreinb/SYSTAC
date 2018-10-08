const { Given } = require('cucumber');

Given(/^The "([^"]*)" page$/, async function openPage(pageName) {
  const pageInstance = this.getPageObjectFromName(pageName);
  const { testCafeTestController } = global.process;
  const pageNav = await pageInstance.testCafeNavigateToPage(this.page);
  await testCafeTestController.expect(pageNav)
    .ok(`Failed To Navigate To Page Name [${pageInstance.pageName}]`);
});

Given(/^The "([^"]*)" page nav method 2$/, async function openPage(pageName) {
  const pageInstance = this.getPageObjectFromName(pageName);
  const { testCafeTestController } = global.process;
  pageInstance.pageLoadedText = 'The world’s leading software development platform · GitHub';
  const pageNav = await pageInstance.testCafeNavigateToPage(this.page);
  await testCafeTestController.expect(pageNav)
    .ok(`Failed To Navigate To Page Name [${pageInstance.pageName}]`);
});
