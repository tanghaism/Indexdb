## indexdb.ts
>indexdb工具类
### 使用方式
```ts
const db = new IndexDB('mydb', {
  version: 1,
  store: [
    {
      storeName: 'test'
    },
  ],
});

async function doSomething(primaryKey){
  // 直接通过表名添加数据
  await db.$test.add('这是存入的数据0')
  
  // 通过传入表名添加数据
  await db.add('test', '这是存入的数据1')
  
  // 直接通过表名获取数据
  const data0 = await db.$test.get(primaryKey)
  console.log(data0)
  
  // 通过传入表名获取数据
  const data1 = await db.get('test', primaryKey)
  console.log(data1)
}

doSomething()
```
### Constructor传参
| props        | type        | default     | required      |    remark      |
| :------------: | :-----------: | :-----------: | :-----------: | :--------------: |
| databaseName  |  string   |     |  是  | 数据库名称 |
| options        |  object    |        |  否  | 详细参数见下表，不传则不会创建任何表，只会创建数据库 |

>#### options
| props        | type        | default     | required      |    remark      |
| :------------: | :-----------: | :-----------: | :-----------: | :--------------: |
| version  |  number   |  1   |  否  | 数据库版本，只能升不能降，不能是小数，不传默认为1 |
| store        |  storeOption[]    |   []     |  否  | 详细参数见下表，生成表的规则，数组每一项都是一个表配置 |
| upgradeCallBack        |  (this: IndexDB实例, versionChangeEvent: 数据库变化对象，可拿到旧版本号和新版本号) => promise\<void>  |        |  否  | 处理数据库升级事件的钩子函数，会在类操作数据库之前执行 |
>#### storeOption
| props        | type        | default     | required      |    remark      |
| :------------: | :-----------: | :-----------: | :-----------: | :--------------: |
| storeName  |  string   |     |  是  | 表名 |
| options        |  {autoIncrement: boolean, keyPath?: string}    |   {autoIncrement: true}     |  否  | 表配置，autoIncrement：主键是否自增，keyPath：主键名称 |
| indexOptions   |  {name: string, key: string or string[], unique: boolean, multiEntry?: boolean}[]  |   []     |  否  | 给表添加额外的索引，name：索引名称，key：索引主键，unique：主键是否唯一，multiEntry：如果索引主键为数组，则会给数组内的主键都设置索引 |

### Methods
通过表名直接调用时，均不传storeName
```ts
// 通过表名调用
await db.$test.add('这是data参数')

// 传入表名调用
await db.add('test', '这是data参数')
```
>#### 添加数据
传入key则视为更新对应数据
#### add: (storeName: string, data: any, key?: IDBValidKey)=> Promise\<Event>
<hr/>

>#### 删除数据
#### delete: (storeName: string, keyRange: IDBKeyRange ｜ IDBValidKey)=> Promise\<Event>
<hr/>

>#### 删除索引
name: 索引名称<br/>
#### deleteIndex: (storeName: string, name: string)=> Promise\<string>
<hr/>

>#### 清空表数据
#### clear: (storeName: string)=> Promise\<Event>
<hr/>

>#### 更新数据
data 新的数据<br>
key 要匹配的主键值，不传则视为新增<br>
#### put: (storeName: string, data: any, key?: IDBKeyRange ｜ IDBValidKey)=> Promise\<any>
<hr/>

>#### 获取数据
key 要匹配的主键值<br>
name 索引的名称，如果不想匹配主键的值，而是匹配索引的值，此处传入索引的名称<br>
#### get: (storeName: string, key: IDBKeyRange ｜ IDBValidKey, name?: string)=> Promise\<any>
<hr/>

>#### 获取匹配的键
keyRange 需要匹配主键的值<br>
count 需要匹配的数量<br>
#### getAllKeys: (storeName: string, keyRange?: IDBValidKey | IDBKeyRange | null, count?: number)=> Promise\<any[]>
<hr/>

>#### 模糊查询
keyword 需要匹配的值，支持传入正则，字符串，数字和布尔值<br>
keysField 需要匹配的键，只在数据为对象时才需要传入，如果传入的为数组，则会匹配对象内对应键的值<br>
#### elasticSearch: (storeName: string, keyword: RegExp | string | number | boolean, keysField?: string | string[])=> Promise\<any[]>
<hr/>

>#### 获取数据量
keyRange 需要匹配主键的值<br>
#### count: (storeName: string, keyRange: IDBKeyRange)=> Promise\<number>
<hr/>

>#### 获取表索引对象
name 索引名称<br>
#### index: (storeName: string, name: string)=> Promise\<IDBIndex>
<hr/>
