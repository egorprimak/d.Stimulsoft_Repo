(class extends odaAction {

  static get properties() {
    return {
      label: 'generate',
      allowAccess: 'R',
      allowUse: true,
      allowExport: false,
      allowArrayContext: false,
    };
  }

  async execute(input) {
    const STI_REPORTS_MODULE_ID = '1D6B0E8D28DF9EF';
    const REPORTS_REPOSITORY_ID = '1D6B37FA94258AE';
    const TEMPLATES_REPOSITORY_ID = '1D6B37F8180438B';
    const RESULTS_REPOSITORY_ID = '1D6B3813E994521';

    class QueryPreparer {

      constructor(commonVariables = {}) {
        this._commonVariables = this._objectToCommonVariables(commonVariables);
      }

      prepare(sourceQuery, sourceData = {}) {
        let query = String(sourceQuery || '');
        const variables = this._objectToVariables(sourceData);

        query = this._applyVariablesToQuery(query, variables);
        query = this._applyVariablesToQuery(query, this._commonVariables);
        query = this._setAllVariables(query, 'undefined');
        query = this._setAllCommonVariables(query, 'undefined');

        return query;
      }

      keyToVariable(key) {
        return `[#${key}#]`;
      }

      keyToCommonVariable(key) {
        return `[%${key}%]`;
      }

      getVariableRegExp() {
        return /\[#[-_$&@^*"'|.A-Z0-9]*#]/;
      }

      getCommonVariableRegExp() {
        return /\[%[-_$&@^*"'|.A-Z0-9]*%]/;
      }

      _applyVariablesToQuery(query, variables) {
        for (const key in variables) {
          if (!variables.hasOwnProperty(key)) {
            continue;
          }
          query = query.replaceAll(key, variables[key]);
        }
        return query;
      }

      _setAllVariables(query, value = 'undefined') {
        const regexp = new RegExp(this.getVariableRegExp(), 'ig');
        return String(query).replaceAll(regexp, value);
      }

      _setAllCommonVariables(query, value = 'undefined') {
        const regexp = new RegExp(this.getCommonVariableRegExp(), 'ig');
        return String(query).replaceAll(regexp, value);
      }

      _objectToCommonVariables(source) {
        return this._anyObjectToVariables(this.keyToCommonVariable.bind(this), source);
      }

      _objectToVariables(source) {
        return this._anyObjectToVariables(this.keyToVariable.bind(this), source);
      }

      _anyObjectToVariables(keyWrapper, source) {
        const entries = Object.entries(this._safeObject(source))
          .map(([key, value]) => [
            keyWrapper(key),
            this._valueToString(value),
          ]);
        return Object.fromEntries(entries);
      }

      _safeObject(source) {
        return !!source && typeof source === 'object' ? source : {};
      }

      _valueToString(value) {
        if (typeof value === 'object' && value !== null) {
          return this._objectToString(value);
        } else if (value === undefined || value === null) {
          return '';
        } else {
          return String(value);
        }
      }

      _objectToString(value) {
        const prepare = v => String(v).replaceAll('"', '&quot;');
        const items = Object.entries(value).map(([key, value]) => {
          return `<item key="${prepare(key)}" value="${prepare(value)}"/>`;
        }).join('');
        return `<list>${items}</list>`;
      }
    }

    const { default: os } = await import('os');
    const { default: path } = await import('path');
    const { default: fs } = await import('fs');
    const { default: { exec } } = await import('child_process');

    const OS_TYPE = os.type();
    const IS_WINDOWS = OS_TYPE === 'Windows_NT';
    const IS_LINUX = OS_TYPE === 'Linux';

    /* ################## */
    /* ##### CONFIG ##### */

    const WIN_DISK_NAME = IS_WINDOWS ? 'D:' : ''; // "C:", "D:" etc.
    const TEMP_DIR_NAME = '/home/odant/tmp-reports';
    const EXCEL_CREATOR_DIR_NAME = '/home/odant/excel-creator';
    const GENERATOR_SCRIPT_FILENAME = 'generator.js';

    const sysTempFolderDir = path.join(WIN_DISK_NAME, TEMP_DIR_NAME, path.sep);
    const sysExcelCreatorDir = path.join(WIN_DISK_NAME, EXCEL_CREATOR_DIR_NAME, path.sep);

    const generatorScriptPath = path.join(sysTempFolderDir, GENERATOR_SCRIPT_FILENAME);

    const makeGenerateCommand = tmpFilePath =>
      `node ${generatorScriptPath} ${tmpFilePath}`;

    const makePythonActionCommand = (dir, action, configFileName) => IS_WINDOWS
      ? `${WIN_DISK_NAME} && cd ${dir} && activate && python ${action}.py ${configFileName}`
      : `cd ${dir} && conda activate && python ${action}.py ${configFileName}`;

    const formats = ['mdc', 'pdf', 'pptx', 'html', 'txt', 'docx', 'odt', 'xlsx', 'ods', 'csv', 'svg', 'xlsm'];
    const defaultFormat = formats[0];

    /* ##### /CONFIG ##### */
    /* ################### */

    let resultId;

    try {
      const rootBase = this.$base;
      const stiReportModule = await rootBase.findItem(`M:${STI_REPORTS_MODULE_ID}`);
      const repository = await stiReportModule.findItem(`C:${REPORTS_REPOSITORY_ID}`);
      const templatesRepository = await stiReportModule.findItem(`C:${TEMPLATES_REPOSITORY_ID}`);
      const resultsRepository = await stiReportModule.findItem(`C:${RESULTS_REPOSITORY_ID}`);

      verifyInput(input);

      const parameters = prepareInputParameters(input);

      const isReport = parameters.reportType === 'report';
      const isClass = parameters.reportType === 'class';

      if (!isReport && !isClass) {
        throw new Error('Invalid report type');
      }

      const report = isReport
        ? await repository.getClass(parameters.report)
        : await rootBase.findItem(parameters.report);

      const source = isReport
        ? await getSourceOfQueryForReport(report)
        : await report.getIndex('Pack');

      const sourceQuery = isReport
        ? await getQueryOfReport(report)
        : getQueryForGetObjects(parameters.objects);

      const templateObject = await getTemplateObject(templatesRepository, report.id, parameters.template);

      const { type: resultType, name: templateName } = templateObject.Root;
      const isTemplateDashboard = resultType === 'dashboard';
      const isTemplateReport = resultType === 'report';

      const dataOfResultObject = JSON.stringify({
        data: parameters.data,
        objects: parameters.objects,
      });
      const makeResult = (label = templateObject.label, format = defaultFormat, groupData) =>
        makeResultObject(resultType, label, parameters.userId, dataOfResultObject, format, groupData);

      const result = await makeResult();
      resultId = result.id;

      const queryPreparer = new QueryPreparer({
        'user_id': parameters.userId,
        'host_id': rootBase.$host.id,
        'template_name': templateName,
        'template_type': resultType,
        'is_report': isTemplateReport,
        'is_dashboard': isTemplateDashboard,
      });
      const query = queryPreparer.prepare(sourceQuery, parameters.data);

      console.log('start load template');
      const template = JSON.parse(parameters.stiTemplate) || await getTemplate(templateObject);
      console.log('template loaded');
      const data = await source.XQuery(query);

      if (!data) {
        result.Root.status = 'error';
        result.Root.message = 'Error in query';
        await result.save();
        throw new Error(result.Root.message);
      }

      const packs = data.$REPORTS && data.$REPORTS[0] && data.$REPORTS[0].$PACK
        || data.$PACK
        || data.$OBJECT && [{ $OBJECT: data.$OBJECT }]
        || [{ $OBJECT: [] }];

      const isGroup = !!data.$REPORTS && packs.length > 0;
      const group = isGroup && data.$REPORTS && data.$REPORTS[0] || {};
      const dateNow = new Date();
      const groupData = isGroup
        ? {
          group: (dateNow.valueOf() + Math.round(Math.random() * 1e15)).toString(16),
          groupLabel: group.GroupName || templateName,
          groupDate: dateNow.toISOString(),
        }
        : {};

      if (packs.length > 0) {
        Object.assign(result.Root, {
          name: packs[0].Name || templateObject.label,
          format: normalizeFormat(packs[0].Format) || defaultFormat,
        });
        Object.assign(result.Root, groupData);
        await result.save();
      }

      const filesToSave = [];

      const saveFile = (...parameters) => {
        filesToSave.push(parameters);
      };

      const results = await Promise.all(packs.map(async (pack, idx) => {
        const res = idx === 0 ? result : await makeResult(pack.Name, pack.Format, groupData);
        const items = pack.$OBJECT || [];
        const resFormat = res.Root.format;

        /* OLAP */
        if (resFormat === 'xlsm') {
          return exportAsExcelOLAP(pack, res, items).catch(async error => {
            res.Root.status = 'error';
            res.Root.message = error.message || 'Unknown error';
            await res.save();
            return { error, resultId: res.id };
          });
        }

        // TODO: убрать сохранение контента в временный файл
        const tmpFileHash = Math.round(Math.random() * 1e15).toString(16);
        const tmpFileName = `${tmpFileHash}`;
        const tmpFilePath = path.join(sysTempFolderDir, tmpFileName);
        const sourceData = {
          $OBJECT: items,
        };
        const content = {
          template,
          label: report.name,
          items: resultType === 'report' ? sourceData : undefined,
          type: resultType,
          format: resFormat,
        };

        // TODO: переделать на генерацию отчета внутри метода
        return new Promise((resolve, reject) => {
          fs.writeFile(tmpFilePath, JSON.stringify(content), 'utf8', (err) => {
            if (err) {
              res.Root.status = 'error';
              res.Root.message = err.message || 'Unknown error (writeFile)';
              reject(err);
              return;
            }

            exec(makeGenerateCommand(tmpFilePath), (err, stdout, stderr) => {
              if (err) {
                res.Root.status = 'error';
                res.Root.message = err.message || 'Unknown error (exec)';
                reject(err);
                return;
              }

              if (!stdout) {
                reject(new Error('Generate error'));
                return;
              }

              const resultFilePath = stdout.trim();

              if (err) {
                res.Root.status = 'error';
                res.Root.message = err.message || 'Unknown error (readFile)';
                reject(err);
                return;
              }
              const hash = (res.id + Math.round(Math.random() * 1e15).toString(16)).toLowerCase();
              const reportFileName = `report${hash}.${resFormat}`;
              const reportFilePath = `${reportFileName}`;
              const sourceFileName = `source${hash}.json`;
              const sourceFilePath = `${sourceFileName}`;

              saveFile(res, fs.createReadStream(resultFilePath), reportFilePath, false);
              saveFile(res, JSON.stringify(sourceData), sourceFilePath, false, 'application/json');

              Object.assign(res.Root, {
                result: reportFileName,
                $result: [{ link: reportFilePath }],
                source: sourceFileName,
                $source: [{ link: sourceFilePath }],
                resultDate: new Date().toISOString(),
                status: 'ready',
                name: pack.Name || templateObject.label,
                isNew: true,
                userId: parameters.userId,
                format: resFormat,
              });
              Object.assign(res.Root, groupData);

              res.save().finally(() => {
                resolve({ result: res.id });
              });
            });
          });
        }).catch(async error => {
          res.Root.status = 'error';
          res.Root.message = error.message || 'Unknown error';
          await res.save();
          return { error, resultId: res.id };
        });
      }));

      console.log(filesToSave.length, JSON.stringify(filesToSave));

      for (const [obj, content, path, inherit, type] of filesToSave) {
        obj.saveFile(content, path, inherit, type);
      }

      return results;

      async function exportAsExcelOLAP(pack, result, items) {
        if (!pack.Template) {
          throw new Error('Template not defined');
        }
        if (!pack.Action) {
          throw new Error('Action not defined');
        }

        const columns = pack.$Columns && pack.$Columns[0] && pack.$Columns[0].$column || [];

        if (columns.length === 0) {
          throw new Error('Columns count must be >= 1');
        }

        return new Promise((resolve, reject) => {
          const hash = Math.round(Math.random() * 1e15).toString(16).padStart(15, '0');
          const configFileName = `data_${hash}.json`;
          const resultFileName = `result_${hash}.xlsm`;
          const sourceFileName = `source_${hash}.json`;
          const dir = sysExcelCreatorDir;

          const data = [dataToMatrix(columns, items)];

          const configObject = {
            file: pack.Template + '.xlsm',
            columns: columns.map(c => c.label),
            data,
            result: resultFileName,
            hide_data: true,
          };

          const sourceData = {
            $OBJECT: items,
          };

          fs.writeFile(dir + configFileName, JSON.stringify(configObject), 'utf8', (err) => {
            if (err) {
              reject(err);
              return;
            }

            exec(makePythonActionCommand(dir, pack.Action, configFileName), (err, stdout, stderr) => {
              if (err || stderr) {
                reject(err || stderr);
              }
              saveFile(result, fs.createReadStream(dir + resultFileName), `${resultFileName}`, false);
              saveFile(result, JSON.stringify(sourceData), `${sourceFileName}`, false, 'application/json');

              Object.assign(result.Root, {
                result: resultFileName,
                $result: [{ link: `${resultFileName}` }],
                source: sourceFileName,
                $source: [{ link: `${sourceFileName}` }],
                resultDate: new Date().toISOString(),
                status: 'ready',
                name: pack.Name || templateObject.label,
                isNew: true,
                userId: parameters.userId,
                format: 'xlsm',
              });
              Object.assign(result.Root, groupData);

              result.save().finally(() => {
                resolve({ result: result.id });
              });
            });
          });
        });

        function dataToMatrix(columns, items) {
          const type = c => c && c.type || 'string';
          const value = (c, i) => i && i[c.name] || '';
          const format = (c, v) => {
            switch (type(c)) {
              case 'number':
                return +v || 0;
              case 'date':
                return new Date(v);
              default:
                return v;
            }
          };
          return items.map(i => columns.map(c => format(c, value(c, i))));
        }
      }

      function prepareInputParameters(input) {
        return {
          report: input.report,
          template: input.template,
          data: input.data || {},
          objects: input.objects || null,
          // TODO: убрать получение идентификатора пользователя от клиента
          userId: String(input.userId),
          stiTemplate: input.stiTemplate === undefined ? '' : String(input.stiTemplate),
          reportType: input.reportType,
        };
      }

      async function getSourceOfQueryForReport(report) {
        const structure = await report.$STATIC.$object;
        const { querySource } = structure.Root;

        const source = querySource ? await rootBase.findItem(querySource) : report;

        if (!source) {
          throw new Error('Source of query not found');
        }

        return source;
      }

      async function getQueryOfReport(report) {
        const structure = await report.$STATIC.$object;

        if (!structure.Root.query) {
          throw new Error('Query not defined');
        }

        return structure.Root.query;
      }

      function getQueryForGetObjects(objects) {
        if (objects === '*' || !Array.isArray(objects) || objects.length === 0) {
          return '*';
        }
        const quote = v => `"${v}"`;
        const xqOids = objects.map(quote).join(', ');
        return `element PACK { /PACK/OBJECT[@oid=(${xqOids})] }`;
      }

      async function makeResultObject(type, label, author, input, format = defaultFormat, groupData = {}) {
        const result = await resultsRepository.createObject();
        Object.assign(result.Root, {
          name: label,
          targetClass: report.name,
          $targetClass: [{ link: `C:${report.id}` }],
          date: new Date().toISOString(),
          userId: author,
          isNew: true,
          format: normalizeFormat(format),
          input,
          type,
        });
        Object.assign(result.Root, groupData);
        await result.save();
        return result;
      }

      async function getTemplate(templateObject) {
        const fileField = await getFieldOfClass('file', templateObject.$class);
        const fileObject = await fileField.getValue(templateObject, templateObject.Root);
        const hash = Math.round(Math.random() * 1e15).toString(16);
        return await fileObject.load({ hash }).then(res => JSON.parse(res));
      }

      async function getTemplateObject(repository, reportId, templateId) {
        const index = await repository.getIndex('Pack');
        const xq = `/PACK/OBJECT[@oid="${templateId}"][oda:right(targetClass/@link, 15)="${reportId}"]`;
        const queryResult = await index.XQuery(xq);
        const templateObjectId = queryResult && queryResult.$OBJECT && queryResult.$OBJECT[0] && queryResult.$OBJECT[0].oid || null;

        if (!templateObjectId) {
          throw new Error('Template not found');
        }

        return await repository.getObject(templateObjectId);
      }

      function getFieldOfClass(fieldName, cls) {
        return cls.fields.then(fields => fields.find(f => f.name === fieldName));
      }

      function verifyInput(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
          throw new Error('Invalid input data type');
        }

        if (!input.report) {
          throw new Error('Report id not defined');
        }

        if (!input.template) {
          throw new Error('Template id not defined');
        }

        if (!input.reportType) {
          throw new Error('Report type not defined');
        }
      }

      function normalizeFormat(fmt) {
        fmt = String(fmt).trim().toLowerCase();
        return formats.includes(fmt) ? fmt : defaultFormat;
      }

    } catch (err) {
      return {
        error: err && err.message || 'Unknown error',
        resultId,
      };
    }
  }
}).register();
