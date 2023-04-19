(class extends odaService {

  constants = Object.freeze({
    REPORTS_MODULE_ID: '1D6B0E8D28DF9EF',
    DESIGNER_CLASS_ID: '1D6B0E90A501BB9',
    DASHBOARD_CLASS_ID: '1D6EE3EE7BFC08A',
    CLASS_AS_REPORT_REPOSITORY_ID: '1D6B35F234F5347',
    TEMPLATES_CLASS_ID: '1D6B37F8180438B',
  });

  static get properties() {
    return {
      label: 'Открыть в дизайнере',
      allowAccess: 'A',
      allowUse: true,
      allowExport: true,
      allowArrayContext: false,
      icon: 'icons:open-in-new',
    };
  }

  async execute() {
    const {
      REPORTS_MODULE_ID,
      DESIGNER_CLASS_ID,
      DASHBOARD_CLASS_ID,
      CLASS_AS_REPORT_REPOSITORY_ID,
      TEMPLATES_CLASS_ID,
    } = this.constants;
    const cls = this.$class;
    const context = cls.fullId;
    const base = this.$base;
    const module = await base.getBase(REPORTS_MODULE_ID);
    const reportTemplateChooserPath = this.scriptFolder.resolveUrl('lib/report-template-chooser/report-template-chooser.html');

    if (!module) {
      alert(`Не найден модуль (Module ID: ${REPORTS_MODULE_ID})`);
      return;
    }

    const [designerCls, repository, templatesRepository, dashboardClass] = await Promise.all([
      module.getClass(DESIGNER_CLASS_ID),
      module.getClass(CLASS_AS_REPORT_REPOSITORY_ID),
      module.getClass(TEMPLATES_CLASS_ID),
      module.getClass(DASHBOARD_CLASS_ID),
    ]);

    if (!designerCls) {
      alert(`Не найден класс дизайнера отчетов (Class ID: ${DESIGNER_CLASS_ID})`);
      return;
    }

    if (!repository) {
      alert(`Не найдено хранилище классов (Class ID: ${DESIGNER_CLASS_ID})`);
      return;
    }

    if (!templatesRepository) {
      alert(`Не найдено хранилище шаблонов (Class ID: ${TEMPLATES_CLASS_ID})`);
      return;
    }

    if (!dashboardClass) {
      alert(`Не найден класс с интерфейсом модуля (Class ID: ${DASHBOARD_CLASS_ID})`);
      return;
    }

    const templates = await getTemplates();

    if (templates.length === 0) {
      open({ context });
      return;
    }

    const needDashboardsFunctional = await needToDisplayDashboardsFuncional();
    const component = await ODA.createComponent(reportTemplateChooserPath, {
      designer: designerCls,
      context: cls,
      templates,
      needDashboardsFunctional,
    });
    try {
      await ODA.showDialog(component);
    } catch {
    }
    const res = component.result;

    if (!component.result) {
      return;
    }

    open(res);

    async function getTemplates() {
      const index = await templatesRepository.getIndex('Pack');
      const xq = `for $item in /PACK/OBJECT[oda:right(targetClass/@link, 15)="${cls.id}"]\n` +
        'order by xs:dateTime($item/@date) descending\n' +
        'return element OBJECT {' +
        'attribute id { $item/@oid },' +
        'attribute label { $item/@name },' +
        'attribute type { $item/@type }' +
        '}';
      const queryResult = await index.XQuery(xq);
      return queryResult && queryResult.$OBJECT || [];
    }

    async function needToDisplayDashboardsFuncional() {
      const staticObject = await dashboardClass?.$STATIC?.$object;

      if (!staticObject) {
        return false;
      }

      return staticObject?.Root?.needDashboardsFunctional === 'True';
    }

    function open({ template, context, type }) {
      const templateParameter = template ? `&template=${template}` : '';
      const typeParameter = `&type=${type}`;
      const params = `?context=${context}${templateParameter}${typeParameter}`;
      const url = `${designerCls.url}/~/client/stimulsoft-report-designer/index.html${params}`;
      window.open(url, '_blank');
    }
  }

}).register();
