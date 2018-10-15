const { emptyDirSync, ensureDirSync } = require('fs-extra');
const suiteMap = require('../Json/SuiteMap.json');
const taskProfiles = require('../Json/TaskProfiles.json');

const common = [
    '--require ./e2e/step_definitions/*.js',
    '--require ./e2e/cucumber/*.js',
].join(' ');

/**
 * A class to build the cucumber profile which gets parsed by the cucumber runner based on
 * the config within the package.json file. Specifically this class configures paths to
 * cucumber specific files, tags for the test runner and what feature files should be
 * executed as part of a test execution.
 */
class CucumberProfileBuilder {
    /**
     * Creates an instance of CucumberProfileBuilder.
     */
    constructor() {
        this.suiteForTestRun = suiteMap[process.env.npm_package_config_suite_map || 'all'];
        this.taskProfileForTestRun = null;
        this.isParallelJob = false;
        this.parallelForTestExecution = '';
        this.tagsForTestExecution = '';
        this.outputFormat = '';
        this.outputDirectory = process.env.npm_package_config_output_directory;
    }

    /**
     * Used to create the output directories for the test run.
     */
    init() {
        emptyDirSync(`${this.outputDirectory}`);
        ensureDirSync(`${this.outputDirectory}json`);
        ensureDirSync(`${this.outputDirectory}logs`);
        ensureDirSync(`${this.outputDirectory}metadata`);
        ensureDirSync(`${this.outputDirectory}tags`);
    }

    /**
     * Checks Whether the current running npm script is a parallel Job or not. If it is then
     * we setup the default cucumber profile accordingly to accept multiple tag combinations.
     */
    checkIfParallelJob() {
        if (process.env.NUM_PARALLEL_Threads > 0) {
            this.isParallelJob = true;
            this.parallelForTestExecution = ` --parallel ${process.env.NUM_PARALLEL_Threads}`;
        }
    }

    /**
     * Used to set the tags for the cucumber runner which is processed from the passed in task
     * profile or profiles, the latter in the case of a parallel job. The cucumber runner determines
     * what subset of test scenarios will be executed as a result of examining what tags are on a
     * test scenario.
     */
    setTheTagsForTheTestExecution() {
        if (this.isParallelJob) {
            let i = 0;
            let j = i + 1;
            while (process.env[`npm_package_config_parallel_task_profiles_${i}`]) {
                const currentExaminedProfile = process.env[`npm_package_config_parallel_task_profiles_${i}`];
                if (currentExaminedProfile && process.env[`npm_package_config_parallel_task_profiles_${j}`]) {
                    this.tagsForTestExecution += `(${taskProfiles[currentExaminedProfile].tags.join(' ')}) or `;
                } else if (currentExaminedProfile && !process.env[`npm_package_config_parallel_task_profiles_${j}`]) {
                    this.tagsForTestExecution += `(${taskProfiles[currentExaminedProfile].tags.join(' ')})`;
                    this.tagsForTestExecution = ` --tags "${this.tagsForTestExecution}"`;
                }
                i += 1;
                j += 1;
            }
            if (i !== parseInt(process.env.NUM_PARALLEL_Threads, 10)) {
                throw (new Error('Number Of Parallel Threads Defined Within Package.json Does Not Match Number Of Parallel Jobs'));
            }
        } else {
            this.taskProfileForTestRun = taskProfiles[process.env.npm_package_config_task_profile || 'auto_regression_chrome'];
            this.tagsForTestExecution = ` --tags "${this.taskProfileForTestRun.tags.join(' ')}"`;
        }
    }

    /**
     * Used to set the output format for the test run which is typically a JSON file.
     */
    setTheJsonOutputFile() {
        const frameworkName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
        this.outputFormat = ` --format json:${this.outputDirectory}json/${frameworkName}_report_pid_${process.pid}.json`;
    }

    /**
     * Used to create the default profile for the cucumber runner. This is a result of parsing config
     * from the package.json and determining the type of execution job that is been executed.
     */
    createDefaultProfileForTestRun() {
        return {
            default: `${this.suiteForTestRun} ${common} ${this.tagsForTestExecution} ${this.parallelForTestExecution} ${this.outputFormat}`,
        };
    }
}

module.exports = CucumberProfileBuilder;
