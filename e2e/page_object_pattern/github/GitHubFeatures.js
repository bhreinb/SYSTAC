const ProjectBasePage = require('../SystacBasePage.js');

class GitHubFeatures extends ProjectBasePage {
  constructor(url) {
    super(url);
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

module.exports = GitHubFeatures;
