'use strict';

const http = require('http');
const { APPLICATION_HOST, APPLICATION_PORT } = require('./config');
const { getApplicationHost, getApplicationPort } = require('./helpers');

const amqp = require('amqplib');

(async () => {
  try {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    const assertQueueResult = await channel.assertQueue('jobs');
    console.log(`Assert queue results: ${assertQueueResult}`);
    const sendToQueueResult = channel.sendToQueue(
      'jobs',
      Buffer.from(
        JSON.stringify({ login: 'nikolasmelui', password: 'password' }),
      ),
    );
    console.log(`Send to queue results: ${sendToQueueResult}`);
  } catch (error) {
    console.error(error);
  }
})();

http
  .createServer((req, res) => {
    res.writeHead(200, 'OK', { 'Content-Type': 'text/plain' });
    res.end(
      `Hello from ${getApplicationHost(req)}:${getApplicationPort(
        req,
      )} and welcome to the nikolasmelui-node-boilerplate!`,
    );
  })
  .listen(APPLICATION_PORT, APPLICATION_HOST, () =>
    console.log(
      `Server is listening on ${APPLICATION_HOST}:${APPLICATION_PORT}`,
    ),
  );
