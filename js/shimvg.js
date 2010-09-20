// XXX
// - we could simplify a bit if we assumed jQuery
(function (doc, win) {
    function ancestorNames (el) {
        var res = [];
        while (el.parentNode && el.parentNode.nodeType === 1) {
            res.push(el.tagName.toLowerCase());
            el = el.parentNode;
        }
        return res;
    }
    function addScript (opt, attr) {
        var scr = doc.createElement("script");
        if (opt.src) scr.src = opt.src;
        if (opt.text) scr.textContent = opt.text;
        if (opt.async) scr.async = opt.async;
        if (opt.onload) scr.onload = opt.onload;
        if (attr) {
            for (var k in attr) scr.setAttribute(k, attr[k]);
        }
        doc.getElementsByTagName("body")[0].appendChild(scr);
    }
    function hasHTML5Parser () {
        var div = doc.createElement("div");
        div.innerHTML = "<svg><rect/><circle/></svg>";
        return div.childNodes.length === 1 && div.firstChild.childNodes.length === 2;
    }
    
    // find base
    var base = "";
    var scripts = doc.getElementsByTagName("script");
    for (var i = 0, n = scripts.length; i < n; i++) {
        var scr = scripts[i];
        if (/shimvg\.js/.test(scr.src)) {
            base = scr.src;
            base = base.replace(/shimvg\.js.*$/, "");
            break;
        }
    }

    if (Modernizr.svg) {
        // check that we have a proper parser
        if (!hasHTML5Parser()) {
            addScript({ src: base + "force-svg.js", onload: function () {
                win.ForceSVG.forceAllSVG(doc, function () {
                    if (win.onsvgload) win.onsvgload();
                });
            } });
        }
        else {
            if (win.onsvgload) win.onsvgload();
        }
        // bring in FakeSMIL
        if (!Modernizr.smil) addScript({ src: base + "smil.user.js" });
    }
    else {
        // reparent to script (checking no svg or script in ancestors)
        var svgs = doc.getElementsByTagName("svg");
        SVG:
            for (var i = 0, n = svgs.length; i < n; i++) {
                var svg = svgs[i];
                var ancs = ancestorNames(svg);
                for (var j = 0, n = ancs.length; j < n; j++) {
                    if (ancs[j] === "script" || ancs[j] === "svg") continue SVG;
                }
                var scr = doc.createElement("script");
                scr.type = "image/svg+xml";
                svg.parentNode.replaceChild(scr, svg);
                scr.appendChild(svg);
            }
        // bring in SVGWeb here (XXX not sure this works!)
        // we probably need one of those data-* attributes
        addScript({ src: base + "svg.js" }, { "data-path": base });
    }
})(document, window);
