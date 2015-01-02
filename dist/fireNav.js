/* fireNav (0.1.0). (C) 2014 CJ O'Hara amd Tyler Fowle. MIT @license: en.wikipedia.org/wiki/MIT_License */
!function(t) {
    function s(t) {
        this.defaults = {
            selector: "#fireNav",
            type: "Off-Canvas"
        }, this.options = t || {};
        for (var s in this.defaults) this.defaults.hasOwnProperty(s) && !this.options.hasOwnProperty(s) && (this.options[s] = this.defaults[s]);
        this.init = function() {
            console.log(this.options.selector);
        };
    }
    t.fireNav = s;
}(window);