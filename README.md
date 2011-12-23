HitMe
=====

Simple Redis-backed hit counter implemented in python and node.js


Endpoints
---------

* `GET /hit?url=URL&timestamp=TIMESTAMP` - get hits for a given url and timestamp (as ms since epoch)
* `GET /hits?timestamp=TIMESTAMP` - get all hits for a given timestamp (as ms since epoch)
* `POST /hit?url=URL&timestamp=TIMESTAMP` - record a hit for a given url and timestamp (as ms since epoch)

* /index.html - view graphs comparing site traffic for given intervals


Examples
--------

* POST: `curl -d "url=url=http%3A%2F%2Fwww.olark.com%2F&timestamp=0" http://localhost/hit`
* GET: `curl http://localhost/hit?url=http%3A%2F%2Fwww.olark.com%2F&timestamp=0`


Implementations
---------------

* hitme-node - node implementation of hitme using expressjs
* hitme-python-threaded - multi-threaded version of hitme using HTTPServer and ThreadingMixIn (see comments for optional ThreadingPoolMixIn)
* hitme-tornado-non - tornado-based python implementation using a non-blocking redis lib (doesn't use hiredis C binding so its actually slower)
* hitme-tornado - tornado-based python implementation using a blocking redis lib


Installation
------------

* hitme-node
  * `sudo npm install`
  * `sudo node app.js`
* hitme-python-threaded
  * `sudo pip install redis`
  * `sudo pip install hiredis`
* hitme-tornado-non
  * requires https://github.com/evilkost/brukva
* hitme-tornado
  * `sudo pip install redis`
  * `sudo pip install hiredis`


Benchmarking
------------

ab -n 100000 -c 1024 -p ab_data0 -T "application/x-www-form-urlencoded" http://localhost/hit


Sample Outputs
--------------

`GET /hits`

  {
    status: "OK",
    all_time: {
      http://www.olark.com/: "123850",
      http://www.olark.com/about.html: "50558",
      http://www.olark.com/features.html: "27024"
    },
    last_month: {
      http://www.olark.com/: "123850",
      http://www.olark.com/about.html: "50558",
      http://www.olark.com/features.html: "27024"
    },
    last_week: {
      http://www.olark.com/: "79277",
      http://www.olark.com/about.html: "50558",
      http://www.olark.com/features.html: "27024"
    },
    last_day: {
      http://www.olark.com/: "123850",
      http://www.olark.com/about.html: "50558",
      http://www.olark.com/features.html: "27024"
    },
    last_hour: {
      http://www.olark.com/: "44573"
    },
    last_minute: { }
  }


`GET /hit?url=http%3A%2F%2Fwww.olark.com%2F`

  {
    status: "OK",
    url: "http://www.olark.com/",
    all_time: "123850",
    last_month: "123850",
    last_week: "79277",
    last_day: "123850",
    last_hour: "44573",
    last_minute: 0
  }


`POST /hit` (`url=http%3A%2F%2Fwww.olark.com%2F&timestamp=0`)

  { status: "OK" }
