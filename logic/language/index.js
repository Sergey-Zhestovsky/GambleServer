let fs = require('fs'),
  config = require('../../config'),
  filePath = require('path');

const defaultLanguage = config.get('default_language');
let defaultLayouts;

function getTranslate(language, page, layouts) {
  let result = Object.create(null);

  if (!isFileExists(`/${language}`)) {
    language = defaultLanguage;
  }

  for (let i = 0; i < defaultLayouts.length; i++)
    result[defaultLayouts[i]] = getJSON(language, defaultLayouts[i]);

  result["page"] = getJSON(language, page);

  if (layouts)
    result.layouts = copyLayoutsProperties(Array.isArray(layouts) ? layouts : [layouts.toString()], language);

  return result;
}

function setDefaultLayouts(layouts) {
  defaultLayouts = Array.isArray(layouts) ? layouts : [layouts];
}

function getErrorTranslate(language = defaultLanguage, name) {
  if (!isFileExists(`/${language}`)) {
    language = defaultLanguage;
  }
  
  return getJSON(language, "errors")[name];
}

function copyLayoutsProperties(layouts, language) {
  let temp = {};

  for (let i = 0; i < layouts.length; i++) {
    Object.assign(temp, getJSON(language, layouts[i]));
  }

  return temp;
}

function getJSON(language, name) {
  let path = `./${language}/${name}.json`;

  if (!isFileExists(path)) {
    path = `./${defaultLanguage}/${name}.json`;
    if (!isFileExists(path))
      return {}
  }

  return require(path);
}

function isFileExists(path) {
  return fs.existsSync(filePath.join(__dirname, path));
}

module.exports = {
  getTranslate,
  setDefaultLayouts,
  getErrorTranslate
};