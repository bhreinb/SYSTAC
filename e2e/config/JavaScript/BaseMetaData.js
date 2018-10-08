const { outputFileSync } = require('fs-extra');
const pascalCase = require('pascalcase');

/**
 * A class that all metadata classes inherit from. The intention of this class is
 * to provide helper methods that all metadata classes will use, for instance converting
 * an object to properties file and writing that properties file to the file system.
 */
class BaseMetaData {
  /**
   * Creates an instance of BaseMetaData.
   */
  constructor() {
    this.versionInfo = {};
    this.outputDirectory = process.env.npm_package_config_output_directory;
    this.pascalCase = pascalCase;
  }

  /**
   * Adds metadata to an object using a key value pair. Note the key is pascal cased.
   * @param {string} name The object key we want to add
   * @param {string} value The object value we want to set
   */
  addMetaDataPascalCaseKey(name, value) {
    Object.assign(this.versionInfo, JSON.parse(`{"${this.pascalCase(name)}": "${value}"}`));
  }

  /**
   * Adds metadata to an object using a key value pair.
   * @param {string} name The object key we want to add
   * @param {string} value The object value we want to set
   */
  addMetaData(name, value) {
    Object.assign(this.versionInfo, JSON.parse(`{"${name}": "${value}"}`));
  }

  /**
   * Writes a properties file to a specified location based on the contents of the passed in object
   * @param {String} filePath Path we are going to write properties file too
   */
  writeObjectAsPropertiesFiles(filePath) {
    const arrayOfPropertyStrings = BaseMetaData.deflateJsonObjectToPropertiesFile(this.versionInfo, '');
    const stringToWrite = arrayOfPropertyStrings.join('\n');
    outputFileSync(filePath, stringToWrite);
  }

  /**
   * Deflates the given object structure into an array of strings in the format <key>=<value>
   * where key is a string constructed from traversing the object hierarchy and value is the
   * bottom most string value for that particular hierarchy traversal.
   * @param {Object} json The object we want to transverse
   * @param {Object} startPrefix The startPrefix to put at the start of the object
   * @returns {Array} Returns an array of strings in the format <key>=<value> from a given object
   */
  static deflateJsonObjectToPropertiesFile(json, startPrefix) {
    let result = [];
    const keys = Object.keys(json);
    keys.forEach((key) => {
      let prefix;
      if (typeof json[key] === 'object') {
        const currentPrefix = key.concat('.');
        prefix = startPrefix ? startPrefix.concat(currentPrefix) : currentPrefix;
        result = result.concat(this.deflateJsonObjectToPropertiesFile(json[key], prefix));
      } else {
        prefix = startPrefix ? startPrefix.concat(key) : key;
        result.push(prefix.concat('=').concat(json[key]));
      }
    });
    return result;
  }
}

module.exports = BaseMetaData;
