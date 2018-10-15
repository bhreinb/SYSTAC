const { Selector, Role, ClientFunction } = require('testcafe');
const env = require('../config/Json/BaseUrls.json');

/**
 * A class to hold common cross functional project functions and properties
 * for the purpose of interacting with the application under test.
 * All project pages inherit this page.
 */
class BasePage {
    /**
     * Creates an instance of BasePage.
     */
    constructor() {
        this.url = '';
        this.testCafeSelector = Selector;
        this.pageName = this.constructor.name;
        this.targetTestEnvironemnt = env[process.env.npm_package_config_targeted_test_environment || 'all'];
    }

    /**
     * The testCafeNavigateToPage method internally use method 'pageLoaded' to do navigation from
     * one page to another, in cases where the 'pageLoaded' method isn't implemented an
     * exception is thrown thus causing the test to fail
     */
    pageLoaded() {
        throw new Error(`You have to implement method 'pageLoaded' within class ${this.pageName} to follow the page object pattern!!!`);
    }

    /**
     * This method gets the applicable domain name based on the constructor name of the
     * parent class as the page object name should align to the baseUrls we are testing against.
     * @param {Object} baseUrls An object which has a record of all the possible domains the
     * framework needs to test against
     * @returns {String} Returns the resolved domain name that matches the pattern of the constructor
     * name of the parent class otherwise it throws an exception if it can't find a pattern that
     * matches the constructor name of the parent class
     */
    getDomainNameOfPage(baseUrls) {
        const domain = Object.keys(baseUrls).find(p => this.pageName.startsWith(p, 0));
        if (!domain) {
            throw new Error(`PageName [${this.pageName}] doesn't align to any baseUrls {${JSON.stringify(baseUrls)}} for this environment type!!!`);
        } else {
            return baseUrls[domain];
        }
    }

    /**
     * This method initiates navigation to a target url which is set from the inherited page
     * url and checks whether the page is loaded correctly via its project specific pageLoaded method.
     * Within the world object we maintain a reference of the current page so not to maintain that
     * through Gherkin steps.
     * @param {Object} page An object to keep a reference of the applications under test
     * current page we are currently on
     * @returns {Promise} Returns a promise which either resolves to true or false
     * to indicate we are at a certain page
     */
    testCafeNavigateToPage(page) {
        const { baseUrls } = this.targetTestEnvironemnt;
        const { testCafeTestController } = global.process;
        const domainName = this.getDomainNameOfPage(baseUrls);
        const prmNav = testCafeTestController.navigateTo(domainName + this.url);
        return prmNav.then(() => this.testCafeCheckIfPageIsLoadedUpdatingReference(page));
    }

    /* eslint no-param-reassign:
      ["error", { "props": true, "ignorePropertyModificationsFor": ["page"] }] */
    /**
     * This method checks that we are at a certain page at a point in time. Useful for navigation
     * events initiated by the user or as a side effect of clicking a control item belonging to
     * the application under test. In addition it updates the reference to the current page of the
     * application under test the framework is pointing at.
     * @param {Object} page An object to keep a reference of the applications under test
     * current page we are currently on
     * @returns {Promise} Returns a promise which either resolves to true or false
     * to indicate we are at a certain page
     */
    testCafeCheckIfPageIsLoadedUpdatingReference(page) {
        return this.pageLoaded().then((isPageLoaded) => {
            if (isPageLoaded) {
                page.current = this;
            }
            return isPageLoaded;
        });
    }

    /**
     * Selects an element via a CSS string expression
     * @param {string} cssLocator A Css reference to the element on the page,
     * use chrome dev tools to determine the css cssLocator
     * @returns {Selector} Returns a selector essentially a promise which resolves to a
     * reference to the element we are interested in interacting with
     */
    testCafeSelectElementByCssString(cssLocator) {
        const { testCafeTestController } = global.process;
        return this.testCafeSelector(cssLocator).with({ boundTestRun: testCafeTestController });
    }

    /**
     * Selects an array of elements via a CSS expression and filters by index on that matching set.
     * The index parameter is zero-based. If index is negative, the index is counted from the end
     * of the matching set. See http://devexpress.github.io/testcafe/documentation/test-api/selecting-page-elements/selectors/functional-style-selectors.html#nth
     * @param {String} locator A Css reference to a set of elements on the page,
     * use chrome dev tools to determine the css locator
     * @param {Number} index A zero-based index of the element. If negative, then counted from the
     * end of the matching set.
     * @returns {Selector} Returns a selector essentially a promise which resolves to a
     * reference to the element we are interested in interacting with
     */
    testCafeSelectElementsByCssStringFilteredByIndex(locator, index) {
        const { testCafeTestController } = global.process;
        return this.testCafeSelector(locator)
            .nth(index).with({ boundTestRun: testCafeTestController });
    }

    /**
     * Creates a user defined test cafe role that handles common functionality for example
     * authentication or switching user throughout a test, see http://devexpress.github.io/testcafe/documentation/test-api/authentication/user-roles.html
     * @param {String} url - The url of the login page
     * @param {Function} fnActionsForRole - An asynchronous function that contains logic
     * that authenticates the user
     * @param {Array} optionalArgs - An array of arguments to the passed to the asynchronous function
     * that defines the logic within the role
     * @param {Boolean} preserveUrl - A true or false argument to control which page is opened after
     * you switch to the role. By default, TestCafe navigates back to the page that was opened
     * previously to switching to the role
     * @returns {Promise} Returns a promise that resolves to a set of actions been applied to the
     * application under test as defined in the asynchronous function
     */
    testCafeCreateUserDefinedRole(url, fnActionsForRole, optionalArgs, preserveUrl) {
        const { baseUrls } = this.targetTestEnvironemnt;
        const domainName = this.getDomainNameOfPage(baseUrls);
        return Role(domainName + url, (t) => {
            optionalArgs.unshift(t);
            return fnActionsForRole.apply(this, optionalArgs).then(() => t);
        }, { preserveUrl });
    }

    /**
     * Gets text from an array of elements and return to the calling function as an array of strings
     * via http://devexpress.github.io/testcafe/documentation/test-api/actions/type-text.html.
     * @param {String} cssLocator - The Css locator to query that will target an array of elements
     * @returns {Promise} Returns a promise that resolves to an array of strings got from each
     * array element
     */
    static testCafeGetTextFromArrayOfElementsViaClientFunction(cssLocator) {
        const { testCafeTestController } = global.process;
        const func = ClientFunction(() => {
            const items = document.querySelectorAll(cssLocator);
            const itemsValues = [];
            items.forEach(item => itemsValues.push(item.textContent));
            return itemsValues;
        }, { dependencies: { cssLocator } }).with({ boundTestRun: testCafeTestController });
        return func();
    }

    /**
     * Types the specified text into an input element http://devexpress.github.io/testcafe/documentation/test-api/actions/type-text.html.
     * @param {Selector} selector - Identifies the web page element that will receive input focus.
     * @param {String} text - The text to be typed into the specified web page element.
     * @param {Object} options - A set of options that provide additional parameters for the action.
     * @returns {Promise} Returns a promise that resolves to the specified text been sent to
     * an input element.
     */
    static testCafeActionsTypeText(selector, text, options) {
        const { testCafeTestController } = global.process;
        return testCafeTestController.typeText(selector, text, options);
    }

    /**
     * Presses the specified keyboard keys http://devexpress.github.io/testcafe/documentation/test-api/actions/press-key.html.
     * @param {String} keys - The sequence of keys and key combinations to be pressed.
     * @param {Object} options - A set of options that provide additional parameters for the action.
     * @returns {Promise} Returns a promise that resolves to the specified keys been pressed
     */
    static testCafeActionsPressKey(keys, options) {
        const { testCafeTestController } = global.process;
        return testCafeTestController.pressKey(keys, options);
    }
}

module.exports = BasePage;
