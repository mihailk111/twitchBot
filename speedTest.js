const chalk = require('chalk');

const interval = {
    recived: 0,
    messages: 0,
    messagesLeft: 0,

    start(socket) {

        const i = setInterval(() => {
        
            let bytesRead = socket.bytesRead; // bytes all time
            let messages = this.messages;
            let msgDiff = messages - this.messagesLeft;
            let diff = (bytesRead - this.recived) / 5 / 1000; // Kbytes/sec 
            
           
           console.log(`
            +------------------------------+
            | READ SPEED     : ${chalk.redBright(diff.toFixed(3))} KB/sec   
            | MESSAGES SPEED :  ${msgDiff/5} Msg / sec
            +------------------------------+
           `);
           
            this.recived = bytesRead;
            this.messagesLeft = messages;



        }, 5000)

    },
    message(){
        this.messages ++;
    }

}


module.exports = interval;