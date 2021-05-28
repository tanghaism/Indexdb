import {createApp} from 'vue'
import App from './App.vue'
import indexdb from './provider-indexdb';
import {Options} from "../../index";

const indexdbOptions: { databaseName: string; options: Options } = {
  databaseName: 'testVueDB',
  options: {
    store: [],
    async upgradeCallBack(_this, event: IDBVersionChangeEvent){
      console.log('数据库升级需要做的升级操作，比如给旧表删除索引，新增索引');
      console.log('可以通过event获取升级前的数据库版本号和升级后的数据库版本号，做对应的升级操作')
    }
  }
}

createApp(App).use(indexdb, indexdbOptions).mount('#app')
