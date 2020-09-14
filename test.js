const sqlite3 = require('sqlite3').verbose();



const db = new sqlite3.Database('./bot.db', (err) => {









let nick = "gergergwerger";
let id = 1212121212121;

const createUserSql = `insert into users VALUES ( ${id},1,1,1,1,"${nick}");`;

db.run(createUserSql, (error) => {

 console.log('luky blyat');

})








});





// db.close;


//CREATE TABLE users (id int primary key not null, power int not null, wins int not null,losses int not null,lastgymtime int not null,nick text not null);