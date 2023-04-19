async function getAttributesOf(item) {
  return await processFields(await item.fields);

  async function processFields(fields) {
    if (!Array.isArray(fields)) {
      return [];
    }
    const result = [];
    for (const field of fields) {
      if (!field || typeof field !== 'object') {
        continue;
      }
      const attr = processField(field);
      if (!field._isLink && field._complex) {
        attr.$ATTR = await processFields(await field.fields);
      } else if (field._isLink) {
        const attrsItemOfType = field.TypeClass && await field.TypeClass.fields || [];
        if (attrsItemOfType.length > 0) {
          attr.$ATTR = attrsItemOfType.map(processField); // don't need deep processing! is link
          attr.$ATTR.push({
            Name: 'link',
          });
        }
      }
      result.push(attr);
    }
    return result;
  }

  function processField(field) {
    const result = {
      Label: field.label,
      List: !!field.isTable,
      Name: field.name,
    };
    if (!field.isTable) {
      if (field._isLink) {
        result.Type = field.type;
      } else if (field.TypeClass) {
        result.Type = field.TypeClass.name;
      } else if (field.type) {
        result.Type = field.type;
      }
    }
    return result;
  }
}

function getFieldOfClass(fieldName, cls) {
  return cls.fields.then(fields => fields.find(f => f.name === fieldName));
}

async function getContextItem(context) {
  const contextItem = await ODANT.findItem(context);
  if (!contextItem) {
    throw Error(`Переданный контекст (${context}) не найден`);
  }
  return contextItem;
}

async function getTemplateOfContext(templateId, context) {
  const file = await getTemplateFileOfContext(templateId, context);
  if (!file) {
    return null;
  }
  const hash = Math.round(Math.random() * 1e15).toString(16);
  const url = `/api${file.fullId}?h=${hash}`;
  return await fetch(url).then(res => res.text());
}

async function getTemplateFileOfContext(templateId, context) {
  if (!context) {
    throw new Error('Указанный шаблон не может быть открыт, т.к. не указан контекст');
  }
  const repository = await getTemplatesRepository();
  const fileField = await getFieldOfClass('file', repository);
  const templateObject = await getObjectOfTemplateForContext(templateId, context);
  const file = await fileField.getValue(templateObject, templateObject.Root);
  return file && AVAILABLE_TEMPLATE_FORMATS.includes(file.ext) ? file : null;
}

function isReport(context) {
  if (!context || !context.$module) {
    return false;
  }
  return ODANT.contextItem.$module.id === context.$module.id;
}

async function getObjectOfTemplateForContext(templateId, context) {
  const repository = await getTemplatesRepository();
  const index = await repository.getIndex('Pack');
  const xq = `/PACK/OBJECT[@oid="${templateId}"][oda:right(targetClass/@link, 15)="${context.id}"]`;
  const queryResult = await index.XQuery(xq);
  const oid = queryResult && queryResult.$OBJECT && queryResult.$OBJECT[0] && queryResult.$OBJECT[0].oid;
  if (!oid) {
    return null;
  }
  return await repository.getObject(String(oid));
}

function getTemplatesRepository() {
  return ODANT.contextItem.$module.getClass(TEMPLATES_CLASS_ID);
}

function getClassAsReportRepository() {
  return ODANT.contextItem.$module.getClass(CLASS_AS_REPORT_REPOSITORY_ID);
}

function getClassOfResults() {
  return ODANT.contextItem.$module.getClass(RESULTS_CLASS_ID);
}
