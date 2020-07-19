'use strict';

const http = require('http');
const amqp = require('amqplib');

const { APPLICATION_HOST, APPLICATION_PORT } = require('./config');

const publish = async () => {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();
  const assertQueueResult = await channel.assertQueue('jobs');
  console.log(`Assert queue results: ${JSON.stringify(assertQueueResult)}`);

  const randomNumber = Math.floor(Math.random() * (9999 - 1000) + 1000);
  const sendToQueueResult = channel.sendToQueue(
    'jobs',
    Buffer.from(
      JSON.stringify({
        randomNumber,
      }),
    ),
  );
  if (!sendToQueueResult) throw new Error('Something went wrong');
  return randomNumber;
};

http
  .createServer(async (req, res) => {
    const { url } = req;

    if (url === '/publish') {
      try {
        const publishResult = await publish();
        console.log(publishResult);
        if (!publishResult) throw new Error('Publishing error');
        const resultMessage = `${publishResult} published to the queue`;
        console.log(resultMessage);
        res.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });
        res.end(resultMessage);
      } catch (error) {
        console.error(error);
      }
    }
    res.writeHead(404);
    res.end();
  })
  .listen(APPLICATION_PORT, APPLICATION_HOST, () =>
    console.log(
      `Server is listening on ${APPLICATION_HOST}:${APPLICATION_PORT}`,
    ),
  );
