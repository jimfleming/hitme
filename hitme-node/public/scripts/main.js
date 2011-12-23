(function() {

  var $graph, $message, arc, chart, color, w, h, r, pie, render_graph;

  $message = $(document.getElementById('message'));
  $graph = $(document.getElementById('graph'));

  w = 400;
  h = 400;
  r = Math.min(w, h) / 2;

  color = d3.scale.category20();
  arc = d3.svg.arc().outerRadius(r);

  pie = d3.layout.pie().sort(d3.descending).value(function(d) {
    return d.hits;
  });

  chart = d3.select('#circle')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .append('g')
    .attr('transform', "translate(" + r + "," + r + ")");

  d3.json('/hits', function(data) {
    var $links, data_range;

    $links = $('menu.times > li a');

    $links.on('click', function(e) {
      e.preventDefault();

      var $this, data_range, range;
      $links.removeClass('active');

      $this = $(this);
      $this.addClass('active');

      range = $this.attr('data-range');
      data_range = data[range];
      render_graph(data_range);
    });

    $links.eq(0).addClass('active');
    render_graph(data_range = data['all_time']);
  });

  render_graph = function(data) {
    var paths;

    data = _.map(data, function(hits, url) {
      return { hits: hits, url: url };
    });

    if (!data.length) {
      $message.addClass('active');
      $graph.removeClass('active');
      return;
    }

    $message.removeClass('active');
    $graph.addClass('active');

    paths = chart.selectAll('path')
      .data(pie(data));

    paths.enter().append('path').attr('fill', function(d, i) {
      return color(i);
    }).attr('d', arc).each(function(d) {
      return this._current = d;
    });

    paths.exit().remove();

    paths.transition().ease('bounce').duration(1000).attrTween('d', function(b) {
      var i;
      b.innerRadius = r * 0.5;
      i = d3.interpolate(this._current, b);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    });
  };

})();
