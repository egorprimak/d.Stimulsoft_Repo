(class extends odaPage {

  static get properties() {
    return {
      label: 'Stimulsoft Report Designer',
      allowAccess: 'A',
      allowUse: true,
      allowExport: false,
      allowArrayContext: false,
      icon: 'icons:report',
    };
  }
}).register();
