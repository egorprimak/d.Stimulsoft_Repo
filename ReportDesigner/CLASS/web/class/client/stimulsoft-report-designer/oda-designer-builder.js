class OdaDesignerBuilder extends DesignerBuilder {
  _context;
  _attributes;
  _previewData;

  setContext(context) {
    this._context = context;
    return this;
  }

  setDataSet(dataSet) {
    throw new Error('Invalid operation');
  }

  setPreviewData(data) {
    this._previewData = data.slice();
  }

  setAttributes(attrs) {
    this._attributes = attrs;
    return this;
  }

  buildReportDesigner() {
    this._customBuild();
    return super.buildReportDesigner();
  }

  buildDashboardDesigner() {
    this._customBuild();
    return super.buildDashboardDesigner();
  }

  _customBuild() {
    const context = this._context;
    const dataSet = this._makeDataSet({
      name: context.name,
      attributes: this._attributes || context.ATTRS,
    });
    if (this._previewData) {
      dataSet.readJson(JSON.stringify({ $OBJECT: this._previewData }));
    }
    super.setDataSet(dataSet);
  }

  _makeDataSet({ name = 'DataSet', attributes = [] } = {}) {
    const dataSet = new Stimulsoft.System.Data.DataSet(name);

    if (Array.isArray(attributes)) {
      processAttrs(attributes, '$OBJECT');
    }

    return dataSet;

    function processAttrs(attrs, tableName, relationCol = null) {
      const table = new Stimulsoft.System.Data.DataTable(tableName);
      dataSet.tables.add(table);

      if (relationCol) {
        makeRelation(table, relationCol);
      }

      if (Array.isArray(attrs)) {
        for (const attr of attrs) {
          const existsSubAttrs = existsAttrs(attr);
          const list = isList(attr);
          const name = getAttrName(attr);

          if (!existsSubAttrs || list) {
            const col = new Stimulsoft.System.Data.DataColumn(name, typeOfAttr(attr));
            table.columns.add(col);
          }

          if (list || existsSubAttrs) {
            const relationshipColName = `$${name}`;
            const relationshipCol = new Stimulsoft.System.Data.DataColumn(relationshipColName, String);
            table.columns.add(relationshipCol);
            relationshipCol.setTable(table);

            processAttrs(attr.$ATTR, tableName + '_' + relationshipColName, relationshipCol);
          }
        }
      }
    }

    function makeRelation(table, relationCol) {
      const relationId = new Stimulsoft.System.Data.DataColumn('relationId', String);
      table.columns.add(relationId);
      const relation = new Stimulsoft.System.Data.DataRelation(table.tableName, [relationCol], [relationId]);
      table.parentRelations.add(relation);
    }

    function typeOfAttr(attr) {
      if (isList(attr)) {
        return Stimulsoft.System.Int32;
      }
      if (existsAttrs(attr)) {
        return String;
      }
      return TypeConverter.fromOda(attr && attr.Type);
    }

    function getAttrName(attr) {
      return attr && attr.Name || 'unknown';
    }

    function existsAttrs(item) {
      return !!(item && item.$ATTR);
    }

    function isList(attr) {
      return !!attr && String(attr.List).toLowerCase().trim() === 'true';
    }
  }
}
