import time, datetime, calendar
import math
import os
import json
import redis

from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from SocketServer import ThreadingMixIn
import threading, socket
import urlparse
import cgi

from Queue import Queue

# threading pool from here:
# http://code.activestate.com/recipes/574454-thread-pool-mixin-class-for-use-with-socketservert/
class ThreadingPoolMixIn(ThreadingMixIn):
  numThreads = 1024
  allow_reuse_address = True

  def serve_forever(self):
    self.requests = Queue(self.numThreads)

    for x in range(self.numThreads):
      t = threading.Thread(target = self.process_request_thread)
      t.setDaemon(1)
      t.start()

    # server main loop
    while True:
      self.handle_request()
        
    self.server_close()
  
  def process_request_thread(self):
    while True:
      ThreadingMixIn.process_request_thread(self, *self.requests.get())
  
  def handle_request(self):
    try:
      request, client_address = self.get_request()
    except socket.error:
      return

    if self.verify_request(request, client_address):
      self.requests.put((request, client_address))

def get_timestamp(my_date):
  return int(time.mktime(my_date.timetuple())) * 1000

def get_timestamps(now_timestamp):
  now_date = datetime.datetime.fromtimestamp(now_timestamp)
  month_date = datetime.datetime(now_date.year, now_date.month, 1)
  week_day_offset = now_date.day - now_date.weekday()
  week_date = datetime.datetime(now_date.year, now_date.month, now_date.day) - datetime.timedelta(days = week_day_offset)
  day_date = datetime.datetime(now_date.year, now_date.month, now_date.day)
  hour_date = datetime.datetime(now_date.year, now_date.month, now_date.day, now_date.hour)
  minute_date = datetime.datetime(now_date.year, now_date.month, now_date.day, now_date.hour, now_date.minute)
  return get_timestamp(month_date), get_timestamp(week_date), get_timestamp(day_date), get_timestamp(hour_date), get_timestamp(minute_date)

def to_json(obj):
  return json.dumps(obj, separators=(',',':'))

class Handler(BaseHTTPRequestHandler):

  def handle_err(self, reply, code=500):
    try:
      self.send_response(code)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      self.wfile.write(to_json(reply))
      self.finish()
    except socket.error:
      print 'socket.error!'

  def handle_json(self, reply):
    try:
      self.send_response(200)
      self.send_header('Content-Type', 'application/json')
      self.end_headers()
      self.wfile.write(to_json(reply))
      self.finish()
    except socket.error:
      print 'socket.error!'

  def handle_hits_get(self, query):
    if query.has_key('timestamp'):
      timestamp = query["timestamp"][0] # trim trailing \n
      timestamp = math.floor(int(timestamp) / 1000)

    if not timestamp or timestamp == "0":
      timestamp = int(time.time())

    timestamps = get_timestamps(timestamp)
    month_timestamp,week_timestamp,day_timestamp,hour_timestamp,minute_timestamp = timestamps[:]

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    pipe = r.pipeline()
    pipe.multi()
    pipe.hgetall("hits:all")
    pipe.hgetall("hits:month:%s" % month_timestamp)
    pipe.hgetall("hits:week:%s" % week_timestamp)
    pipe.hgetall("hits:day:%s" % day_timestamp)
    pipe.hgetall("hits:hour:%s" % hour_timestamp)
    pipe.hgetall("hits:minute:%s" % minute_timestamp)

    all_time,last_month,last_week,last_day,last_hour,last_minute = pipe.execute()[:]

    reply = {
      "status": 'OK',
      "all_time": all_time,
      "last_month": last_month,
      "last_week": last_week,
      "last_day": last_day,
      "last_hour": last_hour,
      "last_minute": last_minute,
    }

    self.handle_json(reply)

  def handle_hit_get(self, query):
    if query.has_key('timestamp'):
      timestamp = query["timestamp"][0] # trim trailing \n
      timestamp = math.floor(int(timestamp) / 1000)

    if not timestamp or timestamp == "0":
      timestamp = int(time.time())

    if query.has_key('url'):
      url = query.url
    else:
      self.handle_err({ "error": "Invalid URL" }, 400)
      return

    timestamps = get_timestamps(timestamp)
    month_timestamp,week_timestamp,day_timestamp,hour_timestamp,minute_timestamp = timestamps[:]

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    pipe = r.pipeline()
    pipe.multi()
    pipe.hget("hits:all", url)
    pipe.hget("hits:month:%s" % month_timestamp, url)
    pipe.hget("hits:week:%s" % week_timestamp, url)
    pipe.hget("hits:day:%s" % day_timestamp, url)
    pipe.hget("hits:hour:%s" % hour_timestamp, url)
    pipe.hget("hits:minute:%s" % minute_timestamp, url)

    all_time,last_month,last_week,last_day,last_hour,last_minute = pipe.execute()[:]

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

    self.handle_json(reply)

  def handle_hit_post(self, body):
    if body.has_key('timestamp'):
      timestamp = body["timestamp"] # trim trailing \n
      timestamp = math.floor(int(timestamp) / 1000)

    if not timestamp or timestamp == "0":
      timestamp = int(time.time())

    if body.has_key('url'):
      url = body["url"]
    else:
      self.handle_err({ "error": "Invalid URL" }, 400)
      return

    timestamps = get_timestamps(timestamp)
    month_timestamp,week_timestamp,day_timestamp,hour_timestamp,minute_timestamp = timestamps[:]

    r = redis.StrictRedis(host='localhost', port=6379, db=0)
    pipe = r.pipeline()
    pipe.multi()
    pipe.hincrby("hits:all", url, 1)
    pipe.hincrby("hits:month:%s" % month_timestamp, url, 1)
    pipe.hincrby("hits:week:%s" % week_timestamp, url, 1)
    pipe.hincrby("hits:day:%s" % day_timestamp, url, 1)
    pipe.hincrby("hits:hour:%s" % hour_timestamp, url, 1)
    pipe.hincrby("hits:minute:%s" % minute_timestamp, url, 1)
    pipe.execute()

    self.handle_json({ "status": "OK" })
  
  def do_GET(self):
    parsed_path = urlparse.urlparse(self.path)
    path = parsed_path.path
    query = urlparse.parse_qs(parsed_path.query)

    print threading.currentThread().getName(), 'GET', path

    if path == "/hits":
      self.handle_hits_get(query)
    elif path == "/hit":
      self.handle_hit_get(query)

  def do_POST(self):
    parsed_path = urlparse.urlparse(self.path)
    path = parsed_path.path

    print threading.currentThread().getName(), 'POST', path

    form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={
      'REQUEST_METHOD':'POST',
      'CONTENT_TYPE':self.headers['Content-Type'],
    })

    body = {}

    for field_name in form.keys():
      field = form[field_name]
      body[field_name] = field.value

    if path == "/hit":
      self.handle_hit_post(body)

# use either ThreadingMixIn, ThreadingPoolMixIn (for thread pooling)
class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
  daemon_threads = True # don't wait for threads to finish before exiting
  request_queue_size = 1024
  allow_reuse_address = True

if __name__ == "__main__":
  port = 8002
  server = ThreadedHTTPServer(('localhost', 8002), Handler)
  print "app:listening:%d" % (port)

  try:
    server.serve_forever()
  except KeyboardInterrupt:
    print 'stopped.'
