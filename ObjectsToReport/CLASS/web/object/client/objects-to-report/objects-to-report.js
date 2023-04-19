(class extends odaService {

  constants = Object.freeze({
    REPORTS_MODULE_ID: '1D6B0E8D28DF9EF',
    VIEWER_CLASS_ID: '1D6B0E918E81D54',
    CLASS_AS_REPORT_REPOSITORY_ID: '1D6B35F234F5347',
    TEMPLATES_CLASS_ID: '1D6B37F8180438B',
  });

  static get properties() {
    return {
      label: 'Печать',
      allowAccess: 'R',
      allowUse: false,
      allowExport: true,
      allowArrayContext: true,
      icon: 'icons:print',
    };
  }

  async execute() {
    const {
      REPORTS_MODULE_ID,
      VIEWER_CLASS_ID,
      CLASS_AS_REPORT_REPOSITORY_ID,
      TEMPLATES_CLASS_ID,
    } = this.constants;

    const items = this.$item instanceof odaItemList ? this.$item.items : [this.$item.Root];
    const oids = items.map(i => i.oid);
    const cls = this.$class;
    const context = cls.fullId;
    const base = this.$base;
    const module = await base.getBase(REPORTS_MODULE_ID);

    if (!module) {
      alert('Модуль отчетов не найден');
      return;
    }

    const [viewerCls, repository, templatesRepository] = await Promise.all([
      module.getClass(VIEWER_CLASS_ID),
      module.getClass(CLASS_AS_REPORT_REPOSITORY_ID),
      module.getClass(TEMPLATES_CLASS_ID),
    ]);

    if (!viewerCls) {
      alert(`Не найден класс представления отчетов (Class ID: ${DESIGNER_CLASS_ID})`);
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

    const templates = await getTemplates();

    if (templates.length === 0) {
      open({ context, objects: oids });
      return;
    }

    const templateChooserPath = `/api${module.fullId}/web/client/template-chooser/template-chooser.html`;
    const templateChooser = await ODA.createComponent(templateChooserPath, {
      templates,
      showBlankTemplateButton: true,
      noDataText: 'Нет шаблонов для печати',
    });

    try {
      await ODA.showDialog(templateChooser);
    } catch {
    }

    const { selectedTemplate } = templateChooser;

    open({ template: selectedTemplate.id, context, objects: oids });

    async function getTemplates() {
      const index = await templatesRepository.getIndex('Pack');
      const xq = `for $item in /PACK/OBJECT[oda:right(targetClass/@link, 15)="${cls.id}"]\n` +
        'return element OBJECT {' +
        'attribute id { $item/@oid },' +
        'attribute label { $item/@name }' +
        '}';
      const queryResult = await index.XQuery(xq);
      return queryResult && queryResult.$OBJECT || [];
    }

    function open({ template, context, objects }) {
      const templateParameter = template ? `&template=${template}` : '';
      const objectsParams = Array.isArray(objects) && objects.length > 0
        ? '&' + objects.map(o => `objects[]=${o}`).join('&')
        : '';
      const params = `?context=${context}${templateParameter}${objectsParams}`;
      const url = `${viewerCls.url}/~/client/stimulsoft-report-viewer/index.html${params}`;
      window.open(url, '_blank');
    }
  }

}).register();