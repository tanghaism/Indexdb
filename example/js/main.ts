import IndexDB, {ObjectStoreHandler} from "../../index";

const db = new IndexDB('testJsDB',
  {
    version: 1,
    store: [
      {
        storeName: 'store0',
        options: {
          keyPath: 'id'
        }
      },
      {
        storeName: 'store1'
      }
    ],
    async upgradeCallBack(_this, event: IDBVersionChangeEvent) {
      console.log('数据库升级需要做的升级操作，比如给旧表删除索引，新增索引', _this);
      console.log('可以通过event获取升级前的数据库版本号和升级后的数据库版本号，做对应的升级操作', event)
    }
  });

async function action(){
  (document.querySelector('#db-name') as HTMLElement).innerHTML = db.name;
  (document.querySelector('#db-version') as HTMLElement).innerHTML = db.version.toString();
  const store: ObjectStoreHandler = db.$store0;
  await store.add({text: '232131'})
  console.log(await store.elasticSearch('13', 'text'))
}

action()
