const invalidatePostCache = async (req, input) => {
  const cacheKey = `posts:${input}`
  await req.redisClient.del(cacheKey)

  const keys = req.redisClient.keys('posts:*')
  if (keys.length > 0) {
    await req.redisClient.del(keys)
  }
}

module.exports = {
  invalidatePostCache
}