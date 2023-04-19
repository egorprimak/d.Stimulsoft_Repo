declare interface ReportSaver {
  save(report: object): Promise<boolean>;
}

declare class OdaReportSaver implements ReportSaver {
  save(report: object): Promise<boolean>;

}

declare class FileReportSaver implements ReportSaver {
  save(report: object): Promise<boolean>;
}
