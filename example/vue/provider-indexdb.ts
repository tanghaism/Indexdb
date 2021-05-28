import IndexDB, { Options } from '../../index';
import { App, inject } from 'vue';

const StoreSymbol = Symbol();

export function useDB(): IndexDB {
  const db = inject(StoreSymbol) as IndexDB;
  if (!db) {
    throw new Error('未发现indexdb实例');
  }
  return db;
}

export default {
  install: (app: App, props: { databaseName: string; options: Options }) => {
    if (!props) {
      throw new Error('请设置indexDB参数');
    }
    const { databaseName, options } = props;
    const indexdb = new IndexDB(databaseName, options);
    app.config.globalProperties.$db = indexdb;
    app.provide(StoreSymbol, indexdb);
  },
};
