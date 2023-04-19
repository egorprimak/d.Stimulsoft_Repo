class FileReportSaver {
  save(report) {
    const json = report.saveToJsonString();
    saveAsFile(json, `${report.reportName}.mrt`, 'application/json');
    return Promise.resolve(true);
  }
}
