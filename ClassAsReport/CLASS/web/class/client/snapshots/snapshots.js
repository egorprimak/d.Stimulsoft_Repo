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
      label: 'Снимки дашбордов',
      allowAccess: 'R',
      async allowUse() {
        return await this.allowUseService();
      },
      allowExport: true,
      allowArrayContext: false,
      icon: 'icons:print',
    };
  }

  async execute() {
    const { $class, $base, constants } = this;
    const module = await this.getStiReportsModule();
    const resultsPath = $base.access.allowAdmin
      ? module.url + `/C:${constants.DASHBOARD_CLASS_ID}/~/client/dashboard/components/info/results/results-list.html`
      : module.url + `/C:${constants.DASHBOARD_CLASS_ID}/~/client/dashboard/components/client-form/results.html`;

    const resultsComponent = await ODA.createComponent(resultsPath, {
      contextItem: module,
      report: $class,
      title: 'Снимки',
      noDataText: 'Снимки не найдены',
      resultsType: 'dashboard',
    });
    resultsComponent.style.minWidth = '700px';
    resultsComponent.style.maxHeight = '80vh';

    ODA.showDialog(resultsComponent, {
      title: 'Снимки дашбордов',
      icon: 'files:document',
    });
  }

  async allowUseService() {
    const module = await this.getStiReportsModule();
    const dashboardClass = await module.findItem(`C:${this.constants.DASHBOARD_CLASS_ID}`);
    const dashboardStaticObject = await dashboardClass?.$STATIC?.$object;

    if (!dashboardStaticObject) {
      return true;
    }

    return dashboardStaticObject?.Root?.needDashboardsFunctional === 'True';
  }

  async getStiReportsModule() {
    return this.$base.findItem(`M:${this.constants.REPORTS_MODULE_ID}`);
  }
}).register();