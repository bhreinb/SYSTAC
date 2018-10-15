const process = require('process');
const {
    BeforeAll,
    AfterAll,
    Before,
    After,
    Status,
} = require('cucumber');
const testControllerHolder = require('../test_cafe/ControllerHolder');
const errorHandling = require('../test_cafe/AfterTestScenario');
const runnerController = require('../test_cafe/RunnerController');
const { logger } = require('../logger/Provider');
const AgentMetaData = require('../config/JavaScript/AgentMetaData');
const TestRunTagStats = require('../config/JavaScript/TestRunTagStats');

let didTestCafePass = true;
const testScenariosMap = new Map();
const beforeAllAfterAll = process.env.npm_package_config_cucumber_before_after_all_timeout;

BeforeAll({ timeout: beforeAllAfterAll * 1000 }, async () => {
    runnerController.getCountOfTestScenariosWithinSuiteMap();
    return runnerController.createTestCafeScript().then((resFileCreation) => {
        if (resFileCreation) {
            runnerController.runTestScenariosViaTestCafe();
        } else {
            throw new Error('The Runner Failed To Create The Auto Generated Test Script. The Test Run Will Fail!!!');
        }
    });
});

Before(async function priorTestScenario(testCase) {
    //Just In Case An Issue Occurs At The Before Stage, We Update Later With TestCafe Details...
    testScenariosMap.set(testCase.pickle.name, '');
    logger.info(`Running Test Scenario '${testCase.pickle.name}' Under PID ${process.pid}`);
    return this.getTheTestCafeInstance(testCase.pickle.name)
        .then((testController) => {
            const { fixture } = testController.testRun.test;
            const { test } = testController.testRun;
            testScenariosMap.set(testCase.pickle.name, `${fixture.name}_${test.name}`);
            return testController.maximizeWindow();
        })
        .then(() => this.initialisePageObjectMap());
});

After(async () => {
    if (errorHandling.waitTilErrorsProcessed) {
        errorHandling.waitTilErrorsProcessed();
    }
});

After({ timeout: 10 * 1000 }, async function postTestScenario(testCase) {
    await testControllerHolder.free();
    if (testCase.result.status === Status.FAILED) {
        didTestCafePass = false;
        errorHandling.setDidTestCafeFail(true);
        const scenarioTestFailures = await errorHandling.getTestScenarioFailures();
        const { screenShotPath, browserConsoleMessages } = scenarioTestFailures;
        await this.attachImageOnFilePathToReport(screenShotPath);
        await this.attachObjectToReportAsJson('Browser Console Messages:', browserConsoleMessages);
        errorHandling.inCaptureTestFailuresStage = false;
        errorHandling.setDidTestCafeFail(false);
    }
});

AfterAll({ timeout: beforeAllAfterAll * 1000 }, async () => {
    const agentMetaData = new AgentMetaData();
    agentMetaData.writeObjectAsPropertiesFiles(agentMetaData.agentMetaDataFilePathOutput);
    const testRunTagStats = new TestRunTagStats(testScenariosMap);
    testRunTagStats.writeOutTagStatsForTheTestRun();
    await runnerController.closeTestCafeServer();
    await runnerController.removeTestCafeScript();
    const exitCode = didTestCafePass ? 0 : 1;
    logger.info(`Finishing On Cucumber Thread With Exit Code [${exitCode}]`);
    process.exitCode = exitCode;
    const t = setTimeout(() => {
        logger.error(`Closing The Cucumber Thread Unfortunately By Force With Exit Code [${exitCode}]`);
        process.exit(exitCode);
    }, process.env.npm_package_config_cucumber_step_timeout / 2);
    // allow process to exist naturally before the timer if it is ready to
    t.unref();
});
