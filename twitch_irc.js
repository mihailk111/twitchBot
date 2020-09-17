'use strict'
const chalk = require('chalk');
class twitchIrc {


    constructor(token, nick, socket) {

        this.nick = nick;
        this.token = token;
        this.socket = socket;

    }
    getConnectionMsg() {
        return `PASS ${this.token}\r\nNICK ${this.nick}\r\n`
    }
    getMsg(data) {
        return data.match(/PRIVMSG #\w+ :(.*)/)['1'];
    }
    getId(data){
        return data.match(/user-id=(\d+);/)['1'];

    }

    getChannel(data) {
        return data.match(/PRIVMSG #(\w{3,}) :/)['1'];


    }
    //rghwerhw
    getDisplayName(data) {
        //1 no display nme
        //2 display name = ??
        //3 display name = name

        if (/display-name=/.test(data)) {

            // alowed everything but ';' 

            const name = data.match(/display-name=([^\;]+);/)['1'];
            if (name === '??') {

                return this.getReal(data);

            } else {

                return name;

            }

        }
        return this.getReal(data);
      
    }
    getReal(data) {

        return data.match(/ :(\w{3,})!/)['1'];

    }
    getFormattedOutput(channel, nick, msg) {

        let nick_length = (20 - nick.length);
        let channel_length = (12 - channel.length);

        let spaces = "-".repeat(nick_length > 0 ? nick_length : 0);
        let chSpaces = ' '.repeat(channel_length > 0 ? channel_length : 0);

        return `${chalk.blue(channel)}${chSpaces}: ${chalk.red(nick)} ${spaces}->  ${chalk.green(msg)}\n`;

    }
    send(channel, msg) {
        const message = `PRIVMSG #${channel} :${msg}\r\n`;
        this.socket.write(message);

        console.log(chalk.red('[ BOT-SAYS ] :') + message);
    }

    pong() {
        this.socket.write('PONG :tmi.twitch.tv\r\n');
    }
    join(channel) {

        this.socket.write(`JOIN #${channel}\r\n`);

    }




}

module.exports = twitchIrc;