# Welcome To SYSTAC (SYstem teSting with Testcafe And Cucumber)
This is a sample project that demonstrates integration of frameworks [TestCafe](https://github.com/DevExpress/testcafe) & [CucumberJS](https://github.com/cucumber/cucumber-js) using TestCafe 0.22.1-alpha.3 and Cucumber 5.0.2

Special thanks to [helen-dikareva](https://github.com/helen-dikareva/) & [rquellh](https://github.com/rquellh) for the inspiration in creating this repo as this is a fork of both those repositories [testcafe-cucumber-demo](https://github.com/helen-dikareva/testcafe-cucumber-demo) & [testcafe-cucumber](https://github.com/rquellh/testcafe-cucumber).

## Current Supported Features
* Run tests across multiple browsers (chrome, firefox, ie, edge and safari) and device types plus capability to run the tests in headless mode
* Ability to run tests in parallel (Note running in parallel with multiple configs to SauceLabs is blocked due to a bug detailed below)
* Run tests on docker containers (Note only chrome and firefox are only supported atm)
* Integration with CI providers SauceLabs & BrowserStack (NOTE: BrowserStack wasn't tested as I don't have a license but should be easy enough add)
* Test run reports that include screenshots and console browser logs as part of a standard automated test run

## Versions
<table>
<tr>
    <td>TestCafe</td>
    <td>0.22.1-alpha.3</td>
</tr>
<tr>
    <td>CucumberJS</td>
    <td>5.0.2</td>
</tr>
</table>

## Installation
1) Make sure [Node.js](https://nodejs.org/) is installed
2) Navigate to the root of the repo
3) Issue `npm install` command to install the framework

## Getting Started With SYSTAC

### Running scripts
```
"scripts":
{
    "e2e-test": "node ./node_modules/cucumber/bin/cucumber-js && node e2e/utilities/CleanupTagsInJsonReport",
    "e2e-test-parallel": "cross-env NUM_PARALLEL_Threads=$npm_package_config_num_parallel_threads node ./node_modules/cucumber/bin/cucumber-js && node e2e/utilities/CleanupTagsInJsonReport",
    "generate-docs": "node ./node_modules/.bin/jsdoc -c ./e2e/config/Json/JsDoc.json"
}
```
1) **e2e-test** -> Run tests on a single browser/device instance on the main thread via `npm run e2e-test`
2) **e2e-test-parallel** -> Run tests on multiple browsers/devices concurrently with multiple processes via `npm run e2e-test-parallel`
3) **generate-docs** -> Generate Docs of classes within ./e2e/ which gets wrote to relative path ./docs/ (uses JSDOC) via `npm run generate-docs`

### Framework Layout
Below I detail the intention of some of the files & folders within the framework
1)  **./docker** -> Contains docker specific files that allows the tests to be run on docker containers.
2)  **./e2e/config** -> Placeholder for Json and JavaScript files that is used to configure the cucumber test runner. Specifics include setting the cucumber profile, gathering metadata associated with the test run and agent the aut is staged on.
3)  **./e2e/cucumber** -> Here we keep cucumber files that are specific to the javascript flavour of cucumber for example world, step timeouts and tag hooks.
4)  **./e2e/gherkin** -> Folder location for all Gherkin test scenarios that was done within the context of SYSTAC framework.
5)  **./e2e/logger** -> Javascript logger that is used to log events/actions during the test run.
6)  **./e2e/page_object_pattern** -> The page object pattern for the framework which contains a base page and a project base page. The hierarchy is that the project base page inherits from the base page and all project pages inherit from the project base page.
7)  **./e2e/step_definitions** -> Here we keep test automation code that is used to drive a Gherkin test step.
8)  **./e2e/test_cafe** -> Location for TestCafe specific logic, namely we have functionality to create the autogenerated test cafe script, files to manage the test and post test execution phases between cucumber and TestCafe.
9)  **./e2e/velocity_templates** -> Used to generate the autogenerated test script via velocity templates.
10) **./reports** -> The output of a test run gets wrote to this location, namely a JSON report generated by cucumber, logs of the test run, metadata associated with the test environment and browser that stages the application under test plus screenshots.
11) **./cucumber.js** -> File that is used to configure the test runner based on the config within the package.json.
12) **./Dockerfile** -> This file creates a docker container that the tests would execute on when execution on a docker configuration is targeted.

### Configuring The Test Runner
```
"config":
{
    "suite-map": "all",
    "task-profile": "auto-regression-chrome",
    "parallel-task-profiles": [
        "auto-regression-chrome",
        "auto-regression-firefox"
    ],
    "num-parallel-threads": 2,
    "targeted-test-environment": "LOCAL_HOST",
    "cucumber-before-after-all-timeout": "180",
    "cucumber-step-timeout": "30",
    "output-directory": "./reports/",
    "winston-log-level": "silly"
}
```
Within the package.json file we have the following configuration keys. Details of each configuration key follow
1) **suite-map** -> Corresponds to a regex feature file path within folder './e2e/config/Json/SuiteMap.json', which typically aligns to an EPIC (i.e. a feature, customer request or business requirement).
2) **task-profile** -> Corresponds to a task execution job (To create a task profile we need a browser/device to render the application under test plus some tags to further refine what test scenarios we should be executing). Sample task profiles can be found at './e2e/config/Json/TaskProfiles.json'
3) **parallel-task-profiles** -> Is one or more task profiles for use within a parallel job.
4) **num-parallel-threads** -> This number should correspond to the number of parallel-task-profiles we define. If their is a mismatch then the test executor throws an exception and the test run fails.
5) **targeted-test-environment** -> The environment we want to run the tests against as the intention of the framework is that it is capable of running across multiple environment types.
6) **cucumber-before-after-all-timeout** -> Timeout for the cucumber `BeforeAll` & `AfterAll` phases. The use case for this more so is for when tests are run on SauceLabs or BrowserStack as a more generous timeout is needed to establish and close the tunnel to SauceLabs or BrowserStack providers.
7) **cucumber-step-timeout** -> Timeout for cucumber steps, the standard timeout for this is typically 30 seconds but this setting allows us to override that.
8) **output-directory** -> The directory where the output of the test run is wrote to, where a json, logs, screenshots & metadata folder get generated by the runner.
9) **winston-log-level** -> Used to configure the log level of the log provider.

### Updating Test Runner Configuration Dynamically
As the test runner configuration is coupled to NPM we have the ability to dynamically update any of the aforementioned test configuration keys within the package.json file on the fly. Below follows some example commands to update some of these configuration keys
```
#Changes the suite-map key to point to github
npm config set SYSTAC:suite_map github

#Changes the task-profile key to point to auto-regression-ie
npm config set SYSTAC:task_profile auto-regression-ie

#Changes the parallel-task-profile-1 key to point to auto-regression-safari
npm config set SYSTAC:parallel_task_profile_1 auto-regression-safari

#Adds parallel task auto-regression-edge to key parallel-task-profile
npm config set SYSTAC:parallel_task_profile_2 auto-regression-edge

```

### Running Tests On Docker
Currently the docker image supplied by TestCafe only supports running on Chrome & Firefox. To run the tests via docker on those browsers setup the runner configuration within package.json to be the following:
```
"config":
{
    "task-profile": "auto-regression-chromium",
    "parallel-task-profiles": [
        "auto-regression-chromium",
        "auto-regression-firefox"
    ],
    "num-parallel-threads": 2,
}
```
To build the docker container execute the following command from the project root directory:

`docker build --no-cache -t bhreinb/systac .`

To run the tests on docker execute the following commands from the project root directory once the previous step finishes:

**e2e-test:** `docker run --rm -it -v $PWD/e2e/:/opt/systac/e2e bhreinb/systac`

**e2e-test-parallel:** `docker run --rm -it -v $PWD/e2e/:/opt/systac/e2e bhreinb/systac npm run e2e-test-parallel`

****NOTE:*** the ideal situation would be an ability to configure the task profile config and run the test for example something like this*

*`docker run --rm -it -v $PWD/e2e/:/opt/systac/e2e bhreinb/systac npm config set SYSTAC:task_profile auto-regression-chrome && npm run e2e-test-parallel`*

*but I haven't figured a way to evolve the docker entry point script to cater for that `https://stackoverflow.com/questions/52592640/docker-entrypoint-script-to-support-one-or-two-or-both-commands-namely-npm-conf`*

*On CI environments a possible workaround would be like so*
```
#!/usr/bin/env bash
sed -ie 's/\"task-profile\": \"auto-regression-firefox\"/\"task-profile\": \"auto-regression-chromium\"/g' package.json
```
*which would be done straight after pulling the code and prior to building the docker image.*

### Running Tests On SauceLabs|BrowserStack
Update the package.json config so to target SauceLabs task profiles or alternatively dynamically update the config as detailed above. Note adjust the `cucumber-before-after-all-timeout` according to your environment type.

(NOTE: I found 180 seconds to be sufficient, in some cases this isn't needed in that it depends on the browser device type you are targeting, for example common devices/browsers typically need a 3rd of that time...something like a Samsung Galaxy Emulator more than likely needs the 3 minutes as it's created from scratch within SauceLabs).

At this point in time it's not possible to run the test on SauceLabs in parallel due to the following bug `https://github.com/DevExpress/testcafe-browser-provider-saucelabs/issues/27`.

In addition, to see what devices/browsers that we can run tests on SauceLabs execute the following command from the project root directory

`node ./node_modules/testcafe/bin/testcafe.js -b saucelabs`

Lastly, I haven't been able to test integration with BrowserStack provider as I don't have a license but if anybody wants to add a PR for that feel free to do so.

### Debugging (WebStorm)
I personally use WebStorm to do development work on NodeJs. To debug via WebStorm do the following:
```
1) Create a NPM configuration.
2) Set the package.json config within webstorm to use the package.json file within the project root directory.
3) Set Command to be `run`
4) Set Scripts to be `e2e-test`
5) Depending on the platform we are developing off windows or POSIX add the following environment variable to the npm script WINDOWS %NODE_DEBUG_OPTION% or POSIX (Unix/Mac/Etc) $NODE_DEBUG_OPTION
```
It's possible to debug up to a point using script `e2e-test-parallel` i.e. up to the cucumber.js aspect within the project root directory but debugging past that point isn't possible as new processes are forked to run the task profiles in parallel.

***NOTE:** On POSIX systems having that setting is ok for run or debug mode as the setting gets ignored in run mode but that is not the case for Windows systems which unfortunately throws an error (at the time of writing however Jetbrains intends to have parity soon with POSIX behaviour). Jetbrains have a ticket open to address this which can be found here @ https://youtrack.jetbrains.com/issue/WEB-34226*

### Debugging (Visual Studio Code)
I didn't spend any time as such trying to debug via Visual Studio Code so if anybody would like to add details on that please feel free to submit a PR.

## Transposing Test Scenarios With SYSTAC

### Intention Of Gherkin Tags

We use tags primarily for two purposes (albeit it can be used for another testing use case). Current tags used are list

<table>
<tr>
    <td>Browser/Device Tags</td>
    <td>@chrome</td>
    <td>@firefox</td>
    <td>@safari</td>
    <td>@edge</td>
    <td>@ie</td>
    <td>@chromeHeadless</td>
    <td>@firefoxHeadless</td>
    <td>@samsung</td>
    <td>@android</td>
    <td>@ipad</td>
    <td>@iphone</td>
</tr>
<tr>
    <td>Test Subset</td>
    <td>@auto_regression</td>
    <td>@auto_smoke</td>
    <td>@manual_regression</td>
</tr>
<tr>
    <td>Setup/TearDown</td>
    <td>@setup_etc</td>
    <td>@tearDown_etc</td>
</tr>
</table>

At a minimum tests defined in Gherkin need to be tagged with a Browser/Device type and test subset in order for the test to be picked up by the cucumber runner. We can also define tags that can be used for setup and tearDown for a particular test scenario.

### Converting Gherkin Test Logic To JavaScript Steps

I use [TidyGherkin](https://chrome.google.com/webstore/detail/tidy-gherkin/nobemmencanophcnicjhfhnjiimegjeo?hl=en-GB) a chrome app to help convert Gherkin logic to JavaScript steps. TidyGherkin gives the empty method signatures in Ruby, Java & JavaScript for each Gherkin step.

![TidyGherkin](https://automationpanda.files.wordpress.com/2017/11/tidy-gherkin-editor.png?w=940)

![TidyGherkin JavaScript Steps](https://automationpanda.files.wordpress.com/2017/11/tidy-gherkin-javascript-steps.png)

Naturally the engineer would need to add the test automation code to these empty implementation methods. Out of the box TidyGherkin gives the following JS steps

```
  this.When(/^I am typing my search request \"([^\"]*)\" on GitHub$/, function (testcafe, callback) {
    callback.pending();
  });
```

which by default includes a callback, the recommended approach is to return a promise

```
  this.When(/^I am typing my search request \"([^\"]*)\" on GitHub$/, function (testcafe) {
    return Promise.resolve();
  });
```

Lastly, the step implementation code typically is stored within folder location `./e2e/step_definition/`.

### Writing DOM Locators With SYSTAC
TestCafe out of the box supports a number of location strategies which can be found here @ `http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors.html`. When running TestCafe via Cucumber context for each cucumber test scenario we do the following
1) Capture the TestCafe controller instance to cucumber context
2) Write the TestCafe controller instance to the global.process in node
3) Once the TestCafe controller instance exists in the global.process in node we send commands to control the browser as per normal

Because the selectors are called outside TestCafe test function context (http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors/edge-cases-and-limitations.html) we pretty much have to bind the test controller context to the selector (which is done via [boundTestRun](http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors/selector-options.html#optionsboundtestrun)).

We somewhat alleviate this overhead by providing reusable methods within file './e2e/page_object_pattern/BasePage.js' so that every selector defined within the framework don't need to be written with `boundTestRun`.

### Page Object Pattern Within SYSTAC
We typically store all DOM locators & business functions for the application under test using a page object pattern. The page object pattern works like so
1) The `BasePage` houses all helper functions that can be used across multiple projects or application under tests (i.e. support reuse across multiple test projects).
2) The `SystacBasePage` contains element locators and business functions that exist across multiple pages for the specific application under test we are testing against (i.e. support reuse across multiple pages within a single test project).
3) The Individual pages contains locators and business functions specific to a page that is part of a specific application under test (i.e specific implementation for a page for use on one application under test).

When creating a new page object an engineer must do the following:
1) Create the page object within folder location `./e2e/page_object_pattern` and set the url property (not the url specified here gets added to `BaseUrls.json` file automatically by the framework thus allowing the page object to work across multiple environment types).
2) Export the page object with this syntax `module.exports.pageObject` (doing that means it gets auto picked up by the framework whenever a test run is initiated).
3) Implement the page object (specifically inherit from the project base page in this case `SystacBasePage.js` and implement the `pageLoaded` method, further details re that follow)

A requirement of the page object pattern is that a `pageLoaded` method is implemented for each page object, which is used to identify whether we are at the target page post initiation of a navigation event. The `pageLoaded` method typically checks the page title for example and potentially can be combined with another unique element that exists on the page. Below is an example of a page loaded method for GitHub features page

```
pageLoaded() {
    return this.testCafeSelectElementByCssString('title').innerText.then(text => text === this.pageLoadedText);
  }
```

All navigation events go through function `testCafeNavigateToPage` which behind the scenes uses TestCafe API `navigateTo`. We do that via this means so to maintain a reference internally of what page the test automation should be executing against so that we don't need to maintain what page we are on using Gherkin steps. Hence why we can use the following method

`const pageInstance = this.getPageObjectFromCurrentPage();`

predominately within step_definitions to establish what page object the test step should be executing against. Lastly, all page objects found within directory `./e2e/page_object_pattern` are made available to the world instance for use within cucumber steps.

### Coding Cucumber Steps Definitions With TestCafe
To code a cucumber step with TestCafe we typically need the following:
1) A reference to the TestCafe controller within the step context (we typically do that via this statement `const { testCafeTestController } = global.process;`)
2) A reference to the page object for a step definition (this can vary depending on what step we are at...if it's the first step in the test scenario i.e. `Given` typically we pass the page name from Gherkin & get a reference to the page using `const pageInstance = this.getPageObjectFromName(pageName);` otherwise if previous steps did navigation via `testCafeNavigateToPage` then we can get a reference to a page using `const pageInstance = this.getPageObjectFromCurrentPage();`)

Once the above two conditions are satisfied then it's possible to send any commands TestCafe commands to the application under test just like one would do within a TestCafe Runner. Below are some sample steps

```
Given(/^The "([^"]*)" page$/, async function openPage(pageName) {
  const pageInstance = this.getPageObjectFromName(pageName);
  const { testCafeTestController } = global.process;
  const pageNav = await pageInstance.testCafeNavigateToPage(this.page);
  await testCafeTestController.expect(pageNav)
    .ok(`Failed To Navigate To Page Name [${pageInstance.pageName}]`);
});

When(/^I am typing my search request "([^"]*)" on GitHub$/, async function typeSearchRequest(text) {
  const pageInstance = this.getPageObjectFromCurrentPage();
  const { gitHubSearchBox } = pageInstance;
  await this.classBasePage.testCafeActionsTypeText(gitHubSearchBox, text, {});
});

Then(/^I am pressing (.*) key on GitHub$/, async (text) => {
  await this.classBasePage.testCafeActionsPressKey(text, {});
});

Then(/^I should see that the first GitHub's result is (.*)$/, async function getFirstResult(text) {
  const pageInstance = this.getPageObjectFromCurrentPage();
  const { testCafeTestController } = global.process;
  await testCafeTestController.expect(pageInstance.firstResultPostSearch.innerText).contains(text);
});
```
Rule of thumb with Gherkin & Cucumber, every test scenario should resolve to a GWT. A brief synopsis of the intention of each follows

***`Given`*** is used to bring the application under test to a known initial state

***`When`*** is used to represent the occurrence of an event/action

***`Then`*** is used to do assertions at a certain point in the test process

All of the above can exist as multiples, ie you could need more than one step to put a test scenario into a known state. This is achieved through Gherkin `And` & `But` which would naturally map to JavaScript steps.

## Test Runner Output
The runner generates creates four folders within the output directory we set in the package.json file
```
"config":
{
    "output-directory": "./reports/"
}
```
They are detailed below:
1) folder `json` -> Within this folder you will find the json report that gets generated at the end of a test run by cucumber, which has browser console logs and screenshots embedded in it by the cucumber runner.
2) folder `logs` -> Here you will find test runner logs for the test run (we use winston to record the test run logs which outputs to a log file and the console).
3) folder `metadata` -> We capture in this folder aspects of the test runner for example how it was configured for the test run plus agent data the test was run against.
4) folder `screenshots` -> Within this folder we capture screenshots when a failure occurs (by default screenshots get added to the JSON report per item 1).
5) folder `tags` -> Within this folder we capture execution tags per test scenario for each task profile.

As the runner outputs the items 1) & 3) this allows us to report on a test run using the following reporting modules

* https://github.com/damianszczepanik/cucumber-reporting
* https://github.com/jenkinsci/cucumber-reports-plugin
* https://github.com/damianszczepanik/maven-cucumber-reporting

A preview of what those test reports look like follow:

![feature overview page](https://github.com/damianszczepanik/cucumber-reporting/raw/master/.README/feature-overview.png)

![feature specific page passing](https://github.com/damianszczepanik/cucumber-reporting/raw/master/.README/feature-passed.png)

![feature specific page passing](https://github.com/damianszczepanik/cucumber-reporting/raw/master/.README/feature-failed.png)

![Tag overview](https://github.com/damianszczepanik/cucumber-reporting/raw/master/.README/tag-overview.png)

![Tag report](https://github.com/damianszczepanik/cucumber-reporting/raw/master/.README/tag-report.png)

![Trends report](https://github.com/damianszczepanik/cucumber-reporting/raw/master/.README/trends.png)

## Known Issues

As mentioned above their is one or two issues open I detail them below:
1) [Unable To Open Two Saucelabs Connections Concurrently Using This Module](https://github.com/DevExpress/testcafe-browser-provider-saucelabs/issues/27)
2) [Ability To Wrap Step Definitions & Hooks In A Class In CucumberJs](https://github.com/cucumber/cucumber-js/issues/1120)
3) [t.takeElementScreenshots can't detect page area in some cases](https://github.com/DevExpress/testcafe/issues/2918)

## Notes

* As of the time I am writing this, there is only 1 passing test of 5. I decided to not make all of the tests passing, so you could see how failures are handled.
