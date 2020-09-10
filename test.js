
const net = require('net');
const ircClass = require('./twitch_irc');
const sqlite3 = require('sqlite3').verbose();
const chalk = require('chalk');
const log = console.log;
const childProcess = require('child_process');
const speedTest = require('./speedTest.js');


// const db = new sqlite3.Database('./bot.db', () => { //DB CONNECTION
//   console.log("DB -> OK");
// });


// db.get('SELECT * FROM USERS where id = 124',[],(data)=>{

//   console.log(data);
 
  
// });

for (let index = 0; index < 100; index++) {
  let a =Math.round( 70 + 60*Math.random() );
  if (a === 70 || a === 130){
    console.log(a);
  }
}
