const { logger } = require('../logger/Provider');

/**
 * A class used to manage the lifecycle of the test cafe test controller object
 * which contains test run APIs that interact with application under test. Within CucumberJs
 * context the workflow is to get the instance and we finish with it by calling free.
 */
class ControllerHolder {
  /**
   * Creates an instance of ControllerHolder.
   */
  constructor() {
    this.captureResolver = null;
    this.getResolver = null;
  }

  /**
   * Captures the instance of the test controller object, which is usually invoked by
   * the async function within the test method of the TestCafe test script.
   * @param {Object} t The test controller used to access the test run API. This is passed
   * implicitly by default via test cafe when this function is called at test, beforeEach or after
   * lifecycle stages http://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#test-controller
   * @returns {Promise} Returns an promise that eventually resolves to nothing when free is
   * called within CucumberJs context.
   */
  capture(t) {
    if (this.getResolver) {
      this.getResolver(t);
    }
    return new Promise((resolve) => {
      this.captureResolver = resolve;
    });
  }

  /**
   * Frees the instance of the test cafe controller object, to indicate that the runner in test
   * cafe should finish the test scenario. Doing this moves the test cafe context onto the next
   * phase of the test cafe script namely the after phase, whereby we typically take screenshots
   * of a failing test scenario if that was to occur.
   */
  free() {
    if (this.captureResolver) {
      this.captureResolver();
    }
  }

  /**
   * Gets the instance of the test controller object when its called within a CucumberJs context.
   * It's tightly bound to the capture function within this class as capture needs to complete
   * successfully in order to copy the instance back to the cucumber runner.
   * @returns {Promise} Returns a promise that eventually resolves to an instance of the test
   * controller object used to interact with the application under test.
   */
  get(testScenarioName) {
    logger.info(`Getting The Instance For ${testScenarioName}`);
    return new Promise((resolve) => {
      this.getResolver = resolve;
    });
  }
}

module.exports = new ControllerHolder();
