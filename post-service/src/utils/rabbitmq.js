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
    logger.info('RabbitMQ connected successfully')

    channel.on('return', msg => {
      logger.error('Message returned: ', {
        ...msg.fields,
        content: msg.content.toString(),
      })
    })
  } catch (err) {
    logger.error('Error connecting to RabbitMQ', { error: err })
  }
}

const publishEvent = async (routeKey, msg) => {
  if(!connection || connection.connection.stream.destroyed) {
    await connectRabbitMQ()
  }

  await channel.publish(EXCHANGE_NAME, routeKey, Buffer.from(JSON.stringify(msg)), { mandatory: true })
  logger.info(`Event published on routeKey: ${routeKey}`)
}

module.exports = {
  connectRabbitMQ,
  publishEvent
}