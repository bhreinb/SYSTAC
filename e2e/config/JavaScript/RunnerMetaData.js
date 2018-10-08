const BaseMetaData = require('./BaseMetaData');

/**
 * A class to gather metadata about the test runner environment.
 */
class RunnerMetaData extends BaseMetaData {
  /**
   * Creates an instance of RunnerMetaData.
   */
  constructor() {
    super();
    this.runnerMetaDataFilePathOutput = `${this.outputDirectory}metadata/testRunnerMetaData.properties`;
    this.init();
  }

  /**
   * Adds runner metadata to the version info object.
   */
  init() {
    const runnerMetaData = [
      RunnerMetaData.getNodeJsVersion,
      RunnerMetaData.getNpmVersion,
      RunnerMetaData.getTargetedTestEnvironment,
      RunnerMetaData.getSuite,
      RunnerMetaData.getTaskProfiles,
    ];
    runnerMetaData.forEach((arrayElement) => {
      const key = arrayElement.name.replace(/get/, '');
      const value = arrayElement.apply(this, null);
      this.addMetaDataPascalCaseKey(key, value);
    });
  }

  /**
   * Get NodeJs version the test run is initiated from.
   */
  static getNodeJsVersion() {
    return process.versions.node;
  }

  /**
   * Get Npm version the test run is initiated from.
   */
  static getNpmVersion() {
    // JavaScript Doesn't Support Lookbehind Regex Hence This...
    const lookBehindString = 'npm/';
    const npmString = process.env.npm_config_user_agent;
    const npmRegex = new RegExp(`(?=${lookBehindString})(.*?)(?=\\s+node)`, 'g');
    let npm = '';
    if (npmRegex.test(npmString)) {
      // We Expect One Result Returned Hence Why We Use Pop...
      npm = npmString.match(npmRegex).pop() || '';
      if (npm) {
        npm = npm.replace(lookBehindString, '');
      }
    }
    return npm;
  }

  /**
   * Get targeted environment type the tests are running on.
   */
  static getTargetedTestEnvironment() {
    return process.env.npm_package_config_targeted_test_environment;
  }

  /**
   * Get suite we are testing against.
   */
  static getSuite() {
    return process.env.npm_package_config_suite_map;
  }

  /**
   * Gets the executor task or tasks for the test run (latter is
   * for parallel jobs).
   */
  static getTaskProfiles() {
    const tasks = [];
    if (process.env.NUM_PARALLEL_Threads > 0) {
      let i = 0;
      while (process.env[`npm_package_config_parallel_task_profiles_${i}`]) {
        const currentExaminedProfile = process.env[`npm_package_config_parallel_task_profiles_${i}`];
        tasks.push(currentExaminedProfile);
        i += 1;
      }
    } else {
      const task = process.env.npm_package_config_task_profile;
      tasks.push(task);
    }
    return tasks.join(',');
  }
}

module.exports = RunnerMetaData;
