const sqlite3 = require('sqlite3').verbose();




// function randString() {
//     let string = '';

//     for (let index = 0; index < 10; index++) {
//         let number = 97 + Math.round( 25*Math.random());
//         string += String.fromCharCode(number);
//     }
//     return string;
// }

const db = new sqlite3.Database('./bot.db', (err) => {

    let sql = `SELECT  power,nick FROM users ORDER BY power DESC`;
    console.time();
    db.all(sql, (error, data) => {
        console.log(data);
        console.timeEnd();
    })

    //     for (let index = 0; index < 100; index++) {

    //         let id = Math.round( Math.random() * 1000000);

    //         console.log('id: ', id);

    //         let power = Math.round(Math.random() * 1000);

    //         console.log('power: ', power);

    //         let wins = Math.round(Math.random() * 100);

    //         console.log('wins: ', wins);

    //         let losses =Math.round( Math.random() * 100);

    //         console.log('losses: ', losses);

    //         let last = Math.round(Math.random() * 1000000) ;

    //         console.log('last: ', last);

    //         let nick = randString();
    //         console.log('nick: ', nick);

    //         let sql = `insert into users (id,power,wins,losses,lastgymtime,nick) values (?,?,?,?,?,?)`;

    //         console.log('sql: ', sql);

    //         db.run(sql,[id,power,wins,losses,last,nick], (error) => {
    //             if (error) {
    //                 console.log(error.message);
    //             } else {
    //                 console.log('inserted');
    //             }
    //         });

    //     }

    //     // db.run(`insert into users values(1,2,3,4,5,"acfefqwe")`,()=>{
    //     //     console.log('inserted');
    //     // });

});



// db.close;


//CREATE TABLE users (id int primary key not null, power int not null, wins int not null,losses int not null,lastgymtime int not null,nick text not null);