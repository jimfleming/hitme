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
* hitme-tornado-non
* hitme-tornado


Benchmarking
------------

ab -n 100000 -c 1024 -p ab_data0 -T "application/x-www-form-urlencoded" http://localhost/hit
