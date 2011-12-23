#!/bin/bash
ab -r -n 100000 -c 20000 -p ab_data0 -T "application/x-www-form-urlencoded" http://localhost:8000/hit
