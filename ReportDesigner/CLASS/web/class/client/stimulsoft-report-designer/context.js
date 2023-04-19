class Context {

  static getClassOfDesigner() {
    return Promise.resolve(ODANT.contextItem);
  }

  static getModule() {
    return this.getClassOfDesigner()
      .then(cls => cls.$module)
      .catch(() => null);
  }

  static getInputParameters() {
    const url = new URL(decodeURI(location.href));
    return Array.from(url.searchParams.entries()).reduce((result, [key, value]) => {
      if (key.endsWith('[]')) {
        const param = key.slice(0, -2);
        if (!Array.isArray(result[param])) {
          result[param] = [];
        }
        result[param].push(value);
      } else {
        result[key] = value;
      }
      return result;
    }, {});
  }
}
