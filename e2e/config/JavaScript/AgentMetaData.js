const BaseMetaData = require('./BaseMetaData');
const process = require('process');

/**
 * A class to gather metadata about the agent the tests are run against.
 * Agent meaning the browser the application under test is rendered on
 * plus the operating system used to host the browser.
 */
class AgentMetaData extends BaseMetaData {
    /**
     * Creates an instance of AgentMetaData.
     */
    constructor() {
        super();
        this.agentMetaDataFilePathOutput = `${this.outputDirectory}metadata/${this.frameworkName}_agent_meta_data_pid_${process.pid}.properties`;
        this.init();
    }

    /**
     * Adds agent metadata to the version info object.
     */
    init() {
        const agentMetaData = [
            AgentMetaData.addPidToTaskAssignment(),
            AgentMetaData.addBrowserPlusOperatingSystemMetaData(),
        ];
        const allAgentMetaDataInKeyValuePairs = Array.prototype.concat.apply([], agentMetaData);
        allAgentMetaDataInKeyValuePairs.forEach((obj) => {
            if (obj) {
                this.addMetaData(obj.key, obj.value);
            }
        });
    }

    /**
     * Adds the PID to task assignment for the test run.
     */
    static addPidToTaskAssignment() {
        const { CUCUMBER_PARALLEL, CUCUMBER_SLAVE_ID } = process.env;
        let taskProfileName = '';
        if (CUCUMBER_PARALLEL) {
            const parallelJob = process.env[`npm_package_config_parallel_task_profiles_${CUCUMBER_SLAVE_ID}`];
            taskProfileName = parallelJob || 'auto_regression_chrome';
        } else {
            taskProfileName = process.env.npm_package_config_task_profile || 'auto_regression_chrome';
        }
        return [{ key: `Task_Profile_PID#${process.pid}`, value: taskProfileName }];
    }

    /**
     * Adds the browser and operating system the tests are run against per particular
     * test task execution.
     */
    static addBrowserPlusOperatingSystemMetaData() {
        const { testCafeTestController } = global.process;
        const { browserConnection } = testCafeTestController.testRun;
        const { browserInfo } = browserConnection;
        const { userAgent } = browserInfo;
        let browserAndOs = userAgent.split('/');
        browserAndOs = browserAndOs.map(arrayElement => `${arrayElement.trim(' ')}`);
        // We assume browser info is stored in index 0 & os details in index 1...
        const osDetails = browserAndOs.pop();
        const browserDetails = browserAndOs.pop();
        return [{ key: `Browser_PID#${process.pid}`, value: browserDetails }, { key: `Os_PID#${process.pid}`, value: osDetails }];
    }
}

module.exports = AgentMetaData;
