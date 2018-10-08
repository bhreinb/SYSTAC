const BasePage = require('./BasePage.js');

/**
 * A class to hold common functions and properties specific to the application under test
 * the framework is testing. All project pages inherit this page.
 * @extends BasePage
 */
class SystacBasePage extends BasePage {
  /**
   * Used to initialise project specific elements that happen to exist across multiple pages
   * rather than they been redefined across multiple pages. As this is project specific elements
   * it makes sense that they exist here rather than class BasePage.
   */
  init() {
    this.firstResultPostSearch = this.testCafeSelectElementsByCssStringFilteredByIndex('.repo-list-item', 0);
  }
}

module.exports = SystacBasePage;
