const SystacBasePage = require('../SystacBasePage.js');

class GitHubHome extends SystacBasePage {
    constructor() {
        super();
        this.url = 'home';
        this.init();
    }

    init() {
        super.init();
        this.gitHubSearchBox = this.testCafeSelectElementByCssString('.header-search-input');
        this.invalidUserPasswordDialog = this.testCafeSelectElementByCssString('#js-flash-container > div > div');
        this.signOnButton = this.testCafeSelectElementByCssString('.btn.btn-primary.btn-block');
        this.signOnRole = this.testCafeCreateUserDefinedRole(this.url, this.signOntoGithub, [], false);
        this.resultSignOnRole = '';
        this.pageLoadedText = 'GitHub Fail';
    }

    pageLoaded() {
        return this.testCafeSelectElementByCssString('title').innerText.then(text => text === this.pageLoadedText);
    }

    signOntoGithub(t) {
        // Actually Expects 'Incorrect username or password.'
        return t.click(this.signOnButton).then(() => {
            this.invalidUserPasswordDialog.innerText.then((text) => {
                this.resultSignOnRole = text;
                return text;
            });
        });
    }
}

module.exports.pageObject = GitHubHome;
