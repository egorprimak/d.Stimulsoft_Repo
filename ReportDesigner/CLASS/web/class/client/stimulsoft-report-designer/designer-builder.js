class DesignerBuilder {
  _options;
  _dataSet;
  _template;

  setOptions(options) {
    this._options = Object.assign({}, options);
    return this;
  }

  setDataSet(dataSet) {
    this._dataSet = dataSet;
    return this;
  }

  setTemplate(template) {
    if (typeof template === 'string') {
      this._template = template;
    } else {
      this._template = JSON.stringify(template);
    }
  }

  buildReportDesigner() {
    return this._build(() => new Stimulsoft.Report.StiReport());
  }

  buildDashboardDesigner() {
    return this._build(() => Stimulsoft.Report.StiReport.createNewDashboard());
  }

  _build(buildReport) {
    const options = this._makeOptions();
    const report = this._makeReport(buildReport);
    return this._makeDesigner({ options, report });
  }

  _makeDesigner({ options, report }) {
    const designer = new Stimulsoft.Designer.StiDesigner(options, 'StiDesigner', false);
    designer.report = report;
    return designer;
  }

  _makeOptions() {
    const options = new Stimulsoft.Designer.StiDesignerOptions();
    mergeObjects(options, this._options);
    return options;
  }

  _makeReport(buildReport) {
    const { _dataSet: dataSet, _template: template } = this;
    const report = buildReport();
    if (template) {
      report.load(template);
    }
    if (dataSet) {
      report.regData(dataSet.dataSetName, '', dataSet);
      report.dictionary.synchronize();
    }
    return report;
  }
}
