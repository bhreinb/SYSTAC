const SystacBasePage = require('../SystacBasePage.js');

class GitHubFeatures extends SystacBasePage {
    constructor() {
        super();
        this.url = 'features';
        this.init();
    }

    init() {
        super.init();
        this.pageLoadedText = 'Features · The right tools for the job · GitHub';
        this.gitHubFeaturesCssLocator = 'a span.d-block';
    }

    pageLoaded() {
        return this.testCafeSelectElementByCssString('title').innerText.then(text => text === this.pageLoadedText);
    }
}

module.exports.pageObject = GitHubFeatures;
