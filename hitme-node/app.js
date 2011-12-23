(function() {

  var app, express, get_timestamps, port, redis;

  express = require('express');
  redis = require('redis').createClient();
  app = express.createServer();

  app.configure(function() {
    this.use(express.bodyParser());
    this.use(express.query());
    this.use(express.compiler({ src: "" + __dirname + "/src", dest: "" + __dirname + "/public", enable: ["coffeescript", "less"] }));
    this.use(express.static("" + __dirname + "/public"));
  });

  get_timestamps = function(now_timestamp) {
    var day_date, hour_date, minute_date, month_date, now_date, week_date;

    now_date = new Date(now_timestamp);
    month_date = new Date(now_date.getFullYear(), now_date.getMonth(), 1);
    week_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate());
    week_date.setDate(week_date.getDate() - now_date.getDay());
    day_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate());
    hour_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours());
    minute_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours(), now_date.getMinutes());

    return [month_date.getTime(), week_date.getTime(), day_date.getTime(), hour_date.getTime(), minute_date.getTime()];
  };

  app.get('/hits', function(req, res) {
    var day_timestamp, hour_timestamp, minute_timestamp, month_timestamp, multi, timestamp, week_timestamp, timestamps;

    timestamp = req.query.timestamp;
    timestamp = parseInt(timestamp) || Date.now();
    timestamps = get_timestamps(timestamp), month_timestamp = timestamps[0], week_timestamp = timestamps[1], day_timestamp = timestamps[2], hour_timestamp = timestamps[3], minute_timestamp = timestamps[4];

    multi = redis.multi();
    multi.hgetall("hits:all");
    multi.hgetall("hits:month:" + month_timestamp);
    multi.hgetall("hits:week:" + week_timestamp);
    multi.hgetall("hits:day:" + day_timestamp);
    multi.hgetall("hits:hour:" + hour_timestamp);
    multi.hgetall("hits:minute:" + minute_timestamp);
    multi.exec(function(err, replies) {
      var all_time, last_day, last_hour, last_minute, last_month, last_week;

      if (err) {
        res.json({ error: err.message }, 500);
        return;
      }

      all_time = replies[0], last_month = replies[1], last_week = replies[2], last_day = replies[3], last_hour = replies[4], last_minute = replies[5];
      res.json({
        status: 'OK',
        all_time: all_time || 0,
        last_month: last_month || 0,
        last_week: last_week || 0,
        last_day: last_day || 0,
        last_hour: last_hour || 0,
        last_minute: last_minute || 0
      });
    });
  });

  app.get('/hit', function(req, res) {
    var day_timestamp, hour_timestamp, minute_timestamp, month_timestamp, multi, timestamp, url, week_timestamp, body, timestamps;

    body = req.query, timestamp = body.timestamp, url = body.url;
    timestamp = parseInt(timestamp) || Date.now();

    if (!url) {
      res.send({ error: 'Invalid URL' }, 400);
      return;
    }

    timestamps = get_timestamps(timestamp)
    month_timestamp = timestamps[0], week_timestamp = timestamps[1], day_timestamp = timestamps[2], hour_timestamp = timestamps[3], minute_timestamp = timestamps[4];

    multi = redis.multi();
    multi.hget("hits:all", url);
    multi.hget("hits:month:" + month_timestamp, url);
    multi.hget("hits:week:" + week_timestamp, url);
    multi.hget("hits:day:" + day_timestamp, url);
    multi.hget("hits:hour:" + hour_timestamp, url);
    multi.hget("hits:minute:" + minute_timestamp, url);
    multi.exec(function(err, replies) {
      var all_time, last_day, last_hour, last_minute, last_month, last_week;

      if (err) {
        res.json({ error: err.message }, 500);
        return;
      }

      all_time = replies[0], last_month = replies[1], last_week = replies[2], last_day = replies[3], last_hour = replies[4], last_minute = replies[5];
      res.json({
        status: 'OK',
        url: url,
        all_time: all_time || 0,
        last_month: last_month || 0,
        last_week: last_week || 0,
        last_day: last_day || 0,
        last_hour: last_hour || 0,
        last_minute: last_minute || 0
      });
    });
  });

  app.post('/hit', function(req, res) {
    var day_timestamp, hour_timestamp, minute_timestamp, month_timestamp, multi, timestamp, url, week_timestamp, body, timestamps;

    body = req.body, timestamp = body.timestamp, url = body.url;
    timestamp = parseInt(timestamp) || Date.now();

    if (!url) {
      res.send({ error: 'Invalid URL' }, 400);
      return;
    }

    timestamps = get_timestamps(timestamp)
    month_timestamp = timestamps[0], week_timestamp = timestamps[1], day_timestamp = timestamps[2], hour_timestamp = timestamps[3], minute_timestamp = timestamps[4];

    multi = redis.multi();
    multi.hincrby("hits:all", url, 1);
    multi.hincrby("hits:month:" + month_timestamp, url, 1);
    multi.hincrby("hits:week:" + week_timestamp, url, 1);
    multi.hincrby("hits:day:" + day_timestamp, url, 1);
    multi.hincrby("hits:hour:" + hour_timestamp, url, 1);
    multi.hincrby("hits:minute:" + minute_timestamp, url, 1);
    multi.exec(function(err, replies) {
      if (err) {
        res.json({ error: err.message }, 500);
        return;
      }

      res.json({ status: 'OK' }, 200);
    });
  });

  app.listen(port = 80);
  console.log("app:listening:" + port);

})();
