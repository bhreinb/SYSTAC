const CucumberProfileBuilder = require('./e2e/config/JavaScript/CucumberProfileBuilder');
const RunnerMetaData = require('./e2e/config/JavaScript/RunnerMetaData');
const { logger } = require('./e2e/logger/Provider');

const cucumberProfileBuilder = new CucumberProfileBuilder();
cucumberProfileBuilder.init();
cucumberProfileBuilder.checkIfParallelJob();
cucumberProfileBuilder.setTheTagsForTheTestExecution();
cucumberProfileBuilder.setTheJsonOutputFile();
logger.debug(`Sending The Following Cli '${cucumberProfileBuilder.createDefaultProfileForTestRun().default}' To Cucumber Runner`);

const runnerMetaData = new RunnerMetaData();
runnerMetaData.writeObjectAsPropertiesFiles(runnerMetaData.runnerMetaDataFilePathOutput);

module.exports = cucumberProfileBuilder.createDefaultProfileForTestRun();
