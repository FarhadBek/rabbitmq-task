const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4002;
const expressWinston = require('express-winston')
// const { transports, format } = require('winston')

const logger = require('./logger')

app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true
}))

var amqp = require('amqplib');

var channel, connection;
connectQueue()
 
async function connectQueue() {
    try {
        connection = await amqp.connect("amqp://localhost:5672");
        channel    = await connection.createChannel()
        
        await channel.assertQueue("test-queue")
        console.log('Awaiting RPC requests');
        logger.info('Awaiting RPC requests');
        
        channel.consume("test-queue", data => {
            let resp = data.content.num*5
            channel.sendToQueue(msg.properties.replyTo, resp, {
                correlationId: msg.properties.correlationId
            });
            

            channel.ack(data);
        })
    } catch (error) {
        logger.error(error);
    }
}

app.listen(PORT, () => console.log("Server running at port " + PORT));

