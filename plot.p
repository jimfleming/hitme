# output as png image
set terminal png

# save file to "graph.png"
set output "graph.png"

# graph title
set title "ab -n 100000 -c 5000"

# nicer aspect ratio for image size
set size 1,1

# y-axis grid
set grid y

# x-axis label
set xlabel "request"

# y-axis label
set ylabel "response time (ms)"

# plot data
plot "data0.dat" using 9 smooth sbezier with lines title "node", \
  "data1.dat" using 9 smooth sbezier with lines title "tornado", \
  "data2.dat" using 9 smooth sbezier with lines title "tornado+brukva", \
  "data3.dat" using 9 smooth sbezier with lines title "multithreaded"
