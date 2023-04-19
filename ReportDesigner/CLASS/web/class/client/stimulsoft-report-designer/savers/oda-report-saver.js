class OdaReportSaver {
  _context;
  _templateObject;

  constructor(context, templateObject, templateType = 'report') {
    this._context = context;
    this._templateObject = templateObject;
    this._templateType = templateType;
  }

  async save(report) {
    if (!this._templateObject) {
      this._templateObject = await this._createTemplateObject();
      if (!this._templateObject) {
        return;
      }
    }

    const json = report.saveToJsonString();
    const file = new File([json], `${this._templateObject.name}.mrt`, { type: 'application/json' });
    await this._saveFile(file);
    return true;
  }

  async _saveFile(file) {
    const fileField = await getFieldOfClass('file', this._templateObject.$class);
    fileField.setValue(this._templateObject, file, this._templateObject.Root);
    await Promise.all([
      this._templateObject.save(),
      this._saveContextInRepositoryIfNotExists(),
    ]);
  }

  async _createTemplateObject() {
    const { _templateType: type } = this;
    const namePrefix = type === 'report' ? 'Шаблон' : 'Макет';
    const objName = type === 'report' ? 'шаблона' : 'макета';
    const defaultName = `${namePrefix} от ${new Date().toLocaleString()}`;
    const name = prompt(`Введите имя ${objName}`, defaultName);
    if (name === null) {
      return null;
    }

    const repository = await getTemplatesRepository();
    const linkField = await getFieldOfClass('targetClass', repository);
    const object = await repository.createObject();
    Object.assign(object.Root, { name, type });
    linkField.setValue(object, this._context, object.Root);
    await object.save();
    return object;
  }

  async _saveContextInRepositoryIfNotExists() {
    if (isReport(this._context)) {
      return;
    }

    const repository = await getClassAsReportRepository();
    const cls = this._context;

    if (await isNotExistsInRepository()) {
      await saveInRepository();
    }

    async function isNotExistsInRepository() {
      const index = await repository.getIndex('Pack');
      const xq = `/PACK/OBJECT[oda:right(targetClass/@link, 15)="${cls.id}"]`;
      const queryResult = await index.XQuery(xq);
      return !(queryResult && Array.isArray(queryResult.$OBJECT) && queryResult.$OBJECT.length > 0);
    }

    async function saveInRepository() {
      const object = await repository.createObject();
      const targetClassField = await getFieldByNameFromClass('targetClass', repository);
      object.Root.name = cls.name;
      targetClassField.setValue(object, cls, object.Root);
      await object.save();
    }

    async function getFieldByNameFromClass(fieldName, cls) {
      const fields = await cls.fields;
      return fields.find(f => f.name === fieldName) || null;
    }
  }
}
