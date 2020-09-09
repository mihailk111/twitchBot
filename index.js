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



const channels = [ //CHANNELS 

  // 'gaules',
  // "esl_csgo",
  // "gorc",
  // 'dota2ruhub',
  // 'singsing',
  // 'icebergdoto',
  // 'silvername',
  'just_ns',
  "dota2mc_ru",
  'daxak',
  'rxnexus'

]
const fightRequests = [];

const socket = new net.Socket();
socket.setEncoding('utf8');
socket.connect(6667, 'irc.chat.twitch.tv'); //CONNECTION


speedTest.start(socket); // SPEED TEST TO CONSOLE

const irc = new ircClass('oauth:orcp6gjmq3xo63exwflhn2safhoyvv', "gymbot1", socket); //IRC CLASS


let buffer = '';

socket.on('data', (data) => {

  // console.log(`RAW ->  ${data}`);
  // IF DATA ISNT ENDS WITH \R\N PUT IT IN BUFFER AND RETURN
  if (!data.endsWith('\r\n')) {

    buffer = buffer + data;
    return;
  }

  // IF BUFFER ISNOT EMPTY THIS DATA CONCAT TO BUFFER 
  // HANDLE BUFFER 
  // EMPTY BUFFER 
  if (buffer.length > 0) {

    buffer = buffer + data;
    // HANDLE BUFFER
    separateAndHandle(buffer);
    buffer = '';

  } else {
    separateAndHandle(data);
  }

  // SEPARATE MESSAGES AND HANDLE EACH MESSAGE
  function separateAndHandle(data) {
    //console.log(data);
    data = data.split(/\r\n/);
    data.pop();

    // console.dir(data);

    //выполняем полукченные строки
    data.forEach((e) => {
      messageHandler(e);
    })

  }

})

function messageHandler(data) {

  if (/^PING/.test(data)) { //PING PONG answer
    irc.pong()
    return;
  }

  if (data.match(/CLEARCHAT/)) { //CLEARCHAT msg
    console.log(chalk.inverse(data));
    return;
  }

  if (data.match(/CLEARMSG/)) { //CLEARMSG msg
    console.log(chalk.inverse(data));

    return;
  }
  if (data.match(/USERNOTICE/)) { //USERNOTICE MSG
    console.log(chalk.inverse(data));

    return;
  }


  speedTest.message(); // SPEED TEST  

  // PRIVMSG DATA
  let channel;
  let nick;
  let msg;
  let id;
  let realName;

  try { //MESSAGE DATA

    channel = irc.getChannel(data);
    nick = irc.getDisplayName(data);
    msg = irc.getMsg(data).trim();
    realName = irc.getReal(data);
    id = irc.getId(data);

  } catch (error) {
    console.log(data);
    return;

  }

  console.log(irc.getFormattedOutput(channel, nick, msg));


  if (msg.match(/!mypower/i)) { // MY POWER INFO

    const power = ''; // db request
    irc.send(channel, `@${nick} your power is ${power}`);
    return;

  }

  /*\
  ======================= FIGHT OFFER ===================
  
  @<user1241234> gymbot1 ( 141 power ) OFFERED you TO FIGHT !
 !accept TO FIGHT BACK OR
  !run TO ESCAPE THE BULLY
  
  ===========================================




  ================ ACCEPT ===========================
  <user1> and <another_user> wrestled hard
  <user1> WINS having 40% chance! -> 12W ( +1 ) / 5L    
  BabyRage <user2> -> 5W / 20L ( +1 )

  ===========================================


  ===================== !MYPOWER ======================
  
  YOUR POWER IS 1100 [just a SLAVE,BOSS OF THE GYM,DUNGEON MASTER,]
  
  ===========================================
  
  ===================== GO TO GYM ======================
    @<USER> you worked hard IN GYM, now you have 4000 ( +100 ) muscle power !!! DON'T FORGET THE SHOWER !!!! 
  ======================================================

  ======================= NOTIFICATION MESSAGE ===============================

    DON'T FORGET YOU CAN !wrestle @<user> here to offer a fight to someone; USE !GYM to get more power; use !mypower to show your muscular body to chat 

  ======================================================

  */

  // WRESTLE COMAND 
  if (msg.match(/!wrestle/i)) {

    let defender = '';

    try {

      //DEFENDER NICK
      defender = msg.match(/! ?wrestle @(\w{3,})/i)['1'];

    } catch (error) {
      irc.send(channel, `@${nick}, you should use !wrestle @<nick>`);
    }

    fightRequests.push({
      'attackerNick': nick,
      'attackerId': id,
      'defenderNick': defender,
    });

    //  ATtACKER POWER DB REQUEST
    const getUSerSql = 'SELECT * FROM users WHERE id = ?';

    db.get(getUSerSql, [id], (error, data) => {

      if (data) {

        const power = data.power;

        irc.send(channel, `@${defender}, ${nick} ( ${power} POWER ) OFFERED YOU TO FIGHT ! USE !accept TO FIGHT BACK or !run TO ESCAPE THE BULLY`);
        //IF ATTACKER NOT EXIST CREATE HIM
      } else {

        const defaultGymTime = Date.now() - 30 * 60 * 1000;
        const createUserSql = `INSERT INTO users VALUES(${id},0,0,${defaultGymTime})`;

        irc.send(channel, `@${defender}, ${nick} ( 0 POWER ) OFFERED YOU TO FIGHT ! USE !accept TO FIGHT BACK or !run TO ESCAPE THE BULLY`);

        db.run(createUserSql, (error) => {
          if (!error) {
            console.log(chalk.red('[DB-INFO] -> ') + 'USER ' + id + ' CREATED');
          }
        })




      }

    });

    return;

  }


  if (msg.match(/!accept/)) {

    fightRequests.forEach((offer, index) => {
      if (offer.defenderNick === nick) {
        // DO FIGHT 

        //  {
        //   'attackerNick': nick,
        //   'attackerId': id,
        //   'defenderNick': defender,
        // };

        let attackerNick = offer.attackerNick;
        let attackerId = offer.attackerId;

        // request users powers

        getAcceptedUser = `SELECT * FROM USERS WHERE id = ?`;

        db.get(getAcceptedUser, [id], (error, data) => {

          if (data) {
            fight(attackerId, id,attackerNick,nick);

          } else {
            //IF USER WHO ACCEPTS NOT EXIST 
            //CREATE USER
            const defaultGymTime = Date.now() - 30 * 60 * 1000;
            const createUserSql = `INSERT INTO users VALUES(${id},0,0,${defaultGymTime})`;
            db.run(createUserSql, (error) => {
              //USER CREATED 

              fight(attackerId, id,attackerNick,nick);


            })

          }


        })
        // fight 
        // update db
        // send to chat  


        fightRequests.shift();
        return;
      }
    })
    function fight(attackerId, defenderId, attackerNick, defenderNick) {
      bothUsersSql = `SELECT * FROM USERS WHERE id = ? OR id = ?`;

      db.all(bothUsersSql, [attackerId, defenderId], (error, data) => { 

        // data:  {
        //   id: 124,
        //   power: 12354,
        //   wins: 123512,
        //   loses: 12365,
        //   lastgymtime: 12351235
        // }


        const whoWins = coinFlip(data[0].power,data[1].power); // 1 or 2
        const winnerNick =  ( whoWins.whoWins === 1 ) ? attackerNick : defenderNick ;
        const winnerChance = whoWins.chance * 100 ;
        
        

        let winnerWinsCount = ( whoWins === 1 )? data[0].wins : data[1].wins; 
        
        let winnerLosesCount ;

        let loserWinsCount = ( whoWins === 2 )? data[0].wins : data[1].wins;
        
        let loserLosesCount;


        // send to chat
        irc.send(`${attackerNick} and ${defenderNick} wrestled hard
        ${winnerNick} WINS having ${winnerChance} chance! -> 12W ( +1 ) / 5L    
        BabyRage <user2> -> 5W / 20L ( +1 )`);
        // update

        
      })

    }

    return;
  }

  function coinFlip(power1, power2) { // takes 2 powers gives winner

    let sum = power1 + power2;
    let user1chance = power1 / sum;
    let user2chance = power2 / sum;

    let coinFlip = Math.random();

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





}






//CONNECTION
socket.on('connect', () => {


  socket.write(irc.getConnectionMsg(), () => {

    // socket.write(`CAP REQ :twitch.tv/membership\r\n`);


    for (const channel of channels) {

      irc.join(channel);

    }
    socket.write(`CAP REQ :twitch.tv/tags twitch.tv/commands\r\n`);
    setTimeout(() => {
      irc.send('rxnexus', `/NAMES`);
    }, 5000);


  });


})