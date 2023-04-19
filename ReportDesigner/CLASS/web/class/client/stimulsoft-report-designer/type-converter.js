class TypeConverter {

  static fromOda(odaType) {
    const type = String(odaType).trim().toLowerCase();
    switch (type) {
      case 'датавремя':
      case 'время':
      case 'datetime':
      case 'time':
      case 'timestamp':
        return Stimulsoft.System.DateTime;

      case 'дата':
      case 'date':
        return Stimulsoft.System.Date;

      case 'number':
      case 'numeric':
      case 'int':
      case 'integer':
      case 'число':
        return Stimulsoft.System.Double;

      case 'bool':
      case 'boolean':
      case 'логическое':
        return Boolean;

      case 'string':
      case 'строка':
      default:
        return String;
    }
  }

}
