const { createLogger, format, transports } = require('winston');
const split = require('split');

const {
  combine, timestamp, label, printf,
} = format;

/**
 * A class used to create the logger provider "winston".
 */
class Provider {
  /**
   * Creates an instance of logger provider.
   */
  constructor() {
    const outputDirectory = process.env.npm_package_config_output_directory;
    const frameworkName = `${process.env.npm_package_name}@${process.env.npm_package_version}`;
    this.logger = createLogger({
      level: 'info',
      format: combine(
        label({ label: frameworkName }),
        timestamp(),
        Provider.logFormat(),
      ),
      transports: [
					new transports.File({ filename: `${outputDirectory}logs/${frameworkName}_test_run_pid_${process.pid}.log` }),
					new transports.Console()
				]
      ,
    });
    this.logger.writeToStream = this.processStream();
    this.logger.info('Initialising The Logger For The Test Run!!!');
  }

  /**
   * Used to process data that comes from a readable stream so to capture that data to the logger
   * instance.
   */
  processStream() {
    return split()
      .on('data', (dataMessage) => { this.logger.info(dataMessage); })
      .on('error', (errorMessage) => { this.logger.error(errorMessage); })
      .on('end', (endMessage) => {
        this.logger.info(endMessage);
        this.logger.info('All the data in the stream has been read');
      })
      .on('close', (closeMessage) => {
        this.logger.info(closeMessage);
        this.logger.info('Stream has been destroyed and file has been closed');
      });
  }

  /**
   * Applies custom formatting to messages that are sent to the logger instance.
   */
  static logFormat() {
    return printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);
  }
}

module.exports.logger = new Provider().logger;
