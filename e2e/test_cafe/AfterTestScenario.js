const { logger } = require('../logger/Provider');

/**
 * A class used to handle the phase after a test scenario execution.
 */
class AfterTestScenario {
  /**
   * Creates an instance of AfterTestScenario.
   */
  constructor() {
    this.booleanDidTestCafeFail = false;
    this.getErrors = null;
    this.waitTilErrorsProcessed = null;
  }

  /**
   * Sets a boolean true or false to indicate that a test failed through cucumber js.
   * @param {Boolean} value True or False to indicate that the test scenario failed or not.
   */
  setDidTestCafeFail(value) {
    this.booleanDidTestCafeFail = value;
  }

  /**
   * Creates a promise to pause the test cafe runner in test cafe context while we collect the logs
   * and screen shots post a failed test scenario execution. We resolve this promise within
   * a cucumber context.
   */
  getTestScenarioFailures() {
    return new Promise((resolve) => {
      this.getErrors = resolve;
    });
  }

  /**
   * Method that manages the phase after a test cafe test scenario run. We check whether the test
   * scenario fails, if it does we capture diagnostic information in the case of a test failure or
   * return immediately if the test scenario passed.
   * @param {Object} t The test controller used to access the test run API.
   */
  handlePostTestScenario(t) {
    let promiseToExecute = null;
    if (this.booleanDidTestCafeFail === true) {
      promiseToExecute = this.captureTestFailuresData(t);
    } else {
      promiseToExecute = Promise.resolve();
    }
    return promiseToExecute;
  }

  /**
   * Used to capture diagnostic information post a failed test scenario. At the moment we are
   * capturing a screen shot plus browser logs.
   * @param {Object} t The test controller used to access the test run API.
   */
  captureTestFailuresData(t) {
    const failures = [AfterTestScenario.grabScreenShot(t), AfterTestScenario.grabBrowserLogs(t)];
    return Promise.all(failures)
      .then((scenarioErrorArray) => {
        const scenarioErrorObject = scenarioErrorArray.reduce((a, b) => Object.assign(a, b), {});
        logger.info(`TestCafe Captured The Following Failure Data ${JSON.stringify(scenarioErrorObject)}`);
        this.getErrors(scenarioErrorObject);
        return new Promise((resolve) => {
          this.waitTilErrorsProcessed = resolve;
        });
      });
  }

  /**
   * Captures a screen shot and returns the file path to the screen shot. If the function throws an
   * exception we log it and return an empty string.
   * @param {Object} t The test controller used to access the test run API.
   */
  static grabScreenShot(t) {
    return t.takeScreenshot().then((screenShotPathTestCafe) => {
      const screenShotPath = screenShotPathTestCafe === null ? '' : screenShotPathTestCafe;
      logger.info(`The Test Scenario Failed But The Screen Shot Of The Failure Can Be Found Here @ [${screenShotPath}]`);
      return { screenShotPath };
    }).catch((error) => {
      logger.error('TestCafe Failed To Grab A Screen Shot Of The Failing Scenario Due To Exception Which Is Detailed Below!!!');
      logger.error(error);
      return { screenShotPath: '' };
    });
  }

  /**
   * Grabs the browser console logs. Once again if the function throws an exception we log
   * it and return an empty string.
   * @param {Object} t The test controller used to access the test run API.
   */
  static grabBrowserLogs(t) {
    return t.getBrowserConsoleMessages().then((browserConsoleMessages) => {
      logger.info(`The Test Scenario Failed But We Returned The Following Console Messages [${JSON.stringify(browserConsoleMessages)}]`);
      return { browserConsoleMessages };
    }).catch((error) => {
      logger.error('TestCafe Failed To Get Browser Console Messages Due To Exception Which Is Detailed Below!!!');
      logger.error(error);
      return { browserConsoleMessages: '' };
    });
  }
}

module.exports = new AfterTestScenario();
