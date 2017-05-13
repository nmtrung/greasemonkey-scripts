// ==UserScript==
// @name        Thread Navigating by Arrow keys
// @namespace   https://greasyfork.org/scripts/6849-thread-navigating-by-arrow-keys
// @description Use ← or → and Ctrl to navigate to previous, next, first or last page
// @author      theheroofvn
// @include     /^.*(thread|forum|diendan).*$/
// @include     http://www.vn-zoom.com/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @grant       GM_addStyle
// @version     6.0
// @copyright   2014, theheroofvn
// ==/UserScript==

if (frameElement) return;

//this.$ = this.jQuery = jQuery.noConflict(true);

(function() {
    var prev, next, first, last, up, up_sub = '[itemtype="http://data-vocabulary.org/Breadcrumb"] a';
    var site_info = [{
        host: "www.webtretho.com",
        prev: "a.arrowPrePage",
        next: "a.arrowNextPage",
        first: "a.arrowFstPage",
        last: "a.arrowLstPage"
    }, {
        host: "forum.bkav.com.vn",
        prev: "a.js-pagenav-prev-button[href]:not([href=''])",
        next: "a.js-pagenav-next-button[href]:not([href=''])",
        first: "a[data-page='1']",
        last: "a.js-pagenav-button[href]:not([href='']):nth-last-child(2)",
        up: "#breadcrumbs a.crumb-link"
    }];

    function custom_site(list) {
        if (list.length === 0) return 0;
        for (var i = 0; i < list.length; i++) {
            if (location.hostname == list[i].host) {
                prev = list[i].prev;
                next = list[i].next;
                first = list[i].first;
                last = list[i].last;
                up = list[i].up;
                return 1;
            }
        }
        return 0;
    }

    function checkScriptExist(script) {
        return $('script[src*="' + script + '"]').length > 0 ? true : false;
    }

    function detect_forum() {
        var result = "";
        if (checkScriptExist("vbulletin")) result = "vbb";
        else if (checkScriptExist("xenforo")) result = "xenforo";
        else if (checkScriptExist("general.js")) result = "mybb";
        else if (checkScriptExist("forum_fn.js")) result = "phpbb";
        return result;
    }
    var detect = detect_forum();
    if (custom_site(site_info) === 0) {
        if (detect == "vbb") {
            prev = 'a[rel="prev"]';
            next = 'a[rel="next"]';
            first = 'a[rel="start"]';
            last = 'a[title^="Last"], a[title*="uối"]';
            up = "span.navbar a, li.navbit a";
        } else if (detect == "xenforo") {
            prev = ".PageNav a.text:first-child";
            next = ".PageNav a.text:last-child";
            last = ".PageNav nav > a:nth-last-child(2)";
            first = 'a[rel="start"]';
            up = "a.crumb";
        } else if (detect == "mybb") {
            prev = "a.pagination_previous";
            next = "a.pagination_next";
            first = "a.pagination_first";
            last = "a.pagination_last";
            up = ".navigation > a";
        } else if (detect == "phpbb") {
            prev = ".display-options a.left-box.left";
            next = ".display-options a.right-box.right";
            first = ".pagination > span > a:first-child";
            last = ".pagination > span > a:last-child";
            up = ".navlinks > .icon-home a";
        } else return;
    }
    var nav = {
        prev: $(prev)[0],
        next: $(next)[0],
        first: $(first)[0],
        last: $(last)[0],
        up: function() {
            return $(up).length > 0 ? $(up).last()[0] : $(up_sub).last()[0];
        }
    };
    var allowed = true;
    $(window).keydown(function(e) {
        if (!allowed) return;
        allowed = false;
        var key = e.keyCode,
            action = null;
        if (e.ctrlKey) {
            allowed = true;
            if (key == 39) action = "last";
            else if (key == 37) action = "first";
            else if (key == 8) action = "up";
        } else if (key == 39) action = "next";
        else if (key == 37) action = "prev";
        else return;
        if (!action || typeof nav[action] === "undefined" || e.target.tagName == "INPUT" || e.target.tagName == "TEXTAREA") return;
        var link = (typeof nav[action] === "function") ? nav[action]() : nav[action];
        window.location = link;
    }).keyup(function(e) {
        allowed = true;
    });
})();
