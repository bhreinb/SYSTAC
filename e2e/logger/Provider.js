const {
    createLogger, format, transports, config,
} = require('winston');
const split = require('split');

const {
    combine, timestamp, label, printf, colorize, prettyPrint,
} = format;

const TransportsEnum = Object.freeze({ CONSOLE: 0, FILE: 1 });

/**
 * A class used to create the logger provider "winston".
 */
class Provider {
    /**
     * Creates an instance of logger provider.
     */
    constructor() {
        const outputDirectory = process.env.npm_package_config_output_directory;
        this.logger = createLogger({
            levels: config.npm.levels,
            transports: [
                new transports.Console({
                    level: Provider.getLoggerLevel(),
                    format: Provider.getFormat(TransportsEnum.CONSOLE),
                }),
                new transports.File({
                    level: Provider.getLoggerLevel(),
                    format: Provider.getFormat(TransportsEnum.FILE),
                    filename: `${outputDirectory}logs/${Provider.frameWorkNameAndVersion()}_test_run_pid_${process.pid}.log`,
                }),
            ]
            ,
        });
        this.logger.writeToStream = this.processStream();
        this.logger.debug('Initialising The Logger For The Test Run!!!');
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
     * Used to set the logger level for the provider which is read from NPM config.
     */
    static getLoggerLevel() {
        return `${process.env.npm_package_config_winston_log_level}`;
    }

    /**
     * Used to get the framework name and version which gets printed by the logger provider.
     */
    static frameWorkNameAndVersion() {
        return `${process.env.npm_package_name}@${process.env.npm_package_version}`;
    }

    /**
     * Used to get the format for all the transports we define for the logger provider.
     */
    static getFormat(transportType) {
        const standardFormat = [
            label({ label: Provider.frameWorkNameAndVersion() }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            prettyPrint(),
            Provider.logFormat(),
            colorize({ all: true }),
        ];
        if (transportType === TransportsEnum.CONSOLE) { standardFormat.unshift(colorize()); }
        return combine(...standardFormat);
    }

    /**
     * Applies custom formatting to messages that are sent to the logger instance.
     */
    static logFormat() {
        return printf(info => `${info.timestamp} {${info.label}} [${info.level}]: ${info.message}`);
    }
}

module.exports.logger = new Provider().logger;
