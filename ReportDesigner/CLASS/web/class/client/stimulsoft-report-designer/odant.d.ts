declare class WebSocketEvents {
  URL: string;

  constructor(url: string);

  addEventListener(name: string, callback: (...args: any[]) => any): this;

  removeEventListener(name: string, callback: (...args: any[]) => any): this;

  removeAllListeners(): this;

  listeners(name: string): ((...args: any[]) => any)[];

  hasListeners(name: string): boolean;

  sendCustomEvent(name: string, eventObject: any): void;

}

declare class ODANT {
  static $connection: OdaConnection;
  static contextItem: OdaItem;
  static API: {
    // tslint:disable-next-line:variable-name
    post(context: string, params?: any, post_object?: string, fetchParams?: any): Promise<any>;
  };

  static getConnection(url?: string, uid?: string): Promise<OdaConnection>;

  static getBool(value, defaultValue?): boolean;

  static mixin(from: object, to: object, deep: number): void;

  static cache(key: string, callback: (...args: any[]) => any): any;

  static URL(url: string): string;

  static getGuid(): string;

  static executeAction(context: string | OdaItem, action: string, params: any): Promise<any>;

  static findItem<T>(path: string): Promise<T>;

  static getItem<T>(path: string): Promise<T>;
}

declare class OdaConnection extends OdaItem {
  EventSource: WebSocketEvents;

  static login(force?: boolean): Promise<void>;

  static _authentication(login, password): Promise<boolean>;

  getUser(id?: string): Promise<OdaUser>;

  logout(): Promise<void>;

  getHost(id?: string): Promise<OdaHost>;


  // @ts-ignore
  listen(item: OdaItem, callback: (...args: any[]) => any): void;

  // @ts-ignore
  unlisten(item: OdaItem, callback: (...args: any[]) => any): void;
}


declare class OdaAPI {
  GET<T>(method: string, params?: any, fetchParams?: any): Promise<T>;

  POST<T>(method: string, params?: any, fetchParams?: any): Promise<T>;

  EXECUTE<T>(action: string, params?: any): Promise<T>;

  DELETE<T>(method: string, params?: any): Promise<T>;
}

declare class OdaRegister {
}

declare enum OdaAccessLevel {
  none,
  template,
  read,
  write,
  create,
  delete,
  admin
}

declare enum OdaBooleanValue {
  True = 'True',
  False = 'False',
}

declare class OdaAccess {
  static levels: {
    none: OdaAccessLevel,
    template: OdaAccessLevel,
    read: OdaAccessLevel,
    write: OdaAccessLevel,
    create: OdaAccessLevel,
    delete: OdaAccessLevel,
    admin: OdaAccessLevel
  };
  static none: OdaAccessLevel;
  static template: OdaAccessLevel;
  static read: OdaAccessLevel;
  static write: OdaAccessLevel;
  static create: OdaAccessLevel;
  static delete: OdaAccessLevel;
  static admin: OdaAccessLevel;

  symbol: 'W' | 'C' | 'D' | 'A' | 'R';
  readOnly: boolean;
  level: OdaAccessLevel;
  icon: string;
  label: string;
  color: string;
  allowTemplate: boolean;
  allowRead: boolean;
  allowWrite: boolean;
  allowCreate: boolean;
  allowDelete: boolean;
  allowAdmin: boolean;

  constructor(level: number);

  static getLevel(value): OdaAccessLevel;

  allow(access: OdaAccessLevel): boolean;

}

declare enum OdaItemType {
  odaItem = 0,
  odaConnection = 1,
  odaHost = 2,
  odaStructure = 3,
  odaSecurity = 7,
  odaClass = 100,
  odaDomain = 101,
  odaBase = 102,
  odaPart = 103,
  odaModule = 104,
  odaWorkPlace = 106,
  odaGroup = 107,
  odaAction = 200,
  odaService = 201,
  odaView = 202,
  odaFile = 300,
  odaFolder = 301,
  odaField = 400,
  odaExtField = 401,
  odaStatic = 401,
  odaDetails = 401,
  odaIndex = 500,
  odaObject = 600,
  odaUser = 700,
  odaRole = 701,
  odaPack = 800
}


declare interface OdaItemProperties {
  prefix: ({ category: string, value: string });
  defaultViewName: string;
  extendedViewName: string;
  defaultPage: string;
  defaultForm: string;
  zIndex: number;
  itemType: OdaItemType;
  author: string;
  label: string;
  id: string;
  fullId: string;
  oldFullPath: string;
  subIcon: string;
  defaultIcon: string;
  access: OdaAccess;
  readOnly: boolean;
  logo: string;
  cover: string;
  viewUrl: string;
  formUrl: string;
  description: string;

  title(): string;

  constructorName(): string;

  itemTypeLabel(): string;

  itemTypePath(): string;

  userId(): string;

  name(): string;

  pathLabel(): string;

  displayLabel(): string;

  labelPath(): string;

  externalUrl(): string;

  url(): string;

  icon(): string;

  iconBackground(): string;

  iconEx(): string;

  backgroundImage(): string;

  isRef(): boolean;

}

declare class OdaItem extends OdaRegister {
  static properties: OdaItemProperties;

  textRoot: string;
  isChanged: boolean;
  $folders: Promise<OdaFolder[]>;
  $folder: Promise<OdaFolder>;
  $files: Promise<OdaFile[]>;
  $class: OdaClass;
  $domain: OdaDomain;
  $base: OdaBase;
  $workGroup: OdaWorkPlace;
  $module: OdaModule;
  $part: OdaPart;
  $host: OdaHost;
  $owner: OdaItem;
  data: any;
  error: any;
  info: any;
  warning: any;
  adminMode: boolean;
  type: string;
  prefix: string;
  defaultViewName: string;
  extendedViewName: string;
  defaultPage: string;
  defaultForm: string;
  zIndex: number;
  itemType: OdaItemType;
  author: string;
  label: string;
  id: string;
  name: string;
  fullId: string;
  oldFullPath: string;
  subIcon: string;
  defaultIcon: string;
  access: OdaAccess;
  readOnly: boolean;
  logo: string;
  cover: string;
  viewUrl: string;
  url: string;
  formUrl: string;
  description: string;

  Root: ({ [prop: string]: any });

  API: OdaAPI;

  XQuery<T>(xq: string, params?: ({ format?: string })): Promise<T>;

  toJSON(): string;

  setDate(fieldName: string, date: Date): void;

  remove(): any;

  executeMethod(methodName: string, params?: any): Promise<any>;

  findAction(actionName: string): Promise<any>;

  executeAction(actionName: string, params?: any): Promise<any>;

  executeServerAction(actionName: string, params?: any): Promise<any>;

  execute(actionName: string, params?: any): Promise<any>;

  getRelativeId(item: OdaItem): string;

  toString(): string;

  listen<T>(event: string, callback: (e?: CustomEvent<T>) => any): void;

  addEventListener(event: string, callback: (...args: any[]) => any): void;

  unlisten(event: string, callback: (...args: any[]) => any): void;

  removeEventListener(event: string, callback: (...args: any[]) => any): void;

  findItem<T>(path: string): Promise<T>;

  resolveUrl(path: string): string;

  getItem<T>(path): Promise<T>;

  getValue(root: object, key?: string): any;

  setValue(root: object, value: any, key: string): void;

  getFolder(path: string, force?: boolean): Promise<any>;

  getFolders(path?: string, deep?: number): Promise<any>;

  getFile(path: string, force: boolean): Promise<any>;

  getFiles(path?: string, deep?: number): Promise<any>;

  getFilesAndFolders(path?: string): Promise<any>;

  loadFile(path: string, params?: any, fetchParams?: any): Promise<any>;

  saveFile(fileBody: any, path: string, inherit?: boolean, mime?: string): Promise<OdaFile>;

  deleteFile(path: string): Promise<any>;

  save(data?: any): Promise<OdaItem>;

  load(params?: any, fetchParams?: any): Promise<any>;
}

declare class OdaItemList extends OdaItem {
  items: Promise<OdaItem[]>;

  getItems(): Promise<OdaItem[]>;

  remove(): Promise<any[]>;
}

declare class OdaStructureItem extends OdaItem {
  getUser(id: string): Promise<OdaUser>;

  getClass(id: string): Promise<OdaClass>;

  getDomain(id: string, prefix?: string): Promise<OdaDomain>;
}

declare class OdaClass extends OdaStructureItem {
  static findField: Promise<OdaField>;

  $items: Promise<OdaItem>;
  $classes: Promise<OdaClass[]>;
  $indexes: Promise<OdaIndex[]>;
  hasPacks: boolean;
  $objects: Promise<OdaObject[]>;
  $users: Promise<OdaUser[]>;
  $assignedUsers: Promise<OdaUser[]>;
  $FIELDS: OdaExtFields;
  $STATIC: OdaStatic;
  $DETAILS: OdaDetails;
  hasFields: boolean;
  ATTRS: ({ [key: string]: any });
  fields: Promise<OdaField[]>;
  objectCount: Promise<number>;


  destroy(): void;

  removeObjects(oids: string[]): void;

  getObjectsList(oids: string[]): Promise<OdaObject[]>;

  getObjects(filter?: string): Promise<OdaObject[]>;

  save(): Promise<OdaClass>;

  findField(): Promise<OdaField>;

  getObject(id: string, params?: ({ meta?: boolean, recalc?: boolean })): Promise<OdaObject>;

  getObjectCount(pack?: string): Promise<number>;

  getIndex(name: string, xq?: string, type?: string): Promise<OdaIndex>;

  createObject(sourceData?: string | object): Promise<OdaObject>;

}

declare class OdaClassItem extends OdaItem {
  fields: Promise<OdaField[]>;
}

declare class OdaObjectType {
  static object: number;
  static static: number;
  static detail: number;

  static getLabel(type?: number): string;
}

declare class OdaObject extends OdaItem {
  $objects: Promise<OdaObject[]>;
  body: any;
  isStatic: boolean;
  isDetail: boolean;

  $FIELDS: OdaExtFields;
  fields: Promise<OdaField[]>;

  static create(dataRoot: ({ [prop: string]: any }), owner: OdaClass): OdaItem;

  getIndex(name: string, xq?: string): Promise<OdaIndex>;

  load(params?: ({ recalc?: boolean, meta?: boolean })): Promise<OdaObject>;

  reload(): Promise<OdaObject>;

  recalc(): void;

  save(data: any): Promise<any>;

  getViewUrl(view?: string): string;

  // @ts-ignore
  getValue(field: string | OdaField, root?: object, defaultValue?: any): any;

  // @ts-ignore
  setValue(field: string | OdaField, value?: any, root?: object): any;

  addRow(field: string | OdaField, root?: object): ({ [prop: string]: any });

  delRow(field: string, row: object | number, root?: object): ({ index: number, value: any }) | undefined;

  clearRows(field: string | OdaField, root?: object): void;

}

declare class OdaField extends OdaClassItem {
  hasFields: boolean;
}

declare class OdaExtFields extends OdaField {
  disabled: boolean;
}

declare class OdaStatic extends OdaExtFields {
  $object: Promise<OdaObject>;
}

declare class OdaDetails extends OdaStatic {
}

declare class OdaFile extends OdaClassItem {
  rename(name: string): Promise<string>;

  move(path: string): Promise<string>;

  copy(path: string): Promise<string>;

  execute(downloadFileName: string): Promise<any>;
}

declare class OdaFolder extends OdaFile {
  // @ts-ignore
  $folder: OdaFolder;

  execute(): Promise<any>;
}

declare class IndexDataSet {
  Index: OdaIndex;
  Mask: string;
  Items: Promise<object[]>;
  filter: string;

  constructor(index: OdaIndex, mask: string, filter: string);

  getRowItem(row: object): Promise<OdaObject>;
}

declare class OdaIndex extends OdaClassItem {
  getDataSet(mask?: string, filter?: string, clear?: boolean): IndexDataSet;
}

declare class OdaDomain extends OdaClass {
}

declare class OdaBase extends OdaDomain {
  BaseCount: number;

  getBase(id: string): Promise<OdaBase>;
}

declare class OdaModule extends OdaDomain {
}

declare class OdaWorkPlace extends OdaDomain {
}

declare class OdaPart extends OdaBase {
}

declare class OdaHost extends OdaStructureItem {
}

declare class OdaUser extends OdaObject {
  logout(): void;
}

declare class OdaAuth {
  static loginServerUrl: string;

  static logout(): Promise<void>;
}
