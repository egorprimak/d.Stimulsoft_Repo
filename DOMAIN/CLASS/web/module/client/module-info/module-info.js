(class extends odaView {

  static get properties() {
    return {
      label: 'Dashboard',
      allowAccess: 'A',
      allowUse: true,
      allowExport: false,
      allowArrayContext: false,
      hideToolbar: true,
      icon: 'icons:settings-applications',
    };
  }
}).register();
