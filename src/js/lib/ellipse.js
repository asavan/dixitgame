"use strict";
// https://codepen.io/chipChocolate/pen/dPVbrQ
/*
Usage: Position.ellipse(n, rx, ry, so, wh, idd, cls, cw);

where n = number of divs,
      rx = radius along X-axis,
      ry = radius along Y-axis,
      so = startOffset,
      wh = width/height of divs,
      idd = id of main div(ellipse),
      cls = className of divs;
      cw = clockwise(true/false)
*/

const Position = {
    ellipse : function(document, n, rx, ry, so, wh, idd, cls, cw) {
        var m = document.createElement("div"), ss = document.styleSheets;
        ss[0].insertRule("#" + idd + " { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border-radius: 50%; box-shadow: inset 0 0 " + wh + "px " + wh/4 +"px black; background: rgba(0, 0, 0, 0.2); width: " + String((rx * 2) + wh) + "px; height: " + String((ry * 2) + wh) + "px; }", 1);
        ss[0].insertRule("." + cls + "{ position: absolute; background: black; color: papayawhip; text-align: center; font-family: \"Open Sans Condensed\", sans-serif; border-radius: 50%; transition: transform 0.2s ease; width: " + wh + "px; height: " + wh + "px; line-height: " + wh + "px;}", 1);
        ss[0].insertRule("." + cls + ":hover { transform: scale(1.2); cursor: pointer; background: rgba(0, 0, 0, 0.8); }", 1);
        m.id = idd;
        for (var i = 0; i < n; i++) {
            var c = document.createElement("div");
            c.className = cls;
            c.innerHTML = i + 1;
            c.style.top = String(ry + -ry * Math.cos((360 / n / 180) * (i + so) * Math.PI)) + "px";
            c.style.left = String(rx + rx * (cw ? Math.sin((360 / n / 180) * (i + so) * Math.PI) : -Math.sin((360 / n / 180) * (i + so) * Math.PI))) + "px";
            m.appendChild(c);
        }
        document.body.appendChild(m);
    }
};

export default Position;

// Position.ellipse(5, 100, 150, 0, 35, 'main', 'circle', true);
