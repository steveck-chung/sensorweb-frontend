'use strict';

(function() {
  var draw = Chart.controllers.line.prototype.draw;
  Chart.controllers.line = Chart.controllers.line.extend({
    draw: function() {
      draw.call(this, arguments[0]);

      function yPosConverter(value) {
        var end = yScale.end;
        var top = yScale.top;
        var bottom = yScale.bottom;
        return (end - value) / end * (bottom - top) + top;
      }
      // draw line
      var ctx = this.chart.chart.ctx;
      var xScale = this.chart.scales['x-axis-0'];
      var yScale = this.chart.scales['y-axis-0'];
      var lines = [
        {
          value: 71,
          color: 'purple'
        },
        {
          value: 54,
          color: 'red'
        },
        {
          value: 36,
          color: 'gold'
        }
      ];

      for (var i = lines.length; --i >= 0;) {
        ctx.beginPath();
        ctx.moveTo(xScale.left, yPosConverter(lines[i].value));
        ctx.lineWidth = 1;
        ctx.strokeStyle = lines[i].color;
        ctx.lineTo(xScale.right, yPosConverter(lines[i].value));
        ctx.stroke();
        ctx.closePath();
      }
    }
  });
})();
