
//////////////////////////////////////////////////////////////////////////////////////////
// Force SVG - a simple library to force the rendering of SVG in text/html              //
// Robin Berjon - http://berjon.com/hacks/force-svg/                                    //
//////////////////////////////////////////////////////////////////////////////////////////

// XXX TODO:
//  - this is old code, it needs to be improved
//  - look into whether this is ever needed with IE
//  - test that it works well in general
//  - test createElementNS wrapper
// Limitations:
//  - due to variance in the text/html parsing between browsers, empty SVG element
//    have to be written as <foo></foo> instead of <foo/>
//  - SVG elements cannot be using a prefix
(function (win) {
    win.ForceSVG = {
        SVG_NS:         "http://www.w3.org/2000/svg",

        fixElements:    ['feGaussianBlur','altGlyph','altGlyphDef','altGlyphItem','animateColor',
                         'animateMotion','animateTransform','clipPath','feBlend','feColorMatrix',
                         'feComponentTransfer','feComposite','feConvolveMatrix','feDiffuseLighting',
                         'feDisplacementMap','feDistantLight','feFlood','feFuncA','feFuncB','feFuncG',
                         'feFuncR','feGaussianBlur','feImage','feMerge','feMergeNode','feMorphology',
                         'feOffset','fePointLight','feSpecularLighting','feSpotLight','feTile',
                         'feTurbulence','foreignObject','glyphRef','linearGradient','radialGradient',
                         'textPath'],

        fixAttributes:  {
            attributeType:        ['animate','set','animateMotion','animateColor','animateTransform'],
            attributeName:        ['animate','set','animateMotion','animateColor','animateTransform'],
            baseFrequency:        ['feTurbulence'],
            baseProfile:          ['svg'],
            calcMode:             ['animateMotion'],
            clipPathUnits:        ['clipPath'],
            contentScriptType:    ['svg'],
            contentStyleType:     ['svg'],
            diffuseConstant:      ['feDiffuseLighting'],
            edgeMode:             ['feConvolveMatrix'],
            externalResourcesRequired:    ['g', 'defs', 'symbol', 'use', 'image', 'switch', 'path', 'rect', 'circle', 
                                           'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'tref', 'textPath', 
                                           'altGlyph', 'marker', 'linearGradient', 'radialGradient', 'pattern', 'clipPath', 
                                           'mask', 'filter', 'feImage', 'cursor', 'a', 'view', 'script', 'animate', 'set',
                                           'animateMotion', 'animateColor', 'animateTransform', 'font', 'foreignObject', 
                                           'svg', 'mpath'],
            feColorMatrix:        ['filter'],
            feComposite:          ['filter'],
            feGaussianBlur:       ['filter'],
            feMorphology:         ['filter'],
            feTile:               ['filter'],
            filterRes:            ['filter'],
            filterUnits:          ['filter'],
            glyphRef:             ['altGlyph', 'glyphRef'],
            gradientTransform:    ['linearGradient', 'radialGradient'],
            gradientUnits:        ['linearGradient', 'radialGradient'],
            kernelMatrix:         ['feConvolveMatrix'],
            kernelUnitLength:     ['feConvolveMatrix', 'feDiffuseLighting', 'feSpecularLighting'],
            keyPoints:            ['animateMotion'],
            keySplines:           ['animate', 'animateMotion', 'animateColor', 'animateTransform'],
            keyTimes:             ['animate', 'animateMotion', 'animateColor', 'animateTransform'],
            lengthAdjust:         ['textPath', 'text', 'tspan', 'tref'],
            limitingConeAngle:    ['feSpotLight'],
            maskContentUnits:     ['mask'],
            maskUnits:            ['mask'],
            numOctaves:           ['feTurbulence'],
            pathLength:           ['path'],
            patternContentUnits:  ['pattern'],
            patternTransform:     ['pattern'],
            patternUnits:         ['pattern'],
            pointsAtX:            ['feSpotLight'],
            pointsAtY:            ['feSpotLight'],
            pointsAtZ:            ['feSpotLight'],
            preserveAlpha:        ['feConvolveMatrix'],
            preserveAspectRatio:  ['svg', 'symbol', 'image', 'marker', 'pattern', 'view'],
            primitiveUnits:       ['filter'],
            refX:                 ['marker'],
            refY:                 ['marker'],
            repeatCount:          ['animate','set','animateMotion','animateColor','animateTransform'],
            repeatDur:            ['animate','set','animateMotion','animateColor','animateTransform'],
            requiredExtensions:   ['*'],
            specularConstant:     ['feSpecularLighting'],
            specularExponent:     ['feSpecularLighting', 'feSpotLight'],
            spreadMethod:         ['linearGradient', 'radialGradient'],
            startOffset:          ['textPath'],
            stdDeviation:         ['feGaussianBlur'],
            surfaceScale:         ['feTurbulence'],
            systemLanguage:       ['*'],
            tableValues:          ['feFuncR','feFuncG','feFuncB','feFuncA'],
            targetX:              ['feConvolveMatrix'],
            targetY:              ['feConvolveMatrix'],
            textLength:           ['text', 'tspan', 'tref', 'textPath'],
            viewBox:              ['svg', 'symbol', 'marker', 'pattern', 'view'],
            viewTarget:           ['view'],
            xChannelSelector:     ['feDisplacementMap'],
            yChannelSelector:     ['feDisplacementMap'],
            zoomAndPan:           ['svg', 'view'],
        },

        optFixAttr: {},
        optFixed:   false,

        forceAllSVG:    function (doc, cb) {
            if (!doc) doc = document;
            var svgs = doc.getElementsByTagName("svg");
            for (var i = 0; i < svgs.length; i++) this.forceSVG(svgs[i]);
            if (cb) cb();
            if (win.onsvgload) win.onsvgload();
        },

        forceSVG:       function (svg) {
            if (!DOMParser) return;
            //if (svg instanceof SVGSVGElement) return; // this test would be nice but it fails Safari
            this.optimiseFixAttrMap();
            var div = document.createElement("div");
            var clone = svg.cloneNode(true);
            clone.setAttribute("xmlns", this.SVG_NS);
            clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            div.appendChild(clone);
            var dom = (new DOMParser()).parseFromString(div.innerHTML, "application/xml"); // image/svg+xml would be nicer
            this.fixCase(dom);
            var newSVG = document.importNode(dom.documentElement, true);
            svg.parentNode.replaceChild(newSVG, svg);
        },

        // XXX completely untested
        fixCreateElementNS:     function (doc) {
            if (!doc) doc = Document; // this might be a bad idea
            var origCENS = doc.createElementNS;
            var svgNS = this.SVG_NS;
            doc.createElementNS = function (ns, ln) {
                if (ns != svgNS) return origCENS.call(this, ns, ln);
                var str = "<" + ln + " xmlns='" + svgNS + "'/>";
                var el = (new DOMParser()).parseFromString(str, "application/xml").documentElement;
                return this.importNode(el, true);
            };
        },

        // this creates a map of element names to a list of attributes
        optimiseFixAttrMap:     function () {
            if (this.optFixed) return;
            for (var k in this.fixAttributes) {
                for (var i = 0; i < this.fixAttributes[k].length; i++) {
                    var el = this.fixAttributes[k][i];
                    if (!this.optFixAttr[el]) this.optFixAttr[el] = {};
                    this.optFixAttr[el][k] = true;
                }
            }
            this.optFixed = true;
        },

        fixCase:    function (doc) {
            // fix mixed case elements
            for (var i = 0; i < this.fixElements.length; i++) {
                var ln = this.fixElements[i];
                var els = doc.getElementsByTagNameNS(this.SVG_NS, ln.toLowerCase());
                for (var j = 0; j < els.length; j++) {
                    var el = els[j];
                    // create new element, move over the content, move over the attributes
                    var newEl = doc.createElementNS(this.SVG_NS, ln);
                    while (el.childNodes.length > 0) newEl.appendChild(el.firstChild);

                    if (el.hasAttributes()) {
                        for (var k = 0; k < el.attributes.length; k++) {
                            var at = el.attributes[k];
                            newEl.setAttributeNS(null, at.name, at.value);
                        }
                        // optimisation attempt, maybe do later
                        // for (var at in this.optFixAttr[ln]) {
                        //     if (el.hasAttributeNS(null, at.toLowerCase())) {
                        //         newEl.setAttributeNS(null, at, el.getAttributeNS(null, at.toLowerCase()));
                        //     }
                        // }
                    }
                    if (el.id) newEl.id = el.id;
                    el.parentNode.replaceChild(newEl, el);
                }
            }

            // fix mixed case attributes
            for (var ln in this.optFixAttr) {
                // if (/[A-Z]/.test(ln)) continue; // skip this optimisation for now
                if (ln == '*') continue; // we don't support requiredExtensions and systemLanguage at this point
                var els = doc.getElementsByTagNameNS(this.SVG_NS, ln);
                for (var i = 0; i < els.length; i++) {
                    var el = els[i];
                    for (var at in this.optFixAttr[ln]) {
                        if (el.hasAttributeNS(null, at.toLowerCase())) {
                            el.setAttributeNS(null, at, el.getAttributeNS(null, at.toLowerCase()));
                            el.removeAttributeNS(null, at.toLowerCase());
                        }
                    }
                }
            }
        }
    };
    // immediate trigger
    win.ForceSVG.forceAllSVG();
})(window);
