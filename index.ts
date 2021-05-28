export interface IndexOptions {
  name: string;
  key: string | string[];
  unique: boolean;
  multiEntry?: boolean;
}

export interface storeObjectOptions {
  autoIncrement?: boolean;
  keyPath?: string;
}

export interface StoreOptions {
  storeName: string;
  options?: storeObjectOptions;
  indexOptions?: IndexOptions[];
}

export interface Options {
  version?: number;
  store: StoreOptions[];
  upgradeCallBack?: (db: IndexDB, event: IDBVersionChangeEvent) => Promise<void>;
}

export interface ObjectStoreHandler {
  add: (data: any, key?: IDBValidKey) => Promise<Event>;
  put: (data: any, primaryKey?: IDBValidKey) => Promise<any>;
  getAll: (keyRange?: IDBKeyRange | IDBValidKey | null, count?: number) => Promise<any[]>;
  get: (keyValue: IDBValidKey | IDBKeyRange, key?: string) => Promise<any>;
  getAllKeys: (keyRange?: IDBKeyRange | IDBValidKey | null, count?: number) => Promise<any>;
  count: (keyRange?: IDBValidKey | IDBKeyRange) => Promise<number>;
  delete: (keyRange: IDBValidKey | IDBKeyRange) => Promise<Event>;
  index: (name: string) => Promise<IDBIndex>;
  elasticSearch: (keyword: RegExp | string | number | boolean, keysField?: string | string[]) => Promise<any[]>
  deleteIndex: (name: string) => Promise<string>;
  clear: () => Promise<Event>;
}

export default class IndexDB {

  db: IDBDatabase | undefined;
  name: string;
  version: number;
  options: Options;
  initPromise: Promise<IDBDatabase> | boolean | undefined;
  initComplete: boolean;
  versionChanged: IDBVersionChangeEvent | null;


  // eslint-disable-next-line no-undef
  [key: string]: ObjectStoreHandler | any;

  static defaultOptions: Options = {
    version: 1,
    store: [],
  };

  static defaultStoreOptions: storeObjectOptions = {
    autoIncrement: true,
  };

  constructor(databaseName: string, options: Options) {
    this.options = Object.assign({}, IndexDB.defaultOptions, options);
    this.name = databaseName;
    this.version = this.options.version as number;
    this.db = undefined;
    this.initComplete = false;
    this.versionChanged = null;
    this.initPromise = this.init();
    for (const storeItem of this.options.store) {
      const {storeName} = storeItem;
      this[`$${storeName}`] = {
        add: (data: any, key?: IDBValidKey) => this.add(storeName, data, key),
        put: (data: any, key?: IDBValidKey) => this.put(storeName, data, key),
        getAll: (keyRange?: IDBKeyRange | IDBValidKey | null, count?: number) => this.getAll(storeName, keyRange, count),
        get: (keyValue: IDBValidKey | IDBKeyRange, key?: string) => this.get(storeName, keyValue, key),
        getAllKeys: (keyRange?: IDBValidKey | IDBKeyRange | null, count?: number) =>
          this.getAllKeys(storeName, keyRange, count),
        count: (keyRange?: IDBValidKey | IDBKeyRange) => this.count(storeName, keyRange),
        delete: (keyRange: IDBValidKey | IDBKeyRange) => this.delete(storeName, keyRange),
        deleteIndex: (name: string) => this.deleteIndex(storeName, name),
        elasticSearch: (
          keyword: RegExp | string | number | boolean,
          keysField?: string | string[],
        ) => this.elasticSearch(storeName, keyword, keysField),
        index: (name: string) => this.index(storeName, name),
        clear: () => this.clear(storeName),
      } as ObjectStoreHandler;
    }
  }

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.initComplete) {
        return resolve(this.db as IDBDatabase);
      }
      const request = window.indexedDB.open(this.name, this.version);

      request.onerror = (event: Event) => {
        reject(event);
      };

      request.onsuccess = async () => {
        this.db = request.result as IDBDatabase;
        this.initComplete = true;
        this.db.onversionchange = () => {
          window.location.reload();
        };
        if (this.versionChanged && this.options.upgradeCallBack) {
          await this.options.upgradeCallBack(this, this.versionChanged as IDBVersionChangeEvent);
        }
        resolve(this.db);
      };

      request.onupgradeneeded = async (event: IDBVersionChangeEvent) => {
        this.versionChanged = event;
        await this._upgrade(event, request);
      };
    });
  }

  private async _upgrade(event: Event, request: IDBOpenDBRequest) {
    this.db = (event.target as IDBRequest).result as IDBDatabase;
    for (const storeOption of this.options.store) {
      await this.createStore(storeOption, request);
    }
    return this.db;
  }

  async createStore(
    storeOptions: StoreOptions,
    request: IDBOpenDBRequest,
  ): Promise<IDBObjectStore> {
    const {storeName, options, indexOptions} = storeOptions;
    let store: IDBObjectStore;
    // 如果不存在表，则直接创建表
    if (!(this.db as IDBDatabase).objectStoreNames.contains(storeName)) {
      store = (this.db as IDBDatabase).createObjectStore(
        storeName,
        Object.assign({}, IndexDB.defaultStoreOptions, options),
      );
      console.log(store);
      if (indexOptions) {
        indexOptions.forEach(item => {
          store.createIndex(item.name, item.key, {
            unique: item.unique,
            multiEntry: !!item.multiEntry,
          });
        });
      }
      return store;
    } else {
      // 如果已存在表,且传入了db的request对象，则视为升级操作，需要进行数据库升级操作
      return (request.transaction as IDBTransaction).objectStore(storeName);
    }
  }

  // 添加数据
  async add(storeName: string, data: any, key?: IDBValidKey): Promise<Event> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const request = (this.db as IDBDatabase)
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .add(data, key);

      request.onsuccess = function (event) {
        resolve(event);
      };

      request.onerror = function (event) {
        reject(event);
      };
    });
  }

  // 删除数据
  async delete(storeName: string, keyRange: IDBValidKey | IDBKeyRange): Promise<Event> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const request = (this.db as IDBDatabase)
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .delete(keyRange);

      request.onsuccess = function (event) {
        resolve(event);
      };

      request.onerror = function (event) {
        reject(event);
      };
    });
  }

  // 删除索引
  async deleteIndex(storeName: string, name: string): Promise<string> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    (this.db as IDBDatabase)
    .transaction([storeName], 'readwrite')
    .objectStore(storeName)
    .deleteIndex(name);

    return 'delete success';
  }

  // 清空数据库数据
  async clear(storeName: string): Promise<Event> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const request = (this.db as IDBDatabase)
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .clear();
      request.onsuccess = event => {
        resolve(event);
      };

      request.onerror = event => {
        reject(event);
      };
    });
  }

  // 更新数据
  async put(storeName: string, data: any, primaryKey?: IDBValidKey): Promise<any> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const request = (this.db as IDBDatabase)
      .transaction([storeName], 'readwrite')
      .objectStore(storeName)
      .put(data, primaryKey);

      request.onsuccess = function () {
        resolve(data);
      };

      request.onerror = function (event) {
        reject(event);
      };
    });
  }

  // 获取数据
  // @param: indexValue 默认匹配主键的值
  // @param: indexName 索引的名称，如果不想匹配主键的值，而是匹配索引的值，此处传入索引的名称
  async get(storeName: string, indexValue: IDBValidKey | IDBKeyRange, indexName?: string): Promise<any> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const transaction = (this.db as IDBDatabase).transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      let request: IDBRequest;
      if (indexName) {
        const index = objectStore.index(indexName);
        request = index.get(indexValue);
      } else {
        request = objectStore.get(indexValue);
      }

      request.onerror = function (event) {
        reject(event);
      };

      request.onsuccess = function () {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve(null);
        }
      };
    });
  }

  // 通过索引获取数据
  async getAllKeys(storeName: string, keyRange?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<any[]> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const transaction = (this.db as IDBDatabase).transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      // const keyRange = IDBKeyRange.only(indexData);
      const request = store.getAllKeys(keyRange, count);
      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function (e) {
        reject(e);
      };
    });
  }

  // 获取表内所有数据
  async getAll(storeName: string, keyRange?: IDBKeyRange | IDBValidKey | null, count?: number): Promise<any[]> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const objectStore = (this.db as IDBDatabase).transaction(storeName).objectStore(storeName);
      const request =
        count != null ? objectStore.getAll(keyRange, count) : objectStore.getAll(keyRange);
      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function (event) {
        reject(event);
      };
    });
  }

  // 模糊搜索
  async elasticSearch(
    storeName: string,
    keyword: RegExp | string | number | boolean,
    keysField?: string | string[],
  ): Promise<any[]> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const objectStore = (this.db as IDBDatabase).transaction(storeName).objectStore(storeName);
      const data: any[] = [];
      const cursor = objectStore.openCursor();

      cursor.onsuccess = (e: Event) => {
        const result = (e.target as IDBRequest).result;
        if (result) {
          if(Array.isArray(keysField)){
            if (keysField.some((key: string) => this._compareType(result.value, keyword, key))) {
              data.push(result.value);
            }
          }else{
            if (this._compareType(result.value, keyword, keysField)) {
              data.push(result.value);
            }
          }
          result.continue();
        } else {
          resolve(data);
        }
      };

      cursor.onerror = (e: Event) => {
        reject(e);
      };
    });
  }

  // 模糊搜索工具函数
  private _compareType(
    rawData: any,
    keyword: RegExp | string | number | boolean,
    keysField?: string,
  ): boolean {
    const value = keysField ? rawData[keysField] : rawData;
    let flag = false;
    switch (typeof value) {
      case 'boolean': {
        flag = typeof keyword === 'boolean' && value === keyword;
        break;
      }
      case 'number':
      case 'bigint':
        flag = typeof keyword === 'number' && value === keyword;
        break;
      case 'string':
        flag =
          (typeof keyword === 'string' && value.indexOf(keyword) > -1) ||
          (keyword instanceof RegExp && keyword.test(value));
        break;
      default:
        if (Array.isArray(value)) {
          flag =
            keyword instanceof RegExp
              ? value.some(valueItem => keyword.test(valueItem))
              : value.includes(keyword);
        }
        break;
    }
    return flag;
  }

  // 获取表的索引对象
  async index(storeName: string, name: string): Promise<IDBIndex> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return (this.db as IDBDatabase).transaction(storeName).objectStore(storeName).index(name);
  }

  // 获取匹配到的数据数量
  async count(storeName: string, keyRange?: IDBValidKey | IDBKeyRange): Promise<number> {
    if (!this.initComplete) {
      await this.initPromise;
    }
    return new Promise((resolve, reject) => {
      const objectStore = (this.db as IDBDatabase).transaction(storeName).objectStore(storeName);
      const request = objectStore.count(keyRange);
      request.onsuccess = function () {
        resolve(request.result);
      };

      request.onerror = function (event) {
        reject(event);
      };
    });
  }
}
