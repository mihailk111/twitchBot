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

let nick = "gergergwerger";
let id = 1212121212121;

const createUserSql = `insert into users
(id,power,wins,loses,lastgymtime,nick)
VALUES ( ${id},1,1,1,1,${nick})`;

db.run(createUserSql, (error) => {
  if (error) console.log(error);
  console.log(chalk.red('[ LOG ] user created'));
})
//FIXME CANNOT INSERT INTO TABLE FOR SOME REASON 