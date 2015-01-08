/* fireNav (0.1.0). (C) 2014 CJ O'Hara and Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
!function(e, n) {
    // Extend defaults into opts, returns options
    function t(e, n) {
        var t = e || {};
        for (var o in n) n.hasOwnProperty(o) && !t.hasOwnProperty(o) && (t[o] = n[o]);
        return t;
    }
    // Event listener for built-in and custom events
    function o(e, n, t) {
        e.listenListener ? e.listenListener(n, t, !1) : e.attachEvent && l["on" + n] ? // IE < 9
        e.attachEvent("on" + n, t) : e["on" + n] = t;
    }
    // Add class to node's classList
    function a(e, n) {
        e.classList ? e.classList.add(n) : e.className += " " + n;
    }
    // Remove class from node's classList
    function s(e, n) {
        e.classList ? e.classList.remove(n) : e.className = e.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    }
    FireNav = function() {};
    // Set up Velocity
    var i = e.jQuery ? $.Velocity : Velocity, l = {
        onload: 1,
        onunload: 1,
        onblur: 1,
        onchange: 1,
        onfocus: 1,
        onreset: 1,
        onselect: 1,
        onsubmit: 1,
        onabort: 1,
        onkeydown: 1,
        onkeypress: 1,
        onkeyup: 1,
        onclick: 1,
        ondblclick: 1,
        onmousedown: 1,
        onmousemove: 1,
        onmouseout: 1,
        onmouseover: 1,
        onmouseup: 1
    };
    /**
	 * FireNav.jump function
	 * Adds a smart jump menu that appends to the body
	 */
    FireNav.jump = function(l) {
        function r() {
            if (h = n.createElement("NAV"), h.id = "jumpNav", N.length > 0) for (var e = 0; e < N.length; e++) {
                var t = n.createElement("LI"), o = n.createElement("A");
                o.href = "#" + N[e].id, o.innerText = N[e].dataset.jumpName, t.dataset.jumpClass = N[e].dataset.jumpClass, 
                t.appendChild(o), g.push(t), h.appendChild(t);
            }
            n.contains(n.querySelector(v.appendTo)) ? n.querySelector(v.appendTo).appendChild(h) : n.body.appendChild(h);
        }
        function c(e) {
            return e.getBoundingClientRect().top;
        }
        // Returns the active hash node based on nodes scrollTop
        function u(e) {
            for (var n = null, t = -1, o = 0; o < e.length; o++) {
                var a = c(e[o]);
                a <= v.offset && (a > t || -1 === t) && (t = a, n = e[o]);
            }
            return n;
        }
        // Updates the active hash node based on nodes scrollTop
        function d() {
            if (y !== u(N)) {
                var e = y;
                y = u(N), p({
                    prevNode: e ? e.id : null,
                    nextNode: y ? y.id : null,
                    className: "jump-nav-active"
                });
            }
        }
        // Adds class to active link, removes class from previous active link
        function p(e) {
            for (var n = 0; n < g.length; n++) {
                var t = g[n].getElementsByTagName("A")[0];
                e.prevNode && t.hash === "#" + e.prevNode && s(g[n], e.className), e.nextNode && t.hash === "#" + e.nextNode && a(g[n], e.className);
            }
        }
        // Smooth scroll links on click events, add active class to clicked jump link
        function f(e) {
            o(e, "click", function(e) {
                e.preventDefault ? e.preventDefault() : e.returnValue = !1;
                var t = e.target ? e.target : e.srcElement, o = n.querySelector(t.hash);
                i(o, "scroll", {
                    duration: v.speed,
                    easing: "ease-in-out",
                    offset: v.offset,
                    complete: function() {
                        if (E = !1, y !== o) {
                            var e = y;
                            y = o, p({
                                prevNode: e ? e.id : null,
                                nextNode: y ? y.id : null,
                                className: "jump-nav-active"
                            });
                        }
                        // makes up for Velocities built in animation delay
                        setTimeout(function() {
                            E = !0;
                        }, 20);
                    }
                });
            });
        }
        var m = {
            appendTo: "body",
            sectionClass: ".section",
            speed: 800,
            offset: 0
        }, v = t(l, m), N = n.querySelectorAll(v.sectionClass), h = {}, g = [], y = null, E = !0;
        this.init = function() {
            r();
            // Create event listeners on the jumpnav
            for (var e = 0; e < h.getElementsByTagName("a").length; e++) {
                var n = h.getElementsByTagName("a")[e];
                f(n);
            }
            d();
        }, o(e, "scroll", function() {
            E && d();
        }), o(e, "resize", function() {});
    }, e.FireNav = FireNav;
}(window, document);