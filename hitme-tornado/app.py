import math
import time, datetime, calendar
import os

import tornado.ioloop, tornado.web
import redis

# convert a python date to milliseconds since epoch
def get_timestamp(my_date):
  return int(time.mktime(my_date.timetuple())) * 1000

# get timestamps for each timespan from `now_timestamp`
def get_timestamps(now_timestamp):
  now_date = datetime.datetime.fromtimestamp(now_timestamp)
  month_date = datetime.datetime(now_date.year, now_date.month, 1)
  week_day_offset = now_date.day - now_date.weekday()
  week_date = datetime.datetime(now_date.year, now_date.month, now_date.day) - datetime.timedelta(days = week_day_offset)
  day_date = datetime.datetime(now_date.year, now_date.month, now_date.day)
  hour_date = datetime.datetime(now_date.year, now_date.month, now_date.day, now_date.hour)
  minute_date = datetime.datetime(now_date.year, now_date.month, now_date.day, now_date.hour, now_date.minute)
  return get_timestamp(month_date), get_timestamp(week_date), get_timestamp(day_date), get_timestamp(hour_date), get_timestamp(minute_date)

# `GET /hits` handler returns hits for all urls for a given `timestamp`
class HitsHandler(tornado.web.RequestHandler):
  # setup the redis client from the main application
  def initialize(self, redis_client):
    self.redis_client = redis_client

  # handles `GET /hits`
  def get(self):
    # get and normalize the timestamp query param
    timestamp = self.get_argument("timestamp", None)

    if timestamp and timestamp != "0":
      timestamp = math.floor(int(timestamp) / 1000)
    else:
      timestamp = int(time.time())

    # get timestamps for each range
    timestamps = get_timestamps(timestamp)
    month_timestamp,week_timestamp,day_timestamp,hour_timestamp,minute_timestamp = timestamps[:]

    # use redis MULTI/EXEC to batch commands
    pipe = self.redis_client.pipeline()
    pipe.multi()
    pipe.hgetall("hits:all")
    pipe.hgetall("hits:month:%s" % month_timestamp)
    pipe.hgetall("hits:week:%s" % week_timestamp)
    pipe.hgetall("hits:day:%s" % day_timestamp)
    pipe.hgetall("hits:hour:%s" % hour_timestamp)
    pipe.hgetall("hits:minute:%s" % minute_timestamp)

    # EXEC the multi-queue and destructure its reply
    all_time,last_month,last_week,last_day,last_hour,last_minute = pipe.execute()[:]

    # build a reply
    reply = {
      "status": 'OK',
      "all_time": all_time,
      "last_month": last_month,
      "last_week": last_week,
      "last_day": last_day,
      "last_hour": last_hour,
      "last_minute": last_minute,
    }

    self.write(reply)
    self.flush()
 
# `GET|POST /hit` handler
class HitHandler(tornado.web.RequestHandler):
  # setup the redis client from the main application
  def initialize(self, redis_client):
    self.redis_client = redis_client

  def get(self):
    # get and require the url query param
    url = self.get_argument("url", None)
    
    if not url:
      self.set_status(400)
      self.write({ "error": "Invalid URL" }) # TODO: update node version
      self.flush()
      return

    # get and normalize the timestamp query param
    timestamp = self.get_argument("timestamp", None)

    if timestamp and timestamp != "0":
      timestamp = math.floor(int(timestamp) / 1000)
    else:
      timestamp = int(time.time())

    # get timestamps for each range
    timestamps = get_timestamps(timestamp)
    month_timestamp,week_timestamp,day_timestamp,hour_timestamp,minute_timestamp = timestamps[:]

    # use redis MULTI/EXEC to batch commands
    pipe = self.redis_client.pipeline()
    pipe.multi()
    pipe.hget("hits:all", url)
    pipe.hget("hits:month:%s" % month_timestamp, url)
    pipe.hget("hits:week:%s" % week_timestamp, url)
    pipe.hget("hits:day:%s" % day_timestamp, url)
    pipe.hget("hits:hour:%s" % hour_timestamp, url)
    pipe.hget("hits:minute:%s" % minute_timestamp, url)

    # EXEC the multi-queue and destructure its reply
    all_time,last_month,last_week,last_day,last_hour,last_minute = pipe.execute()[:]

    # build a reply
    reply = {
      "status": 'OK',
      "url": url,
      "all_time": all_time or 0,
      "last_month": last_month or 0,
      "last_week": last_week or 0,
      "last_day": last_day or 0,
      "last_hour": last_hour or 0,
      "last_minute": last_minute or 0,
    }

    self.write(reply)
    self.flush()

  def post(self):
    # get and require the url query param
    url = self.get_argument("url", None)
    
    if not url:
      self.set_status(400)
      self.write({ "error": "Invalid URL" }) # TODO: update node version
      self.flush()
      return

    # get and normalize the timestamp query param
    timestamp = self.get_argument("timestamp", None)

    if timestamp and timestamp != "0":
      timestamp = math.floor(int(timestamp) / 1000)
    else:
      timestamp = int(time.time())

    # get timestamps for each range
    timestamps = get_timestamps(timestamp)
    month_timestamp,week_timestamp,day_timestamp,hour_timestamp,minute_timestamp = timestamps[:]

    # use redis MULTI/EXEC to batch commands
    pipe = self.redis_client.pipeline()
    pipe.multi()
    pipe.hincrby("hits:all", url, 1)
    pipe.hincrby("hits:month:%s" % month_timestamp, url, 1)
    pipe.hincrby("hits:week:%s" % week_timestamp, url, 1)
    pipe.hincrby("hits:day:%s" % day_timestamp, url, 1)
    pipe.hincrby("hits:hour:%s" % hour_timestamp, url, 1)
    pipe.hincrby("hits:minute:%s" % minute_timestamp, url, 1)
    # EXEC the multi-queue but discard its reply
    pipe.execute()

    # self.set_status(200)
    self.write({ "status": "OK" })
    self.flush()

# initializes a tornado web application and its routes
class Application(tornado.web.Application):
  def __init__(self):
    redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

    handlers = [
      (r"/hits", HitsHandler, { "redis_client": redis_client }),
      (r"/hit", HitHandler, { "redis_client": redis_client }),
      (r"/(.*)", tornado.web.StaticFileHandler, { "path": os.path.join(os.getcwd(), "public") }),
    ]

    tornado.web.Application.__init__(self, handlers)

# main wrapper
def main():
  port = 8000
  print "app:listening:%d" % (port)

  # create the tornado application
  app = Application()
  app.listen(port)
  io_loop = tornado.ioloop.IOLoop.instance() # start the tornado event loop
  
  # terminate without error messages
  try:
    io_loop.start()
  except KeyboardInterrupt:
    io_loop.stop()
    print 'stopped.'

if __name__ == "__main__":
  main()
