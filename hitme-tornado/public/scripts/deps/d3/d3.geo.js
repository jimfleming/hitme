(function(){function b(a,b){return function(c){return c&&c.type in a?a[c.type](c):b}}function c(a){return"m0,"+a+"a"+a+","+a+" 0 1,1 0,"+ -2*a+"a"+a+","+a+" 0 1,1 0,"+2*a+"z"}function d(a,b){a.type in e&&e[a.type](a,b)}function f(a,b){d(a.geometry,b)}function g(a,b){for(var c=a.features,e=0,f=c.length;e<f;e++)d(c[e].geometry,b)}function h(a,b){for(var c=a.geometries,e=0,f=c.length;e<f;e++)d(c[e],b)}function i(a,b){for(var c=a.coordinates,d=0,e=c.length;d<e;d++)b.apply(null,c[d])}function j(a,b){for(var c=a.coordinates,d=0,e=c.length;d<e;d++)for(var f=c[d],g=0,h=f.length;g<h;g++)b.apply(null,f[g])}function k(a,b){for(var c=a.coordinates,d=0,e=c.length;d<e;d++)for(var f=c[d][0],g=0,h=f.length;g<h;g++)b.apply(null,f[g])}function l(a,b){b.apply(null,a.coordinates)}function m(a,b){for(var c=a.coordinates[0],d=0,e=c.length;d<e;d++)b.apply(null,c[d])}function n(a){return a.source}function o(a){return a.target}function p(b,c){function r(b){var c=Math.sin(p-(b*=p))/q,d=Math.sin(b)/q,g=c*h*e+d*n*k,j=c*h*f+d*n*l,m=c*i+d*o;return[Math.atan2(j,g)/a,Math.atan2(m,Math.sqrt(g*g+j*j))/a]}var d=b[0]*a,e=Math.cos(d),f=Math.sin(d),g=b[1]*a,h=Math.cos(g),i=Math.sin(g),j=c[0]*a,k=Math.cos(j),l=Math.sin(j),m=c[1]*a,n=Math.cos(m),o=Math.sin(m),p=r.d=Math.acos(Math.max(-1,Math.min(1,i*o+h*n*Math.cos(j-d)))),q=Math.sin(p);return r}d3.geo={};var a=Math.PI/180;d3.geo.azimuthal=function(){function j(c){var g=c[0]*a-f,j=c[1]*a,k=Math.cos(g),l=Math.sin(g),m=Math.cos(j),n=Math.sin(j),o=b!=="orthographic"?i*n+h*m*k:null,p,q=b==="stereographic"?1/(1+o):b==="gnomonic"?1/o:b==="equidistant"?(p=Math.acos(o),p?p/Math.sin(p):0):b==="equalarea"?Math.sqrt(2/(1+o)):1,r=q*m*l,s=q*(i*m*k-h*n);return[d*r+e[0],d*s+e[1]]}var b="orthographic",c,d=200,e=[480,250],f,g,h,i;return j.invert=function(c){var g=(c[0]-e[0])/d,j=(c[1]-e[1])/d,k=Math.sqrt(g*g+j*j),l=b==="stereographic"?2*Math.atan(k):b==="gnomonic"?Math.atan(k):b==="equidistant"?k:b==="equalarea"?2*Math.asin(.5*k):Math.asin(k),m=Math.sin(l),n=Math.cos(l);return[(f+Math.atan2(g*m,k*h*n+j*i*m))/a,Math.asin(n*i-(k?j*m*h/k:0))/a]},j.mode=function(a){return arguments.length?(b=a+"",j):b},j.origin=function(b){return arguments.length?(c=b,f=c[0]*a,g=c[1]*a,h=Math.cos(g),i=Math.sin(g),j):c},j.scale=function(a){return arguments.length?(d=+a,j):d},j.translate=function(a){return arguments.length?(e=[+a[0],+a[1]],j):e},j.origin([0,0])},d3.geo.albers=function(){function j(b){var c=g*(a*b[0]-f),j=Math.sqrt(h-2*g*Math.sin(a*b[1]))/g;return[d*j*Math.sin(c)+e[0],d*(j*Math.cos(c)-i)+e[1]]}function k(){var d=a*c[0],e=a*c[1],k=a*b[1],l=Math.sin(d),m=Math.cos(d);return f=a*b[0],g=.5*(l+Math.sin(e)),h=m*m+2*g*l,i=Math.sqrt(h-2*g*Math.sin(k))/g,j}var b=[-98,38],c=[29.5,45.5],d=1e3,e=[480,250],f,g,h,i;return j.invert=function(b){var c=(b[0]-e[0])/d,j=(b[1]-e[1])/d,k=i+j,l=Math.atan2(c,k),m=Math.sqrt(c*c+k*k);return[(f+l/g)/a,Math.asin((h-m*m*g*g)/(2*g))/a]},j.origin=function(a){return arguments.length?(b=[+a[0],+a[1]],k()):b},j.parallels=function(a){return arguments.length?(c=[+a[0],+a[1]],k()):c},j.scale=function(a){return arguments.length?(d=+a,j):d},j.translate=function(a){return arguments.length?(e=[+a[0],+a[1]],j):e},k()},d3.geo.albersUsa=function(){function e(e){var f=e[0],g=e[1];return(g>50?b:f<-140?c:g<21?d:a)(e)}var a=d3.geo.albers(),b=d3.geo.albers().origin([-160,60]).parallels([55,65]),c=d3.geo.albers().origin([-160,20]).parallels([8,18]),d=d3.geo.albers().origin([-60,10]).parallels([8,18]);return e.scale=function(f){return arguments.length?(a.scale(f),b.scale(f*.6),c.scale(f),d.scale(f*1.5),e.translate(a.translate())):a.scale()},e.translate=function(f){if(!arguments.length)return a.translate();var g=a.scale()/1e3,h=f[0],i=f[1];return a.translate(f),b.translate([h-400*g,i+170*g]),c.translate([h-190*g,i+200*g]),d.translate([h+580*g,i+430*g]),e},e.scale(a.scale())},d3.geo.bonne=function(){function h(h){var i=h[0]*a-d,j=h[1]*a-e;if(f){var k=g+f-j,l=i*Math.cos(j)/k;i=k*Math.sin(l),j=k*Math.cos(l)-g}else i*=Math.cos(j),j*=-1;return[b*i+c[0],b*j+c[1]]}var b=200,c=[480,250],d,e,f,g;return h.invert=function(e){var h=(e[0]-c[0])/b,i=(e[1]-c[1])/b;if(f){var j=g+i,k=Math.sqrt(h*h+j*j);i=g+f-k,h=d+k*Math.atan2(h,j)/Math.cos(i)}else i*=-1,h/=Math.cos(i);return[h/a,i/a]},h.parallel=function(b){return arguments.length?(g=1/Math.tan(f=b*a),h):f/a},h.origin=function(b){return arguments.length?(d=b[0]*a,e=b[1]*a,h):[d/a,e/a]},h.scale=function(a){return arguments.length?(b=+a,h):b},h.translate=function(a){return arguments.length?(c=[+a[0],+a[1]],h):c},h.origin([0,0]).parallel(45)},d3.geo.equirectangular=function(){function c(c){var d=c[0]/360,e=-c[1]/360;return[a*d+b[0],a*e+b[1]]}var a=500,b=[480,250];return c.invert=function(c){var d=(c[0]-b[0])/a,e=(c[1]-b[1])/a;return[360*d,-360*e]},c.scale=function(b){return arguments.length?(a=+b,c):a},c.translate=function(a){return arguments.length?(b=[+a[0],+a[1]],c):b},c},d3.geo.mercator=function(){function d(d){var e=d[0]/360,f=-(Math.log(Math.tan(Math.PI/4+d[1]*a/2))/a)/360;return[b*e+c[0],b*Math.max(-0.5,Math.min(.5,f))+c[1]]}var b=500,c=[480,250];return d.invert=function(d){var e=(d[0]-c[0])/b,f=(d[1]-c[1])/b;return[360*e,2*Math.atan(Math.exp(-360*f*a))/a-90]},d.scale=function(a){return arguments.length?(b=+a,d):b},d.translate=function(a){return arguments.length?(c=[+a[0],+a[1]],d):c},d},d3.geo.path=function(){function f(b,e){return typeof a=="function"&&(d=c(a.apply(this,arguments))),h(b)||null}function g(a){return e(a).join(",")}function j(a){var b=m(a[0]),c=0,d=a.length;while(++c<d)b-=m(a[c]);return b}function k(a){var b=d3.geom.polygon(a[0].map(e)),c=b.area(),d=b.centroid(c<0?(c*=-1,1):-1),f=d[0],g=d[1],h=c,i=0,j=a.length;while(++i<j)b=d3.geom.polygon(a[i].map(e)),c=b.area(),d=b.centroid(c<0?(c*=-1,1):-1),f-=d[0],g-=d[1],h-=c;return[f,g,6*h]}function m(a){return Math.abs(d3.geom.polygon(a.map(e)).area())}var a=4.5,d=c(a),e=d3.geo.albersUsa(),h=b({FeatureCollection:function(a){var b=[],c=a.features,d=-1,e=c.length;while(++d<e)b.push(h(c[d].geometry));return b.join("")},Feature:function(a){return h(a.geometry)},Point:function(a){return"M"+g(a.coordinates)+d},MultiPoint:function(a){var b=[],c=a.coordinates,e=-1,f=c.length;while(++e<f)b.push("M",g(c[e]),d);return b.join("")},LineString:function(a){var b=["M"],c=a.coordinates,d=-1,e=c.length;while(++d<e)b.push(g(c[d]),"L");return b.pop(),b.join("")},MultiLineString:function(a){var b=[],c=a.coordinates,d=-1,e=c.length,f,h,i;while(++d<e){f=c[d],h=-1,i=f.length,b.push("M");while(++h<i)b.push(g(f[h]),"L");b.pop()}return b.join("")},Polygon:function(a){var b=[],c=a.coordinates,d=-1,e=c.length,f,h,i;while(++d<e){f=c[d],h=-1;if((i=f.length-1)>0){b.push("M");while(++h<i)b.push(g(f[h]),"L");b[b.length-1]="Z"}}return b.join("")},MultiPolygon:function(a){var b=[],c=a.coordinates,d=-1,e=c.length,f,h,i,j,k,l;while(++d<e){f=c[d],h=-1,i=f.length;while(++h<i){j=f[h],k=-1;if((l=j.length-1)>0){b.push("M");while(++k<l)b.push(g(j[k]),"L");b[b.length-1]="Z"}}}return b.join("")},GeometryCollection:function(a){var b=[],c=a.geometries,d=-1,e=c.length;while(++d<e)b.push(h(c[d]));return b.join("")}}),i=f.area=b({FeatureCollection:function(a){var b=0,c=a.features,d=-1,e=c.length;while(++d<e)b+=i(c[d]);return b},Feature:function(a){return i(a.geometry)},Polygon:function(a){return j(a.coordinates)},MultiPolygon:function(a){var b=0,c=a.coordinates,d=-1,e=c.length;while(++d<e)b+=j(c[d]);return b},GeometryCollection:function(a){var b=0,c=a.geometries,d=-1,e=c.length;while(++d<e)b+=i(c[d]);return b}},0),l=f.centroid=b({Feature:function(a){return l(a.geometry)},Polygon:function(a){var b=k(a.coordinates);return[b[0]/b[2],b[1]/b[2]]},MultiPolygon:function(a){var b=0,c=a.coordinates,d,e=0,f=0,g=0,h=-1,i=c.length;while(++h<i)d=k(c[h]),e+=d[0],f+=d[1],g+=d[2];return[e/g,f/g]}});return f.projection=function(a){return e=a,f},f.pointRadius=function(b){return typeof b=="function"?a=b:(a=+b,d=c(a)),f},f},d3.geo.bounds=function(a){var b=Infinity,c=Infinity,e=-Infinity,f=-Infinity;return d(a,function(a,d){a<b&&(b=a),a>e&&(e=a),d<c&&(c=d),d>f&&(f=d)}),[[b,c],[e,f]]};var e={Feature:f,FeatureCollection:g,GeometryCollection:h,LineString:i,MultiLineString:j,MultiPoint:i,MultiPolygon:k,Point:l,Polygon:m};d3.geo.circle=function(){function g(){}function h(a){return f.distance(a)<e}function j(a){var b=-1,c=a.length,d=[],g,h,i,j,l;while(++b<c)l=f.distance(i=a[b]),l<e?(h&&d.push(p(h,i)((j-e)/(j-l))),d.push(i),g=h=null):(h=i,!g&&d.length&&(d.push(p(d[d.length-1],h)((e-j)/(l-j))),g=h)),j=l;return h&&d.length&&(l=f.distance(i=d[0]),d.push(p(h,i)((j-e)/(j-l)))),k(d)}function k(a){var b=0,c=a.length,d,e,g=c?[a[0]]:a,h,i=f.source();while(++b<c){h=f.source(a[b-1])(a[b]).coordinates;for(d=0,e=h.length;++d<e;)g.push(h[d])}return f.source(i),g}var c=[0,0],d=89.99,e=d*a,f=d3.geo.greatArc().target(Object);g.clip=function(a){return f.source(typeof c=="function"?c.apply(this,arguments):c),i(a)};var i=b({FeatureCollection:function(a){var b=a.features.map(i).filter(Object);return b&&(a=Object.create(a),a.features=b,a)},Feature:function(a){var b=i(a.geometry);return b&&(a=Object.create(a),a.geometry=b,a)},Point:function(a){return h(a.coordinates)&&a},MultiPoint:function(a){var b=a.coordinates.filter(h);return b.length&&{type:a.type,coordinates:b}},LineString:function(a){var b=j(a.coordinates);return b.length&&(a=Object.create(a),a.coordinates=b,a)},MultiLineString:function(a){var b=a.coordinates.map(j).filter(function(a){return a.length});return b.length&&(a=Object.create(a),a.coordinates=b,a)},Polygon:function(a){var b=a.coordinates.map(j);return b[0].length&&(a=Object.create(a),a.coordinates=b,a)},MultiPolygon:function(a){var b=a.coordinates.map(function(a){return a.map(j)}).filter(function(a){return a[0].length});return b.length&&(a=Object.create(a),a.coordinates=b,a)},GeometryCollection:function(a){var b=a.geometries.map(i).filter(Object);return b.length&&(a=Object.create(a),a.geometries=b,a)}});return g.origin=function(a){return arguments.length?(c=a,g):c},g.angle=function(b){return arguments.length?(e=(d=+b)*a,g):d},g.precision=function(a){return arguments.length?(f.precision(a),g):f.precision()},g},d3.geo.greatArc=function(){function e(){var a=typeof b=="function"?b.apply(this,arguments):b,e=typeof c=="function"?c.apply(this,arguments):c,f=p(a,e),g=d/f.d,h=0,i=[a];while((h+=g)<1)i.push(f(h));return i.push(e),{type:"LineString",coordinates:i}}var b=n,c=o,d=6*a;return e.distance=function(){var a=typeof b=="function"?b.apply(this,arguments):b,d=typeof c=="function"?c.apply(this,arguments):c;return p(a,d).d},e.source=function(a){return arguments.length?(b=a,e):b},e.target=function(a){return arguments.length?(c=a,e):c},e.precision=function(b){return arguments.length?(d=b*a,e):d/a},e},d3.geo.greatCircle=d3.geo.circle})();