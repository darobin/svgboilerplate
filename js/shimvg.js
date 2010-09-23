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
    function addScript (opt, attr, otherDoc) {
        var targetDoc = otherDoc || doc;
        var scr;
        if (opt.type && opt.type === "svg") {
            scr = targetDoc.createElementNS("http://www.w3.org/2000/svg", "script");
            if (opt.src) scr.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", opt.src);
        }
        else {
            scr = targetDoc.createElement("script");
            if (opt.src) scr.src = opt.src;
            if (opt.async) scr.async = opt.async;
        }
        if (opt.text) scr.textContent = opt.text;
        if (opt.onload) scr.onload = opt.onload;
        if (attr) {
            for (var k in attr) scr.setAttribute(k, attr[k]);
        }
        if (opt.type && opt.type === "svg") targetDoc.documentElement.appendChild(scr);
        else                                targetDoc.getElementsByTagName("body")[0].appendChild(scr);
        return scr;
    }
    function isXHTML () {
        var root = doc.documentElement;
        return root.namespaceURI === "http://www.w3.org/1999/xhtml" &&
               root.localName === "html" &&
               root. tagName === "html";
    }
    function hasHTML5Parser () {
        var div = doc.createElement("div");
        div.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg'><rect/><circle/></svg>";
        return div.childNodes.length === 1 && div.firstChild.childNodes.length === 2;
    }
    
    // find base
    var base = "";
    var debug = false;
    win.ShimSVGDebug = { objectInjections: [] };
    var scripts = doc.getElementsByTagName("script");
    for (var i = 0, n = scripts.length; i < n; i++) {
        var scr = scripts[i];
        if (/shimvg\.js/.test(scr.src)) {
            base = scr.src;
            base = base.replace(/shimvg\.js.*$/, "");
            if (scr.getAttribute("data-debug") === "true") {
                debug = true;
                win.ShimSVGDebug.base = base;
            }
            break;
        }
    }

    if (Modernizr.svg) {
        if (debug) win.ShimSVGDebug.nativeSVG = true;
        // check that we have a proper parser
        var html5Parser = hasHTML5Parser(),
            xhtml = isXHTML();
        if (!html5Parser && !xhtml) {
            if (debug) win.ShimSVGDebug.nativeHTML5 = false;
            // addScript({ src: base + "force-svg.js", onload: function () {
            //     win.ForceSVG.forceAllSVG(doc, function () {
            //         if (win.onsvgload) win.onsvgload();
            //     });
            // } });
            addScript({ src: base + "force-svg.js" });
        }
        else {
            if (debug) win.ShimSVGDebug.nativeHTML5 = true;
            if (win.onsvgload) win.onsvgload();
        }
        // bring in FakeSMIL
        if (debug) win.ShimSVGDebug.nativeSMIL = true;
        if (!Modernizr.smil) {
            if (debug) win.ShimSVGDebug.nativeSMIL = false;
            addScript({ src: base + "smil.user.js" });
            var objs = doc.getElementsByTagName("object");
            for (var i = 0, n = objs.length; i < n; i++) {
                var obj = objs[i];
                if (obj.getAttribute("type") === "image/svg+xml" || obj.getAttribute("classid") === "image/svg+xml") {
                    var src = obj.getAttribute("data") || obj.getAttribute("src");
                    if (debug) win.ShimSVGDebug.objectInjections.push(src);
                    // XXX get an absolute path to smil.user.js first
                    if (!obj.contentDocument) {
                        obj.addEventListener("load", function (ev) {
                            addScript({ src: base + "smil.user.js", type: "svg" }, {}, obj.contentDocument);
                            addScript({ text: "initSMIL();", type: "svg" }, {}, obj.contentDocument);
                        }, false);
                    }
                    else {
                        addScript({ src: base + "smil.user.js", type: "svg" }, {}, obj.contentDocument);
                    }
                }
            }
        }
        // Safari 5 supports SMIL but not HTML5, and if the animation is embedded it doesn't trigger
        if (!html5Parser && Modernizr.smil) {
            var anim = doc.querySelector("set, animate, animateTransform, animateMotion, animateColor");
            // this catches the culprits
            if (anim.getCurrentTime === undefined) {
                if (debug) win.ShimSVGDebug.nativeSMIL = false;
                addScript({ src: base + "smil.user.js", onload: function () { initSMIL(true); } });
            }
        }
    }
    else {
        if (debug) win.ShimSVGDebug.nativeSVG = false;
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
    if (debug) {
        var mode;
        if (win.ShimSVGDebug.nativeSVG) {
            if (win.ShimSVGDebug.nativeHTML5 && win.ShimSVGDebug.nativeSMIL) mode = "full-native";
            else if (win.ShimSVGDebug.nativeHTML5)                           mode = "native+fakeSMIL";
            else if (win.ShimSVGDebug.nativeSMIL)                            mode = "native+forceSVG";
            else                                                             mode = "native+fakeSMIL+forceSVG";
        }
        else {
            mode = "svgweb";
        }
        win.ShimSVGDebug.mode = mode;
        win.ShimSVGDebug.xhtml = xhtml;
    }
})(document, window);
