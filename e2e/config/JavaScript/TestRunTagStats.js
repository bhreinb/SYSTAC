const taskProfiles = require('../Json/TaskProfiles.json');
const { logger } = require('../../logger/Provider');
const { outputFileSync } = require('fs-extra');

/**
 * A class to gather what runner tags were used for each test scenario in the test executor run.
 */
class TestRunTagStats {
    /**
     * Creates an instance of TestRunTagStats.
     * @param {Map} testScenariosInRun A map of the names of the test scenarios between CucumberJs
     * and TestCafe
     */
    constructor(testScenariosInRun) {
        const frameworkName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
        this.testScenariosInRun = testScenariosInRun;
        this.tagsForThisTestRun = TestRunTagStats.getTagsPartOfThisTestRun();
        this.outputDirectory = process.env.npm_package_config_output_directory;
        this.tagsFilePathOutput = `${this.outputDirectory}tags/${frameworkName}_tags_stats_pid_${process.pid}.json`;
    }

    /**
     * Writes out the tag executors that was used for a test scenario, very useful in the case
     * of a parallel run.
     */
    writeOutTagStatsForTheTestRun() {
        const statsForTestRun = [];

        this.testScenariosInRun.forEach((value, key) => {
            logger.verbose(`Cucumber Test Scenario Name ${key} Which Equates To TestCafe Name ${value} Used Tags [${this.tagsForThisTestRun.join()}] In This Test Run`);
            statsForTestRun.push({ scenario: key, tags: this.tagsForThisTestRun });
        });
        const stringToWrite = JSON.stringify(statsForTestRun, null, 2);
        outputFileSync(this.tagsFilePathOutput, stringToWrite);
    }

    /**
     * Returns the tags that was used to select the browser that the tests run on plus the execution
     * subset of the test run.
     * @return {object} Returns the tags that were used to define the automated test run.
     */
    static getTagsPartOfThisTestRun() {
        const regexTagsPattern = new RegExp('(?=@)(.*?)(?=\\s+|$)', 'g');
        const { CUCUMBER_PARALLEL, CUCUMBER_SLAVE_ID } = process.env;
        let taskProfileName = '';
        if (CUCUMBER_PARALLEL) {
            const parallelJob = process.env[`npm_package_config_parallel_task_profiles_${CUCUMBER_SLAVE_ID}`];
            taskProfileName = parallelJob || 'auto_regression_chrome';
        } else {
            taskProfileName = process.env.npm_package_config_task_profile || 'auto_regression_chrome';
        }
        const { tags } = taskProfiles[taskProfileName];
        return tags.map((tag) => {
            let retVal = tag;
            if (regexTagsPattern.test(tag)) {
                // We Expect One Result Returned Hence Why We Use Pop...
                retVal = tag.match(regexTagsPattern)
                    .pop();
            }
            return retVal;
        });
    }
}

module.exports = TestRunTagStats;
