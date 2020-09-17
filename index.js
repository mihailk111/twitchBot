const net = require('net');
const ircClass = require('./twitch_irc');
const sqlite3 = require('sqlite3').verbose();
const chalk = require('chalk');
const log = console.log;
const speedTest = require('./speedTest.js');
const {
  message
} = require('./speedTest.js');


const db = new sqlite3.Database('./bot.db', () => { //DB CONNECTION
  console.log('DB OK');
});
//ergwergwegwer`


const channels = [ //CHANNELS 

  // 'gaules',
  // "esl_csgo",
  // "gorc",
  // 'dota2ruhub',
  // 'singsing',
  // 'icebergdoto',
  // 'silvername', 
  // 'just_ns',
  // "dota2mc_ru",
  // 'daxak',
  // 'rxnexus',
  'azazin_kreet'
]
const notificationsChannel = 'azazin_kreet';

const fightRequests = [];



const socket = new net.Socket();
socket.setEncoding('utf8');
socket.connect(6667, 'irc.chat.twitch.tv'); //CONNECTION




// speedTest.start(socket); // SPEED TEST TO CONSOLE

const irc = new ircClass('oauth:orcp6gjmq3xo63exwflhn2safhoyvv', "gymbot1", socket); //IRC CLASS


const period = 30 * 60 * 1000; // 30 MINS 



const notifications = setInterval(() => {
  irc.send(notificationsChannel, `EVERYONE, YOU CAN -> !wrestle @<user> to offer a fight to someone; USE -> !gogym to WORKOUT; USE -> !mypower to show your muscular body to chat`)
}, period);




let buffer = '';

socket.on('data', (data) => {

  // 
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
    //
    data = data.split(/\r\n/);
    data.pop();

    // 

    //выполняем полукченные строки
    data.forEach((e) => {
      messageHandler(e);
    })

  }

})

function messageHandler(data) {

  speedTest.message(); // SPEED TEST  

  // PRIVMSG DATA

  let channel;
  let nick;
  let msg;
  let id;

  try { //MESSAGE DATA

    channel = irc.getChannel(data);
    nick = irc.getDisplayName(data);
    msg = irc.getMsg(data).trim();
    id = irc.getId(data);

  } catch (error) {
    console.log(data);

    if (/^PING/.test(data)) { //PING PONG answer
      irc.pong()

    }

    return; //QUITS MESSAGE FUNC
  }

  console.log(irc.getFormattedOutput(channel, nick, msg));


  //erhwerhwsrh
  // MY POWER INFO
  if (msg.match(/!mypower/i)) {

    const getPowerSql = `SELECT * FROM users WHERE id = ?`;

    db.get(getPowerSql, [id], (error, data) => {
      if (data) {

        irc.send(channel, `${nick} has ${data.power} power , ${data.wins} wins and ${data.losses} losses in GYM FIGHTS`);

      } else {
        irc.send(channel, `${nick} has 0 power , 0 wins and 0 losses in GYM FIGHTS`);

        const createUserSql = `INSERT INTO users values (${id},1,0,0,0,"${nick}")`;
        db.run(createUserSql, () => {

        })

      }
    })


    return;
  }

  // WRESTLE COMAND 
  if (msg.match(/! ?wrestle/i)) {

    let defender = '';

    try {

      //DEFENDER NICK
      defender = msg.match(/! ?wrestle @(\w{3,})/i)['1'];

    } catch (error) {
      irc.send(channel, `@${nick}, you should use !wrestle @<nick>`);
    }

    fightRequests.unshift({
      'attackerNick': nick,
      'attackerId': id,
      'defenderNick': defender,
    });

    //  ATtACKER POWER DB REQUEST
    const getUSerSql = 'SELECT * FROM users WHERE id = ?';

    db.get(getUSerSql, [id], (error, data) => {

      if (data) {

        const power = data.power;

        irc.send(channel, `@${defender}, ${nick} ( ${power} POWER ) OFFERED YOU TO FIGHT !accept -> to fight back !run -> try to escape`);
        //IF ATTACKER NOT EXIST CREATE HIM
      } else {

        const defaultGymTime = 0;
        const createUserSql = `INSERT INTO users VALUES(${id},1,0,0,${defaultGymTime},"${nick}" )`;

        irc.send(channel, `@${defender}, ${nick} ( 0 POWER ) OFFERED YOU TO FIGHT !accept -> to fight back !run -> try to escape`);

        db.run(createUserSql, (error) => {
          if (!error) {

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

        const attackerNick = offer.attackerNick;
        const attackerId = offer.attackerId;

        // request users powers

        getAcceptedUser = `SELECT * FROM USERS WHERE id = ?`;

        db.get(getAcceptedUser, [id], (error, data) => {

          if (data) {
            fight(attackerId, id, attackerNick, nick);
          } else {
            //IF USER WHO ACCEPTS NOT EXIST 
            //CREATE USER
            const defaultGymTime = 0;
            const createUserSql = `INSERT INTO users VALUES(${id},1,0,0,0,"${nick}")`;

            db.run(createUserSql, (error) => {
              //USER CREATED 

              fight(attackerId, id, attackerNick, nick);


            })

          }


        })

        fightRequests.splice(index, 1);
        return; // foreach drop
      }
    })

    function coinFlip(power1, power2) { // takes 2 powers gives winner

      const sum = power1 + power2;



      const user1chance = power1 / sum;



      const user2chance = power2 / sum;



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

    function fight(attackerId, defenderId, attackerNick, defenderNick) {
      console.log('defenderId: ', defenderId);
      console.log('attackerId: ', attackerId);

      const bothUsersSql = `SELECT * FROM users WHERE id = ? OR id = ?`;

      db.all(bothUsersSql, [attackerId, defenderId], (error, data) => {

        let attackerData;
       
        let defenderData;
        

        data.forEach((element,index)=>{
          if (element.id == attackerId){
            attackerData = element;
          }else if (element.id == defenderId){
            defenderData = element;
          }
        })
        console.log(attackerData);
        console.log(defenderData);
        
        console.log(data);
        const whoWins = coinFlip(attackerData.power, defenderData.power);

        // GET VARIABLES 

        let winnerNick;

        let loserNick;



        if (whoWins.whoWins === 1) {
          winnerNick = attackerNick;
          loserNick = defenderNick;
        } else {
          winnerNick = defenderNick;
          loserNick = attackerNick;
        }
        console.log('winnerNick: ', winnerNick);
        console.log('loserNick: ', loserNick);

        const winnerChance = whoWins.chance * 100;
        console.log('winnerChance: ', winnerChance);


        let winnerWinsCount;

        let winnerLossesCount;

        let loserWinsCount;

        let loserLossesCount;


        if (whoWins.whoWins === 1) {
          winnerWinsCount = attackerData.wins;
          winnerLossesCount = attackerData.losses; // TODO LOSES/ LOSSES IN DB ?

          loserWinsCount = defenderData.wins;
          loserLossesCount = defenderData.losses;

        } else {
          winnerWinsCount = defenderData.wins;
          winnerLossesCount = defenderData.losses; // TODO LOSES - LOSSES IN DB ?

          loserWinsCount = attackerData.wins;
          loserLossesCount = attackerData.losses;
        }
        console.log('winnerWinsCount: ', winnerWinsCount);
        console.log('winnerLossesCount: ', winnerLossesCount);
        console.log('loserWinsCount: ', loserWinsCount);
        console.log('loserLossesCount: ', loserLossesCount);


        // SEND TO CHAT 
        irc.send(channel, `${attackerNick} and ${defenderNick} WRESTLED PorscheWIN ${winnerNick} WINS having ${Math.floor(winnerChance)}% win-chance! -> ${winnerWinsCount+1}W ( +1 ) / ${winnerLossesCount}L BabyRage ${loserNick} -> ${loserWinsCount}W / ${loserLossesCount+1}L ( +1 )`);

        // FIXME qwrcrq23c2 and 123f1123 WRESTLED PorscheWIN
        //qwrcrq23c2 WINS having 99% win-chance! -> 1W ( +1 ) / undefinedL BabyRage
        //123f1123 -> 0W / NaNL ( +1 )

        //TODO ATTACKER ALWAYS WINS

        //  UPDATE DB
        // TODO CONST -> LET
        let winnerId;
        let loserId;


        if (whoWins.whoWins === 1) {
          winnerId = attackerData.id;
          loserId = defenderData.id;
         
        } else {
          winnerId = defenderData.id;
          loserId = attackerData.id;
          
         
        }
        console.log('winnerId: ', winnerId);
        console.log('loserId: ', loserId);

        const updateWinnerSql = `UPDATE users SET wins = ${winnerWinsCount+1} WHERE id = ${winnerId}`;
        console.log('updateWinnerSql: ', updateWinnerSql);
        const updateLoserSql = `UPDATE users SET losses = ${loserLossesCount+1} WHERE id = ${loserId}`;
        console.log('updateLoserSql: ', updateLoserSql);

        db.run(updateWinnerSql, () => {

        })

        db.run(updateLoserSql, () => {

        })

      })

    }

    return;
  }

  if (msg.includes('!run')) {

    fightRequests.forEach((offer, index) => {
      if (offer.defenderNick === nick) {

        irc.send(channel, `BibleThump ${nick} runs away scared of ${offer.attackerNick} body`)

        fightRequests.splice(index, 1);
        return;
      }
    })


    return;
  }





  if (msg.match(/!gogym/)) {

    // get power 
    // get last workout
    // if he can workout at this time 

    const gymRestTime = 30 * 60 * 1000; //ms
    const powerAndTime = `SELECT * FROM users WHERE id = ?`;


    db.get(powerAndTime, [id], (error, data) => {

      const powerIncrease = Math.round(70 + 60 * Math.random()); // 70  - 130 

      if (data) {
        // IF USER EXISTS


        const increasedPower = data.power + powerIncrease;
        const timeDifference = Date.now() - data.lastgymtime;

        // IF PLAYER RESTED 30 MINS
        if (timeDifference > gymRestTime) {

          irc.send(channel, `@${nick}  worked hard in GYM, now you have ${increasedPower} ( +${powerIncrease} ) muscle power ! `);

          const powerUpdate = `UPDATE users SET power = ${increasedPower} , lastgymtime = ${Date.now()} WHERE id = ${data.id}`;

          db.run(powerUpdate, () => {

          })

        } else {
          // PLAYER TIRED
          const timeLeft = gymRestTime - timeDifference;

          irc.send(channel, `@${nick}, buddy , rest at least ${Math.floor( timeLeft/1000/60) } minutes more`);

        }




      } else {

        //NO SUCH PLAYER
        irc.send(channel, `@${nick} you worked hard IN GYM, ${0 + powerIncrease} ( +${powerIncrease} ) muscle power !`);

        const createUser = `INSERT INTO users VALUES(${id},${powerIncrease},0,0,${Date.now()}, "${nick}")`;

        db.run(createUser, () => {

        })

      }

    });

    return;
  }


}

//TODO SPACE IN COMANDS



//CONNECTION
socket.on('connect', () => {
  console.log('connected');

  socket.write(irc.getConnectionMsg(), () => {

    // socket.write(`CAP REQ :twitch.tv/membership\r\n`);


    for (const channel of channels) {

      irc.join(channel);

    }
    socket.write(`CAP REQ :twitch.tv/tags twitch.tv/commands\r\n`);

  });


})