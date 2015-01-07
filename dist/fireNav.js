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
        null !== e && "undefined" != typeof e && (e.addEventListener ? e.addEventListener(n, t, !1) : e.attachEven ? e.attachEvent("on" + n, t) : e["on" + n] = t);
    }
    FireNav = function() {};
    // Set up Velocity
    var r = e.jQuery ? $.Velocity : Velocity;
    /**
	 * FireNav.jump function
	 * Adds a smart jump menu that appends to the body
	 */
    FireNav.jump = function(i) {
        function o() {
            if (s = n.createElement("NAV"), s.id = "jumpNav", v.length > 0) for (var e = 0; e < v.length; e++) {
                var t = n.createElement("LI"), a = n.createElement("A");
                a.href = "#" + v[e].id, a.innerText = v[e].dataset.jumpName, t.dataset.jumpClass = v[e].dataset.jumpClass, 
                t.appendChild(a), s.appendChild(t);
            }
            n.body.appendChild(s);
        }
        function l(e) {
            return e.getBoundingClientRect().top;
        }
        function c() {
            o();
            // Create event listens on the jumpnav
            for (var e = 0; e < s.getElementsByTagName("a").length; e++) a(s.getElementsByTagName("a")[e], "click", function(e) {
                e.preventDefault(), r(n.querySelector(e.target.hash), "scroll", {
                    duration: f.speed,
                    easing: "ease-in-out"
                });
            });
        }
        // Returns the active hash node based on nodes scrollTop
        function u(e) {
            for (var n = null, t = -1, a = 0; a < e.length; a++) {
                var r = l(e[a]);
                0 >= r && (r > t || -1 === t) && (t = r, n = e[a]);
            }
            return n;
        }
        var s, d = {
            sectionClass: ".section",
            position: "right",
            speed: 800
        }, f = t(i, d), v = n.querySelectorAll(f.sectionClass);
        c(), a(e, "scroll", function() {
            var n = u(v);
            e.location.hash = n.id;
        }), a(e, "resize", function() {});
    }, e.FireNav = FireNav;
}(window, document);