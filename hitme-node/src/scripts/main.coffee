w = 400
h = 400

r = Math.min(w, h) / 2
color = d3.scale.category20()
arc = d3.svg.arc().outerRadius(r)
pie = d3.layout.pie()
  .sort(d3.descending)
  .value (d) ->
    return d.hits

chart = d3.select('#circle')
  .append('svg')
    .attr('width', w)
    .attr('height', h)
    .append('g')
      .attr('transform', "translate(#{r},#{r})")

d3.json '/hits', (data) ->
  $links = $('menu.times > li a')
  $links.on 'click', (e) ->
    $links.removeClass('active')
    $this = $(this)
    $this.addClass('active')
    range = $this.attr('data-range')
    data_range = data[range]
    render_graph(data_range)

  $links.eq(0).addClass('active')
  render_graph(data_range = data['all_time'])

render_graph = (data) ->
  data = _.map data, (hits, url) ->
    return hits: hits, url: url
  
  paths = chart.selectAll('path')
    .data(pie(data))

  paths.enter()
    .append('path')
      .attr 'fill', (d, i) ->
        return color(i)
      .attr('d', arc)
      .each (d) ->
        @_current = d

  paths.exit().remove()

  paths
    .transition()
    .ease('bounce')
    .duration(1000)
    .attrTween 'd', (b) ->
      b.innerRadius = r * 0.5
      i = d3.interpolate(@_current, b)
      @_current = i(0)
      return (t) ->
        return arc(i(t))
