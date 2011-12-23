express = require('express')
redis = require('redis').createClient()

# url_regex = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/

app = express.createServer()

app.configure ->
  @use(express.bodyParser())
  @use(express.query())
  @use(express.compiler(src: "#{__dirname}/src", dest: "#{__dirname}/public", enable: ["coffeescript", "less"]))
  @use(express.static("#{__dirname}/public"))

# app.configure 'development', ->
  # @use(express.errorHandler(stack: true, message: true, dump: true))
  # @use(express.logger('dev'))
  # @use(express.profiler())

get_timestamps = (now_timestamp) ->
  now_date = new Date(now_timestamp)
  month_date = new Date(now_date.getFullYear(), now_date.getMonth(), 1)
  week_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate())
  week_date.setDate(week_date.getDate() - now_date.getDay())
  day_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate())
  hour_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours())
  minute_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours(), now_date.getMinutes())
  return [month_date.getTime(), week_date.getTime(), day_date.getTime(), hour_date.getTime(), minute_date.getTime()]

app.get '/hits', (req, res) ->
  { timestamp } = req.query
  timestamp = parseInt(timestamp) or Date.now()

  console.log 'GET /hits', timestamp

  [month_timestamp, week_timestamp, day_timestamp, hour_timestamp, minute_timestamp] = get_timestamps(timestamp)

  multi = redis.multi()
  multi.hgetall("hits:all")
  multi.hgetall("hits:month:#{month_timestamp}")
  multi.hgetall("hits:week:#{week_timestamp}")
  multi.hgetall("hits:day:#{day_timestamp}")
  multi.hgetall("hits:hour:#{hour_timestamp}")
  multi.hgetall("hits:minute:#{minute_timestamp}")
  multi.exec (err, replies) ->
    if err
      res.json(error: err.message, 500)
      return

    [all_time, last_month, last_week, last_day, last_hour, last_minute] = replies

    res.json
      status: 'OK'
      all_time: all_time or 0
      last_month: last_month or 0
      last_week: last_week or 0
      last_day: last_day or 0
      last_hour: last_hour or 0
      last_minute: last_minute or 0

app.get '/hit', (req, res) ->
  { timestamp, url } = req.query
  timestamp = parseInt(timestamp) or Date.now()

  console.log 'GET /hit', timestamp, url
  
  unless url
    res.send(error: 'Invalid URL', 400)
    return

  [month_timestamp, week_timestamp, day_timestamp, hour_timestamp, minute_timestamp] = get_timestamps(timestamp)

  multi = redis.multi()
  multi.hget("hits:all", url)
  multi.hget("hits:month:#{month_timestamp}", url)
  multi.hget("hits:week:#{week_timestamp}", url)
  multi.hget("hits:day:#{day_timestamp}", url)
  multi.hget("hits:hour:#{hour_timestamp}", url)
  multi.hget("hits:minute:#{minute_timestamp}", url)
  multi.exec (err, replies) ->
    if err
      res.json(error: err.message, 500)
      return

    [all_time, last_month, last_week, last_day, last_hour, last_minute] = replies

    res.json
      status: 'OK'
      url: url
      all_time: all_time or 0
      last_month: last_month or 0
      last_week: last_week or 0
      last_day: last_day or 0
      last_hour: last_hour or 0
      last_minute: last_minute or 0

app.post '/hit', (req, res) ->
  { timestamp, url } = req.body
  timestamp = parseInt(timestamp) or Date.now()

  # console.log 'POST /hit', timestamp, url
  
  unless url
    res.send(error: 'Invalid URL', 400)
    return

  [month_timestamp, week_timestamp, day_timestamp, hour_timestamp, minute_timestamp] = get_timestamps(timestamp)

  multi = redis.multi()
  multi.hincrby("hits:all", url, 1)
  multi.hincrby("hits:month:#{month_timestamp}", url, 1)
  multi.hincrby("hits:week:#{week_timestamp}", url, 1)
  multi.hincrby("hits:day:#{day_timestamp}", url, 1)
  multi.hincrby("hits:hour:#{hour_timestamp}", url, 1)
  multi.hincrby("hits:minute:#{minute_timestamp}", url, 1)
  multi.exec (err, replies) ->
    if err
      res.json(error: err.message, 500)
      return

    res.json(status: 'OK', 200)

app.listen(port = 80)
console.log "app:listening:#{port}"
