(class extends odaService {

  constants = Object.freeze({
    REPORTS_MODULE_ID: '1D6B0E8D28DF9EF',
    DESIGNER_CLASS_ID: '1D6B0E90A501BB9',
    VIEWER_CLASS_ID: '1D6B0E918E81D54',
    CLASS_AS_REPORT_REPOSITORY_ID: '1D6B35F234F5347',
    DASHBOARD_CLASS_ID: '1D6EE3EE7BFC08A',
    TEMPLATES_CLASS_ID: '1D6B37F8180438B',
  });

  static get properties() {
    return {
      label: 'Быстрая печать',
      allowAccess: 'R',
      allowUse: true,
      allowExport: true,
      allowArrayContext: false,
      icon: 'icons:print',
    };
  }

  async execute(targetObjects) {
    const { $class, $base, constants } = this;
    const templates = await getTemplatesOfClass($class.id);
    console.log('templates', templates)

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
        const msg = 'Невозможно вывести на печать: для текущего класса не определены печатные шаблоны.';
        alert(msg);
      }
      return;
    }

    const fields = $class.ATTRS.filter(attr => attr.reportId).map(attr => attr.Name + ',' + attr.reportId)
    const objects = Array.isArray(targetObjects) ? targetObjects.slice() : null;
    const selectedSizeBytes = objects ? getSizeOfObjects(objects) : await getTotalSize();
    const selectedSizeMb = selectedSizeBytes / 1024 / 1024;

    if (selectedSizeMb > 30) {
      const msg = `Размер входных данных отчета составляет ~${Math.round(selectedSizeMb)} Мб., что может привести к высокой нагрузке на Ваше устройство во время формирования печатной формы.\n` +
        'Рекомендуется воспользоваться функцией формирования отчетов (кнопка "Сформировать отчет").\n' +
        'Продожить печать?';
      if (!confirm(msg)) {
        return;
      }
    }

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

    const res = component.result;

    if (!component.result) {
      return;
    }

    await open(res);

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

    function getDashboardClass() {
      return getStiReportsModule().then(m => m.getClass(constants.DASHBOARD_CLASS_ID));
    }

    function getStiReportsModule() {
      return $base.findItem(`M:${constants.REPORTS_MODULE_ID}`);
    }

    function getSizeOfObjects(items) {
      return items.reduce((acc, i) => acc + (+i.Root.size || 0), 0);
    }

    async function getTotalSize() {
      const pack = await $class.getIndex('Pack');
      const xq = 'sum(/PACK/OBJECT/@size)';
      const xqResult = await pack.XQuery(xq);
      return xqResult && +xqResult[0] || 0;
    }

    async function open({ template, context, type }) {
      const viewer = await getViewer();
      const templateParameter = template ? `&template=${template}` : '';
      const typeParameter = `&type=${type}`;
      const objectsParameter = objects
        ? '&' + objects.map(o => `objects[]=${o.id}`).join('&')
        : '&objects=*';
      const templateFields = fields ? '&' + fields.map(f => `fields[]=${f}`).join('&') : '';
      const params = `?context=${context}${templateParameter}${objectsParameter}${templateFields}${typeParameter}`;
      const url = `${viewer.url}/~/client/stimulsoft-report-viewer/index.html${params}`;
      window.open(url, '_blank');
    }
  }

}).register();
