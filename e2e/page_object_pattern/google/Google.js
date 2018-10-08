const ProjectBasePage = require('../SystacBasePage.js');

class Google extends ProjectBasePage {
  constructor(url) {
    super(url);
    this.init();
  }

  init() {
    super.init();
    this.googleSearchBox = this.testCafeSelectElementByCssString('#lst-ib');
    this.googleFirstSearchResult = this.testCafeSelectElementByCssString('#rso').find('a');
    this.pageLoadedText = 'Google';
  }

  pageLoaded() {
    return this.testCafeSelectElementByCssString('title').innerText.then(text => text === this.pageLoadedText);
  }
}

module.exports = Google;
