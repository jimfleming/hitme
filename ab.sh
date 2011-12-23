#!/bin/bash

# hitme-node
ab -g data0.dat -r -n 100000 -c 5000 -p ab_data0 -T "application/x-www-form-urlencoded" http://localhost/hit

sleep 10

# hitme-tornado
ab -g data1.dat -r -n 100000 -c 5000 -p ab_data1 -T "application/x-www-form-urlencoded" http://localhost:8000/hit

sleep 10

# hitme-tornado-non
ab -g data2.dat -r -n 100000 -c 5000 -p ab_data1 -T "application/x-www-form-urlencoded" http://localhost:8001/hit

sleep 10

# hitme-python-threaded
ab -g data3.dat -r -n 100000 -c 5000 -p ab_data2 -T "application/x-www-form-urlencoded" http://localhost:8002/hit
