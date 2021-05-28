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
    elasticSearch: (keyword: RegExp | string | number | boolean, keysField?: string | string[]) => Promise<any[]>;
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
    [key: string]: ObjectStoreHandler | any;
    static defaultOptions: Options;
    static defaultStoreOptions: storeObjectOptions;
    constructor(databaseName: string, options: Options);
    init(): Promise<IDBDatabase>;
    private _upgrade;
    createStore(storeOptions: StoreOptions, request: IDBOpenDBRequest): Promise<IDBObjectStore>;
    add(storeName: string, data: any, key?: IDBValidKey): Promise<Event>;
    delete(storeName: string, keyRange: IDBValidKey | IDBKeyRange): Promise<Event>;
    deleteIndex(storeName: string, name: string): Promise<string>;
    clear(storeName: string): Promise<Event>;
    put(storeName: string, data: any, primaryKey?: IDBValidKey): Promise<any>;
    get(storeName: string, indexValue: IDBValidKey | IDBKeyRange, indexName?: string): Promise<any>;
    getAllKeys(storeName: string, keyRange?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<any[]>;
    getAll(storeName: string, keyRange?: IDBKeyRange | IDBValidKey | null, count?: number): Promise<any[]>;
    elasticSearch(storeName: string, keyword: RegExp | string | number | boolean, keysField?: string | string[]): Promise<any[]>;
    private _compareType;
    index(storeName: string, name: string): Promise<IDBIndex>;
    count(storeName: string, keyRange?: IDBValidKey | IDBKeyRange): Promise<number>;
}
