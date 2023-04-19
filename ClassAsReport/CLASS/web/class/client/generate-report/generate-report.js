(class extends odaService {

  constants = Object.freeze({
    REPORTS_MODULE_ID: '1D6B0E8D28DF9EF',
    DESIGNER_CLASS_ID: '1D6B0E90A501BB9',
    VIEWER_CLASS_ID: '1D6B0E918E81D54',
    CLASS_AS_REPORT_REPOSITORY_ID: '1D6B35F234F5347',
    TEMPLATES_CLASS_ID: '1D6B37F8180438B',
    DASHBOARD_CLASS_ID: '1D6EE3EE7BFC08A',
    GENERATOR_ID: '1D6BCB474B39228',
  });

  static get properties() {
    return {
      label: 'Сформировать отчет/дашборд',
      allowAccess: 'R',
      allowUse: false,
      allowExport: true,
      allowArrayContext: false,
      icon: 'icons:print',
    };
  }

  async execute(targetObjects) {
    const { $class, $base, constants } = this;
    const templates = await getTemplatesOfClass($class.id);

    if (templates.length === 0) {
      if ($class.access.allowAdmin) {
        const msg = 'Для текущего класса не определены печатные шаблоны.\n' +
          'Открыть дизайнер печатных шаблонов?';
        if (confirm(msg)) {
          openDesigner().catch(err => {
            alert(err);
          });
        }
      } else {
        const msg = 'Невозможно сформировать отчет: для текущего класса не определены печатные шаблоны.';
        alert(msg);
      }
      return;
    }

    const objects = Array.isArray(targetObjects) ? targetObjects.map(o => o.id || o.oid) : [];
    const needDashboardsFunctional = await needToDisplayDashboardsFuncional();

    const reportTemplateChooserPath = this.scriptFolder.resolveUrl('lib/report-template-chooser/report-template-chooser.html');
    const component = await ODA.createComponent(reportTemplateChooserPath, {
      designer: await getDesigner(),
      context: $class,
      templates,
      needDashboardsFunctional,
      showBlankButton: false,
    });
    try {
      await ODA.showDialog(component);
    } catch {
    }

    if (!component.result) {
      return;
    }

    const { template: templateId } = component.result;

    generateTemplateOfReport(templateId, $class.id, 'class')
      .then(data => {
        if (data === undefined) {
          const msg = 'Превышено время ожидания формирования отчета. Готовый документ будет доступен позже в списке сформированных отчетов.\n' +
            'Открыть список сформированных отчетов?';
          if (confirm(msg)) {
            $class.executeAction('results');
          }
          return;
        }
        if (data === 'undefined') {
          const msg = 'Произошла ошибка. Поробности в списке сформированных отчетов.\n' +
            'Открыть список сформированных отчетов?';
          if (confirm(msg)) {
            $class.executeAction('results');
          }
        }
        if (data.error) {
          if (data.resultId) {
            const msg = 'Произошла ошибка: ' + String(data.error) + '\n' +
              'Открыть список сформированных отчетов?';
            if (confirm(msg)) {
              $class.executeAction('results');
            }
          } else {
            alert('Произошла ошибка: ' + String(data.error));
          }
        }
        if (data.result) {
          if (confirm('Отчет успешно сформирован. Открыть?')) {
            openResultDocument(data.result);
          }
        }
      })
      .catch(err => {
        alert(err);
      });

    async function getTemplatesOfClass(classId) {
      const module = await getStiReportsModule();
      const repository = await module.getClass(constants.TEMPLATES_CLASS_ID);
      const pack = await repository.getIndex('Pack');
      const xq = `for $item in /PACK/OBJECT[oda:right(targetClass/@link, 15)="${classId}"]\n` +
        'order by xs:dateTime($item/@date) descending\n' +
        'return element OBJECT {' +
        'attribute id { $item/@oid },' +
        'attribute label { $item/@name },' +
        'attribute type { $item/@type }' +
        '}';
      const res = await pack.XQuery(xq);
      return res && Array.isArray(res.$OBJECT) ? res.$OBJECT : [];
    }

    async function openDesigner() {
      const designer = await getDesigner();

      if (!designer) {
        throw new Error('Дизайнер не найден');
      }

      const url = `/api${designer.fullId}/~/client/stimulsoft-report-designer/index.html?context=${$class.fullId}`;
      const win = window.open(url, '_blank');
      if (win === null) {
        alert('Пожалуйста, разрешите открытие дополнительных вкладок этим сайтом в настройках Вашего браузера.');
      }
    }

    async function needToDisplayDashboardsFuncional() {
      const dashboard = await getDashboardClass();
      const staticObject = await dashboard?.$STATIC?.$object;

      if (!staticObject) {
        return false;
      }

      return staticObject?.Root?.needDashboardsFunctional === 'True';
    }

    function getDesigner() {
      return getStiReportsModule().then(m => m.getClass(constants.DESIGNER_CLASS_ID));
    }

    function getViewer() {
      return getStiReportsModule().then(m => m.getClass(constants.VIEWER_CLASS_ID));
    }

    function getGenerator() {
      return getStiReportsModule().then(m => m.getClass(constants.GENERATOR_ID));
    }

    function getTemplatesRepository() {
      return getStiReportsModule().then(m => m.getClass(constants.TEMPLATES_CLASS_ID));
    }

    function getDashboardClass() {
      return getStiReportsModule().then(m => m.getClass(constants.DASHBOARD_CLASS_ID));
    }

    function getStiReportsModule() {
      return $base.findItem(`M:${constants.REPORTS_MODULE_ID}`);
    }

    async function generateTemplateOfReport(templateId, reportId, reportType, data = null) {
      const generator = await getGenerator();
      const templates = await getTemplatesRepository();
      const fileField = await getFieldOfClass('file', templates);
      const templateObject = await templates.getObject(templateId);
      const fileObject = await fileField.getValue(templateObject, templateObject.Root);
      const hash = Math.round(Math.random() * 1e15).toString(16);
      const stiTemplate = await fileObject.load({ hash }).then(res => res.text());

      const params = JSON.stringify({
        report: reportId,
        template: templateId,
        data,
        userId: $class.userId,
        stiTemplate,
        reportType,
        objects,
      });

      return await generator.executeServerAction('generate', params);
    }

    function getFieldOfClass(fieldName, cls) {
      return cls.fields.then(fields => fields.find(f => f.name === fieldName));
    }

    function openResultDocument(id) {
      getResultDocumentUrl(id).then(url => {
        window.open(url, '_blank');
      });
    }

    function getResultDocumentUrl(id) {
      return getViewer().then(cls => {
        return `/api${cls.fullId}/~/client/stimulsoft-report-viewer/index.html?document=${id}`;
      });
    }
  }

}).register();
