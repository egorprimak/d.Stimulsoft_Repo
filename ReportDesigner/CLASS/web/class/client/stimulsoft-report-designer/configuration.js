class Configuration {
  _resourcePath;
  _stimulsoft;
  _language;
  _languages;
  _licenseKey;

  constructor(params) {
    if (!params || typeof params !== 'object') {
      throw new Error('Invalid params of configuration');
    }
    if (!params.stimulsoft) {
      throw new Error('Params of configuration must be exists link to Stimulsoft object');
    }

    this._resourcePath = params.resourcePath || '';
    this._stimulsoft = params.stimulsoft;
    this._language = params.defaultLanguage || 'en';
    this._languages = params.languages.slice() || [];
    this._licenseKey = params.licenseKey || null;
  }

  apply() {
    this._loadStyles();
    this._setLicense();
    this._loadLanguages();
    this._configLocalization();
  }

  _setLicense() {
    this._stimulsoft.Base.StiLicense.key = this._licenseKey;
  }

  _loadStyles() {
    attachStylesheet(this._getResourcePath('stimulsoft.designer.office2013.whiteblue.css'));
    attachStylesheet(this._getResourcePath('stimulsoft.viewer.office2013.whiteblue.css'));
  }

  _configLocalization() {
    this._stimulsoft.Base.Localization.StiLocalization.cultureName = this._language;
  }

  _loadLanguages() {
    for (const lang of this._languages) {
      const filePath = this._getResourcePath(`localization/${lang}.xml`);
      this._stimulsoft.Base.Localization.StiLocalization.addLocalizationFile(filePath, false, lang);
    }
  }

  _getResourcePath(relativePath) {
    return `${this._resourcePath}/${String(relativePath).replace(/^\//, '')}`;
  }
}
