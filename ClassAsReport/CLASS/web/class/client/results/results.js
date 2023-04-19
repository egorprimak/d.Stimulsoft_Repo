(class extends odaService {

  constants = Object.freeze({
    REPORTS_MODULE_ID: '1D6B0E8D28DF9EF',
    DESIGNER_CLASS_ID: '1D6B0E90A501BB9',
    VIEWER_CLASS_ID: '1D6B0E918E81D54',
    CLASS_AS_REPORT_REPOSITORY_ID: '1D6B35F234F5347',
    TEMPLATES_CLASS_ID: '1D6B37F8180438B',
    DASHBOARD_CLASS_ID: '1D6EE3EE7BFC08A',
  });

  static get properties() {
    return {
      label: 'Сформированные отчеты',
      allowAccess: 'R',
      allowUse: true,
      allowExport: true,
      allowArrayContext: false,
      icon: 'icons:print',
    };
  }

  async execute() {
    const { $class, $base, constants } = this;
    const module = await getStiReportsModule();
    const resultsPath = $base.access.allowAdmin
      ? module.url + `/C:${constants.DASHBOARD_CLASS_ID}/~/client/dashboard/components/info/results/results-list.html`
      : module.url + `/C:${constants.DASHBOARD_CLASS_ID}/~/client/dashboard/components/client-form/results.html`;

    const resultsComponent = await ODA.createComponent(resultsPath, {
      contextItem: module,
      report: $class,
      title: 'Сформированные отчеты',
      noDataText: 'Сформированные отчеты не найдены',
      resultsType: 'report',
    });
    resultsComponent.style.minWidth = '700px';
    resultsComponent.style.maxHeight = '80vh';

    ODA.showDialog(resultsComponent, {
      title: 'Сформированные отчеты',
      icon: 'files:document',
    });

    function getStiReportsModule() {
      return $base.findItem(`M:${constants.REPORTS_MODULE_ID}`);
    }
  }

}).register();

