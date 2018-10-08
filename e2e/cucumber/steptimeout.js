const { setDefaultTimeout } = require('cucumber');

setDefaultTimeout(process.env.npm_package_config_cucumber_step_timeout * 1000);
