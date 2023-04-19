(class extends odaService {

  static get properties() {
    return {
      label: 'Сформировать отчет',
      allowAccess: 'R',
      allowUse: false,
      allowExport: true,
      allowArrayContext: true,
      icon: 'icons:print',
    };
  }

  async execute() {
    const { $item } = this;
    const items = $item instanceof odaItemList ? await $item.getItems() : [$item];
    this.$class.execute('generate-report', items);
  }

}).register();
