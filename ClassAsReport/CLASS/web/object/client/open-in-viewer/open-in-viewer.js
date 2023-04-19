(class extends odaService {

  static get properties() {
    return {
      label: 'Быстрая печать',
      allowAccess: 'R',
      allowUse: true,
      allowExport: true,
      allowArrayContext: true,
      icon: 'icons:print',
    };
  }

  async execute() {
    const { $item } = this;
    const items = $item instanceof odaItemList ? await $item.getItems() : [$item];
    this.$class.execute('open-in-viewer', items);
  }

}).register();
