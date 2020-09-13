
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


function coinFlip(power1, power2) { // takes 2 powers gives winner

  const sum = power1 + power2;
  console.log('POWER SUM -> '+sum);
  const user1chance = power1 / sum;
  console.log('user1chance -> '+user1chance);

  const user2chance = power2 / sum;
  console.log('user1chance -> '+user2chance);
  const coinFlip = Math.random();

  if (coinFlip < user1chance) {
    return {
      'whoWins': 1,
      'chance': user1chance
    };
  } else {
    return {
      'whoWins': 2,
      'chance': user2chance
    };
  }

}

console.log(coinFlip(100,1));

