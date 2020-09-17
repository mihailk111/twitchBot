const sqlite3 = require('sqlite3').verbose();



const db = new sqlite3.Database('./bot.db', (err) => {









    db.all('select * from users where id = ? or id = ?',[573150613,584170867],(err,data)=>{
        console.log(data);
    })




});





// db.close;


//CREATE TABLE users (id int primary key not null, power int not null, wins int not null,losses int not null,lastgymtime int not null,nick text not null);