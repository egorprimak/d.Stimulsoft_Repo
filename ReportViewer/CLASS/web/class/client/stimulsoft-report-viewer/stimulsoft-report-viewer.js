(class extends odaPage {

  static get properties() {
    return {
      label: 'stimulsoft-report-viewer',
      allowAccess: 'R',
      allowUse: true,
      allowExport: false,
      allowArrayContext: false,
      icon: 'icons:settings-applications',
    };
  }
}).register();
