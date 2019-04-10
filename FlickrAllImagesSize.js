// ==UserScript==
// @name        Flickr All Images Size
// @namespace   https://greasyfork.org/scripts/6850-flickr-all-images-size
// @include     /flickr\.com\/(photos|groups|search)\//
// @version     4.3.9
// @grant       GM_getValue
// @grant       GM_setValue
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @description Show direct links to all Flickr image sizes.
// ==/UserScript==
var source = "",
    postfix = "_d.jpg",
    prefix = "DOWNLOAD ",
    isChecked_openLink = "",
    isChecked_alwaysShow = "",
    key_openLink = "flickr_openLink",
    key_alwaysShow = "flickr_alwaysShow",
    value_openLink = false,
    value_alwaysShow = false,
    newTab = "";

function getSetting() {
    value_openLink = GM_getValue(key_openLink, true);
    value_alwaysShow = GM_getValue(key_alwaysShow, false);
    console.log("Get flickr_openLink: " + value_openLink);
    console.log("Get flickr_alwaysShow: " + value_alwaysShow);
    if (value_openLink) {
        postfix = ".";
        isChecked_openLink = ' checked="checked" ';
        prefix = "OPEN ";
        newTab = " target='_blank'";
    } else {
        postfix = "_d.";
        isChecked_openLink = "";
        prefix = "DOWNLOAD ";
        newTab = "";
    }
    if (value_alwaysShow) {
        isChecked_alwaysShow = ' checked="checked" ';
    } else {
        isChecked_alwaysShow = "";
    }
}

function action_singlephoto(oldURL) {
    var target = $('body')[0];
    var config = {
        childList: true,
        subtree: true,
    };
    var action = function (sourceCode) {
        var size = sourceCode.match(/modelExport: {.+?"sizes":{.+?}}/i);
        var strCss = ".bigButton {position:relative;z-index:999;display:inline-block;cursor:pointer;border-style:solid;border-width:2px;border-radius:50px;padding:1em;margin:0.3em;font-size:90%;font-weight:bold;} .smallButton {position:relative;z-index:999;display:inline-block;padding:0.5em;margin:0.3em;background-color:pink;border-radius:1.5em;font-size:90%}";
        $('head').append('<style>' + strCss + '</style>');
        var mSize = size[0].match(/"width":"?\d+"?,"height":"?\d+"?,/ig);
        var mLink = size[0].match(/"displayUrl":"[^"]+"/ig);
        var length = mLink.length;
        for (var k = 0; k < length; k++) {
            mSize[k] = mSize[k].replace(/"width":(\d+),"height":(\d+),/i, "$1 x $2");
            mLink[k] = mLink[k].replace(/"displayUrl":"([^"]+)"/i, "$1").replace(/\\/g, "").replace(/(_[a-z])\.([a-z]{3,4})/i, '$1' + postfix + '$2');
        }
        var insertLocation = $('.sub-photo-right-row1');
        if (insertLocation.length > 0) {
            insertLocation.append('<a class="bigButton" href="' + mLink[length - 1] + '"' + newTab + '>' + prefix + mSize[length - 1] + ' px</a>');
            for (m = length - 2; m > 0; --m) {
                insertLocation.append('<a class="smallButton" href="' + mLink[m] + '"' + newTab + '>' + mSize[m] + ' px</a>');
            }
        }
    };
    var observer = new MutationObserver(function (mutations, ob) {
        if (document.URL == oldURL) return;
        oldURL = document.URL;
        $.get(oldURL, action);
    });
    observer.observe(target, config);
}

function flickr_mouseenter() {
    var e = $(this);
    console.log("Mouse hover");
    if (e.find('.myFuckingLink').filter(':first').length > 0) {
        e.off('mouseenter');
        return;
    }
    var url = e.find('a').filter(':first').attr('href');
    if (typeof url == "undefined" || url === null) return;
    e.append('<a class="myFuckingLink">(Link loading...)</a>');
    if (type == 'favorite') {
        e.find('div.interaction-bar').css('bottom', '1em');
    } else if (type == 'group') {
        e.find('div.meta-bar').css('bottom', '1em');
    }
    $.get(url, function (data) {
        var photo = data.match(/"displayUrl":"([^"]+)","width":(\d+),"height":(\d+)[^}]+}}/i);
        var link = "http:" + photo[1].replace(/\\/g, "").replace(/(_[a-z])\.([a-z]{3,4})/i, '$1' + postfix + '$2');
        var text = prefix + photo[2] + " x " + photo[3];
        var b = e.find('.myFuckingLink');
        b.attr('href', link);
        b.attr('title', text);
        b.html(text);
    });
}

function action_page_need_hover() {
    var target = $('body')[0];
    var config = {
        childList: true,
        subtree: true,
    };
    var strCss = ".myFuckingLink{position:absolute;left:3px;bottom:0px;z-index:999;display:inline-block;color:white!important;font-size:96%}";
    $('head').append('<style>' + strCss + '</style>');
    var observer = new MutationObserver(function (mutations, ob) {
        $('div.photo-list-photo-view').mouseenter(flickr_mouseenter);
        $('figure.ui-display').mouseenter(flickr_mouseenter);
        if (value_alwaysShow) {
            $('div.interaction-view').css('opacity', '1');
            $('div.metabar').css('opacity', '1');
        }
    });
    observer.observe(target, config);
}

function pageType() {
    t = "none";
    var htmlClass = $('html').attr('class');
    console.log("HTML class: " + htmlClass);
    if (htmlClass.match(/html-photo-page-scrappy-view/i) !== null) t = 'singlephoto';
    else if ($('div.photo-list-photo-view').filter(':first').length > 0) t = 'favorite';
    else if ($('figure.ui-display').filter(':first').length > 0) t = 'group';
    console.log("Page type: " + t);
    return t;
}

getSetting();
var type = pageType();
$('ul.nav-menu:first').append('<li><div style="color:pink;padding-top:7px"><input id="optionbox_openLink" type="checkbox"' + isChecked_openLink + 'style="margin:2px"/>Open image link in browser<br><input id="optionbox_alwaysShow" type="checkbox"' + isChecked_alwaysShow + 'style="margin:2px"/>Always show image information in Photostream</div></li>');
$('#optionbox_openLink').change(function () {
    GM_setValue(key_openLink, $(this).prop('checked'));
    getSetting();
    $('.myFuckingLink').remove();
    $('.photo-list-photo-view').mouseenter(flickr_mouseenter);
});
$('#optionbox_alwaysShow').change(function () {
    GM_setValue(key_alwaysShow, $(this).prop('checked'));
    getSetting();
    if (value_alwaysShow) {
        $('.interaction-view').css('opacity', '1');
    }
});

if (type == 'singlephoto') action_singlephoto("dummyURL");
else if (type == 'favorite' || type == 'group') action_page_need_hover();
