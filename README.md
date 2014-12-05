Given the state of SVG support today, this is absolutely not needed anymore. This repo is here only for historical purposes.

#  SVG Boilerplate [http://svgboilerplate.com](http://svgboilerplate.com)

## WARNING:

This is a very early, alpha, untested version. It has all sorts of horrible flaws and will probably
catch fire if you pet it wrong. Don't feed the <tspan> elements.

This is work in progress, it probably doesn't do all that it says on the tin. It hasn't been tested
with all the relevant platforms.

## License:

External components:

* Modernizr: MIT/BSD license
* SVG Web: Apache License, Version 2.0
* FakeSMIL: MIT

Everything else:

* [The Unlicense](http://unlicense.org) (aka: public domain) 

Many thanks to the HTML5 Boilerplate [http://html5boilerplate.com](http://html5boilerplate.com)!

## Summary:

This is a set of files based on the same principle as the HTML5 Boilerplate, intended to help
developers bootstrap an SVG-using HTML5 document with the following tricks:

1. Cross-browser compatible, down to IE6
2. SVG working in HTML even where HTML5 parsing isn't supported (with minimal caveats)
3. SMIL support everywhere
4. Server-side configuration of the proper media types in case they aren't already there
5. Should be easy enough to include into the HTML5 Boilerplate if you're already using that

## Tools:

You may wonder why there is a tools directory, and having looked into it scream that it contains
some Java. The reason for this is that in cases where SVG Web emulation kicks in, it will have
trouble accessing content from file:// — you have to use it from a web server. In the unlikely
case that you don't have one handy, fire up the one in tools, as explained in
[the SVG Web documentation](http://codinginparadise.org/projects/svgweb/docs/QuickStart.html).

