
const net = require('net');
const ircClass = require('./twitch_irc');
const sqlite3 = require('sqlite3').verbose();
const chalk = require('chalk');
const log = console.log;
const childProcess = require('child_process');
const speedTest = require('./speedTest.js');


const db = new sqlite3.Database('./bot.db', () => { //DB CONNECTION
  console.log("DB -> OK");
});


// db.get('SELECT * FROM USERS where id = 124',[],(data)=>{

//   console.log(data);
 
  
// });

// for (let index = 0; index < 100; index++) {
//   let a =Math.round( 70 + 60*Math.random() );
//   if (a === 70 || a === 130){
//     console.log(a);
//   }
// // }
// let a =1111100000;
// let b= 2;

// const powerUpdate = `UPDATE users SET power = ${a}, lastgymtime = ${Date.now()} WHERE id = ${b}` ;

// db.run(powerUpdate,()=>{
//   console.log(chalk.red('[ LOG ] user power updated'));
// })


const a = setInterval(() => {
  console.log('1sec');
}, 1000);