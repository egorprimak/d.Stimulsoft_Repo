const fs = require('fs');
const os = require('os');
const path = require('path');
const Stimulsoft = require('stimulsoft-dashboards-js');

const OS_TYPE = os.type();
const IS_WINDOWS = OS_TYPE === 'Windows_NT';
const IS_LINUX = OS_TYPE === 'Linux';

/* ################## */
/* ##### CONFIG ##### */

const WIN_DISK_NAME = IS_WINDOWS ? 'D:' : ''; // "C:", "D:" etc.
const TEMP_DIR_NAME = '/home/odant/tmp-reports';

/* ##### /CONFIG ##### */
/* ################### */

const tempDir = path.join(WIN_DISK_NAME, TEMP_DIR_NAME);
const localizationDir = path.join(tempDir, 'localization');
const fontsDir = path.join(tempDir, 'fonts');


const LOCALE = 'ru'; // "ru" | "en"
const LICENSE_KEY = '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHmirmIiTHOwqBok2eTMRddbd26Hu/1D2vkxKMhrInBIYHLat3' + 
  'wdlYU70cCu+ATpGQUr5C+I8Ep5YEjRYadecksIFtJ8wI0x03luQBS0brSfJikmlzJgE9G60lGQS7EVpQSeZIkokNhR' + 
  'UdxUBjARMfCAQWU2w8P/ktRbQb5uetAp/WU6mMgfyCKRe2EC+vQM90e19Cm2Z/wSQ0ln4I/8bCNX/A1pffx6W55Uk8' + 
  'MzU4yJD0JTQEPVfdOr7io7t/yS1Zer8BJkfSV7Q0CKkIj1Dr8lE6hXQxw6F+AcZTlF4mM2UZUhBVD3RMjj0amgpUfY' + 
  'OO802UJZF4rYZm5BsYUkXv0O0NGS9whZVNrLBUE+4VbxUK2Tl8Bww37JgJqw/Klk2GLCSp0m9V91bfP9v8/YOPihIR' + 
  '/5/3gzdgOib3GH78GpYzVqY1HXrOo6S6gKEBbZ1XHRtIZaANvHg4YlEQwPQL0Xsvewg7RC5hnxSc3CVWU5wFsOnIHq' + 
  'D+S5z37yclZM02PSR8XutVetsZpyd5f1sUYbQkpm/8+aZCRZx2l9VX6Iew==';

Stimulsoft.Base.StiLicense.key = LICENSE_KEY;

Stimulsoft.Base.Localization.StiLocalization.addLocalizationFile(path.join(localizationDir, `${LOCALE}.xml`), false, LOCALE);
Stimulsoft.Base.Localization.StiLocalization.cultureName = LOCALE;

const fonts = [
  'ArialRegular.ttf', 'ArialItalic.ttf', 'ArialBoldItalic.ttf', 'ArialBold.ttf', 'Roboto-BlackItalic.ttf',
  'Roboto-Black.ttf', 'Roboto-BoldItalic.ttf', 'Roboto-Bold.ttf', 'Roboto-MediumItalic.ttf',
  'Roboto-Medium.ttf', 'Roboto-Italic.ttf', 'Roboto-Regular.ttf', 'Roboto-LightItalic.ttf',
  'Roboto-Light.ttf', 'Roboto-ThinItalic.ttf', 'Roboto-Thin.ttf', 'ArialBlack.ttf',
];

for (const font of fonts) {
  Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(path.join(fontsDir, font));
}

const tmpFilePath = process.argv[2];

fs.readFile(tmpFilePath, 'utf8', (err, data) => {
  if (err) {
    return;
  }

  try {
    const { label, template, items, type, format } = JSON.parse(data);
    const report = new Stimulsoft.Report.StiReport();
    report.load(template);
    report.culture = 'ru';

    const stiReportFormat = !format || format === 'mdc' ? null : {
      'pdf': Stimulsoft.Report.StiExportFormat.Pdf,
      'pptx': Stimulsoft.Report.StiExportFormat.Ppt2007,
      'html': Stimulsoft.Report.StiExportFormat.Html,
      'txt': Stimulsoft.Report.StiExportFormat.Text,
      'docx': Stimulsoft.Report.StiExportFormat.Word2007,
      'odt': Stimulsoft.Report.StiExportFormat.Odt,
      'xlsx': Stimulsoft.Report.StiExportFormat.Excel2007,
      'ods': Stimulsoft.Report.StiExportFormat.Ods,
      'csv': Stimulsoft.Report.StiExportFormat.Csv,
      'svg': Stimulsoft.Report.StiExportFormat.ImageSvg,
    }[format] || null;
    const resultFileFormat = stiReportFormat === null ? 'mdc' : format;
    const resultFilePath = `${tmpFilePath}_result.${resultFileFormat}`;

    if (type === 'report') {
      const dataSet = new Stimulsoft.System.Data.DataSet(label);
      dataSet.readJson(JSON.stringify(items));
      report.regData(label, null, dataSet);
      report.renderAsync(() => {
        if (stiReportFormat === null) {
          report.saveDocumentFile(resultFilePath);
          console.log(resultFilePath);
        } else {
          report.exportDocumentAsync(data => {
            const buffer = Buffer.from(data);
            fs.writeFileSync(resultFilePath, buffer);
            console.log(resultFilePath);
          }, stiReportFormat);
        }
      });
    } else if (type === 'dashboard') {
      report.saveFile(resultFilePath);
      console.log(resultFilePath);
    }
  } catch (err) {}
});
