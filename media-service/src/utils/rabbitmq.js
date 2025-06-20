const amqp = require('amqplib')
const logger = require('./logger')

let connection = null
let channel = null

const EXCHANGE_NAME = 'post_events'

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL)
    channel = await connection.createChannel()

    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false })
    logger.info('Rabbit MQ connected successfully')
  } catch (err) {
    logger.error(`Failed to connect Rabbit MQ: ${err.message}`)
  }
}

const consumeEvent = async (routingKey, cb) => {
  if (!connection || connection.connection.stream.destroyed) {
    await connectRabbitMQ()
  }

  const q = await channel.assertQueue('', { exclusive: false })
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey)
  await channel.consume(q.queue, (msg) => {
    if(msg !== null) {
      const content = JSON.parse(msg.content.toString())
      cb?.(content)

      channel.ack(msg)
    }
  })

  logger.info(`Subscribed to event: ${routingKey}`)
}

module.exports = {
  connectRabbitMQ,
  consumeEvent
}