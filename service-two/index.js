const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4002;
const expressWinston = require('express-winston')

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
        channel    = await connection.createChannel();
        
        await channel.assertQueue("test-queue", {durable: true });
        channel.prefetch(1);
        console.log('Awaiting RPC requests');
        logger.info('Awaiting RPC requests');
        
        channel.consume("test-queue", msg => {
            let n = parseInt(msg.content.toString());
            let result = n * 5;

            let resultBuffer = Buffer.from(result.toString());
            channel.sendToQueue(msg.properties.replyTo, resultBuffer, {
                correlationId: msg.properties.correlationId
            });
            logger.info("Message sent to queue");

            channel.ack(msg);
        });
    } catch (error) {
        logger.error(error);
    }
}

app.listen(PORT, () => console.log("Server running at port " + PORT));