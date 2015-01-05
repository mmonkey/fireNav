/* fireNav (0.1.0). (C) 2014 CJ O'Hara amd Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
!function(t) {
    function i(i) {
        this.defaults = {
            container: "#fireNav",
            type: "Off-Canvas"
        }, // Merge defaults into options
        this.options = i || {};
        for (var o in this.defaults) this.defaults.hasOwnProperty(o) && !this.options.hasOwnProperty(o) && (this.options[o] = this.defaults[o]);
        // Set up Velocity
        var n;
        n = t.jQuery ? $.Velocity : Velocity, this.nav = document.querySelectorAll(this.options.container)[0], 
        this.init = function() {
            console.log(this.options.container);
        };
    }
    t.fireNav = i;
}(window);