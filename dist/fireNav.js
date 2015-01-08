/* fireNav (0.1.0). (C) 2014 CJ O'Hara and Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
!function(e, n) {
    // Extend defaults into opts, returns options
    function t(e, n) {
        var t = e || {};
        for (var a in n) n.hasOwnProperty(a) && !t.hasOwnProperty(a) && (t[a] = n[a]);
        return t;
    }
    // Creates an event listener
    function a(e, n, t) {
        null !== e && "undefined" != typeof e && (e.addEventListener ? e.addEventListener(n, t, !1) : e.attachEvent ? e.attachEvent("on" + n, t) : e["on" + n] = t);
    }
    // Add class to node's classList
    function i(e, n) {
        e.classList ? e.classList.add(n) : e.className += " " + n;
    }
    // Remove class from node's classList
    function o(e, n) {
        e.classList ? e.classList.remove(n) : e.className = e.className.replace(new RegExp("(^|\\b)" + n.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    }
    FireNav = function() {};
    // Set up Velocity
    var s = e.jQuery ? $.Velocity : Velocity;
    /**
	 * FireNav.jump function
	 * Adds a smart jump menu that appends to the body
	 */
    FireNav.jump = function(r) {
        function l() {
            if (h = n.createElement("NAV"), h.id = "jumpNav", N.length > 0) for (var e = 0; e < N.length; e++) {
                var t = n.createElement("LI"), a = n.createElement("A");
                a.href = "#" + N[e].id, a.innerText = N[e].dataset.jumpName, t.dataset.jumpClass = N[e].dataset.jumpClass, 
                t.appendChild(a), g.push(t), h.appendChild(t);
            }
            n.contains(n.querySelector(m.appendTo)) ? n.querySelector(m.appendTo).appendChild(h) : n.body.appendChild(h);
        }
        function c(e) {
            return e.getBoundingClientRect().top;
        }
        // Returns the active hash node based on nodes scrollTop
        function u(e) {
            for (var n = null, t = -1, a = 0; a < e.length; a++) {
                var i = c(e[a]);
                i <= m.offset && (i > t || -1 === t) && (t = i, n = e[a]);
            }
            return n;
        }
        // Updates the active hash node based on nodes scrollTop
        function d() {
            if (y !== u(N)) {
                var e = y;
                y = u(N), f({
                    prevNode: e ? e.id : null,
                    nextNode: y ? y.id : null,
                    className: "jump-nav-active"
                });
            }
        }
        // Adds class to active link, removes class from previous active link
        function f(e) {
            for (var n = 0; n < g.length; n++) {
                var t = g[n].getElementsByTagName("A")[0];
                e.prevNode && t.hash === "#" + e.prevNode && o(g[n], e.className), e.nextNode && t.hash === "#" + e.nextNode && i(g[n], e.className);
            }
        }
        // Smooth scroll links on click events, add active class to clicked jump link
        function p(e) {
            a(e, "click", function(e) {
                e.preventDefault();
                var t = n.querySelector(e.target.hash);
                s(t, "scroll", {
                    duration: m.speed,
                    easing: "ease-in-out",
                    offset: m.offset,
                    complete: function() {
                        if (E = !1, y !== t) {
                            var e = y;
                            y = t, f({
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
        var v = {
            appendTo: "body",
            sectionClass: ".section",
            position: "right",
            speed: 800,
            offset: 0
        }, m = t(r, v), N = n.querySelectorAll(m.sectionClass), h = {}, g = [], y = null, E = !0;
        this.init = function() {
            l();
            // Create event listeners on the jumpnav
            for (var e = 0; e < h.getElementsByTagName("a").length; e++) {
                var n = h.getElementsByTagName("a")[e];
                p(n);
            }
            d();
        }, a(e, "scroll", function() {
            E && d();
        }), a(e, "resize", function() {});
    }, e.FireNav = FireNav;
}(window, document);