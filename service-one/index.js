const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;
const expressWinston = require('express-winston')
// const { transports, format } = require('winston')

const logger = require('./logger')


app.use(expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true
}))

app.use(express.json());

var amqp = require('amqplib');

var channel, connection; 
connectQueue();
async function connectQueue() {
    try {
        connection = await amqp.connect('amqp://localhost:5672');
        channel = await connection.createChannel();
        
        await channel.assertQueue('test-queue');
        logger.info("channel created successfully");
    } catch (error) {
        logger.error(error);
    }
}

function generateUuid() {
    return Math.random().toString() +
            Math.random().toString() +
            Math.random().toString();
}

const sendData = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            var resp, correlationId = generateUuid();
            channel.sendToQueue('test-queue', Buffer.from(JSON.stringify(data)), {
                correlationId: correlationId,
                replyTo: "test-queue"
            });
            logger.info("message sent successfully");

            channel.consume("test-queue", function (msg) {
                if (msg.properties.correlationId == correlationId) {

                    setTimeout(function () {
                        connection.close();
                        process.exit(0)
                    }, 500);

                    resp = msg.content.toString();
                    logger.info("response received");
                    resolve(resp);
                }
            }, {
                noAck: true
            });
        } catch (error) {
            logger.error(error);
            reject(error);
        }
    })
}

app.post("/multiply", async function(req, res) {
    let resp = await sendData(req.body.num);
    logger.info("A message is sent to queue")

    res.send("Number multiplied by 5 => "+resp)
})

app.listen(PORT, () => {
    console.log("Server running at port " + PORT)
    logger.info("Server running at port " + PORT)
});