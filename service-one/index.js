const express = require('express');
const app = express();
const PORT = process.env.PORT || 4001;
const expressWinston = require('express-winston');

const logger = require('./logger');

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true,
  }),
);

app.use(express.json());

var amqp = require('amqplib');

var channel, connection, q;
connectQueue();
async function connectQueue() {
  try {
    connection = await amqp.connect('amqp://localhost:5672');
    channel = await connection.createChannel();

    q = await channel.assertQueue('', { exclusive: true });
    logger.info('temp channel created successfully');
  } catch (error) {
    logger.error(error);
  }
}

function generateUuid() {
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

const sendData = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      var resp,
        correlationId = generateUuid();

      channel.sendToQueue('test-queue', Buffer.from(JSON.stringify(data)), {
        correlationId: correlationId,
        replyTo: q.queue,
      });
      logger.info('message sent successfully');

      channel.consume(
        q.queue,
        function (msg) {
          // console.log(msg.content.toString())
          if (msg.properties.correlationId == correlationId) {
            setTimeout(function () {
              connection.close();
              process.exit(0);
            }, 500);

            resp = msg.content.toString();
            logger.info('response received');
            resolve(resp);
          }
        },
        {
          noAck: true,
        },
      );
    } catch (error) {
      logger.error(error);
      reject(error);
    }
  });
};

app.post('/multiply', async function (req, res) {
  let resp = await sendData(req.body.num);
  logger.info('A message is sent to queue');

  res.send('Number multiplied by 5 => ' + resp);
});

app.listen(PORT, () => {
  logger.info('Server running at port ' + PORT);
});
