// XXX
// - we could simplify a bit if we assumed jQuery
(function (doc) {
    function ancestorNames (el) {
        var res = [];
        while (el.parentNode && el.parentNode.nodeType === 1) {
            res.push(el.tagName.toLowerCase());
            el = el.parentNode;
        }
        return res;
    }
    function addScript (opt) {
        var scr = doc.createElement("script");
        if (opt.src) scr.src = opt.src;
        if (opt.text) scr.textContent = opt.text;
        if (opt.async) scr.async = opt.async;
        doc.getElementsByTagName("body")[0].appendChild(scr);
    }
    function hasHTML5Parser () {
        var div = doc.createElement("div");
        div.innerHTML = "<svg><rect/><circle/></svg>";
        return div.childNodes.length === 1 && div.firstChild.childNodes.length === 2;
    }

    if (Modernizr.svg) {
        alert("I'm supporting SVG, and HTML5 parsing is: " + hasHTML5Parser());
        // check that we have a proper parser
        if (!hasHTML5Parser()) addScript({ src: "js/force-svg.js" });
        // bring in FakeSMIL
        if (!Modernizr.smil) addScript({ src: "js/smil.user.js" });
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
        addScript({ src: "svg.js" });
    }
})(document);
