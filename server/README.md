1. install sequelize

```
npm install
```

如果上面跑過但不行 =>

```
npm install sequelize mysql2
npm install --save-dev sequelize-cli
```

2. build db

到mySQLWorkbench建立“nccuTT_db“的scheme<br/>
可以在Query執行下列指令

```
CREATE DATABASE nccuTT_db;
```

3. 設定 .env

```
cp .env.template .env
```

然後再把.env中的DB_PASSWORD改成mySQLWorkbench的密碼

4. run backened

```
npm run dev
```

成功執行的話應該會得到”資料庫同步成功“的訊息
檢查nccuTT_db是否建立了相應的table

-   備註

1. 如果不會變動models資料夾內的檔案
   可將index.js中以下的程式碼註解起來
   每次run server時就不會再去執行定義table的sql

// 引入DB
DB.sequelize.sync({
alter: true
})
.then(()=>{
console.log('資料庫同步成功');
})
.catch((err)=>{
console.log('資料庫同步失敗');
console.log(err)
});

2. 相反，若有變更models資料夾內的檔案
   請務必取消註解DB.sequelize.sync的程式碼
   已確保db會跟著變動
   並切記要參照index.js中定義DB models的寫法引入

3. 如果變更了models資料夾內的檔案，但run完node server.js卻顯示資料庫同步失敗
   直接將error msg中的sql複製下來檢查
   通常很容易除錯
