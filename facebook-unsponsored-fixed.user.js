// ==UserScript==
// @name         Facebook unsponsored fixed
// @version      1.23
// @description  Block Facebook news feed "sponsored" posts
// @author       solskido
// @supportURL   https://greasyfork.org/en/scripts/22210-facebook-unsponsored/feedback
// @match        https://www.facebook.com/*
// @run-at       document-idle
// @grant        none
//
// Thanks to: enm, Mathieu, K B, Bart
//
// @namespace https://greasyfork.org/users/5905
// ==/UserScript==

(function () {
    'use strict';

    var language = document.documentElement.lang;
    var nodeContentKey = (('innerText' in document.documentElement) ? 'innerText' : 'textContent');
    var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    // Selectors
    var streamSelector = 'div[id^="topnews_main_stream"]';
    var storySelectors = [
        'div[id^="hyperfeed_story_id"]',
        'div[data-ownerid^="hyperfeed_story_id"]'
    ];
    var searchedNodes = [{
        // Sponsored
        'selector': [
            'div[id^=feed_subtitle] > span > div > div > a > div',
            'div[id^=feed_subtitle] > span > a > div',
            'div[id^=feed_subtitle] > s > div a > span',
            'div[id^=feed_subtitle] > s > div a > div',
            'div[id^=feed_subtitle] > span > span',
            'div[id^=feedsubt_itle] > span > span > span > a > span',
            'a.uiStreamSponsoredLink',
            'a[rel=dialog-post] > span > span'
        ],
        'preCompare': function (node) {
            var childIterator;
            var computedStyle;
            var toCompare = node[nodeContentKey];
            if (node.offsetParent && node.children.length) {
                toCompare = '';

                for (childIterator = 0; childIterator < node.children.length; childIterator++) {
                    computedStyle = window.getComputedStyle(node.children[childIterator], null);

                    if (parseInt(computedStyle.fontSize, 10) > 0 && parseInt(computedStyle.opacity, 10) > 0) {
                        toCompare += node.children[childIterator][nodeContentKey];
                    }
                }
            }

            return toCompare;
        },
        'content': {
            'af': ['Geborg'],
            'am': ['የተከፈለበት ማስታወቂያ'],
            'ar': ['إعلان مُموَّل'],
            'as': ['পৃষ্ঠপোষকতা কৰা'],
            'ay': ['Yatiyanaka'],
            'az': ['Sponsor dəstəkli'],
            'be': ['Рэклама'],
            'bg': ['Спонсорирано'],
            'br': ['Paeroniet'],
            'bs': ['Sponzorirano'],
            'bn': ['সৌজন্যে'],
            'ca': ['Patrocinat'],
            'cb': ['پاڵپشتیکراو'],
            'co': ['Spunsurizatu'],
            'cs': ['Sponzorováno'],
            'cx': ['Giisponsoran'],
            'cy': ['Noddwyd'],
            'da': ['Sponsoreret'],
            'de': ['Gesponsert'],
            'el': ['Χορηγούμενη'],
            'en': ['Sponsored', 'Chartered'],
            'eo': ['Reklamo'],
            'es': ['Publicidad', 'Patrocinado'],
            'et': ['Sponsitud'],
            'eu': ['Babestua'],
            'fa': ['دارای پشتیبانی مالی'],
            'fi': ['Sponsoroitu'],
            'fo': ['Stuðlað'],
            'fr': ['Commandité', 'Sponsorisé'],
            'fy': ['Sponsore'],
            'ga': ['Urraithe'],
            'gl': ['Patrocinado'],
            'gn': ['Oñepatrosinapyre'],
            'gx': ['Χορηγούμενον'],
            'hi': ['प्रायोजित'],
            'hu': ['Hirdetés'],
            'id': ['Bersponsor'],
            'it': ['Sponsorizzata'],
            'ja': ['広告'],
            'jv': ['Disponsori'],
            'kk': ['Демеушілік көрсеткен'],
            'km': ['បានឧបត្ថម្ភ'],
            'lo': ['ໄດ້ຮັບການສະໜັບສະໜູນ'],
            'mk': ['Спонзорирано'],
            'ml': ['സ്പോൺസർ ചെയ്തത്'],
            'mn': ['Ивээн тэтгэсэн'],
            'mr': ['प्रायोजित'],
            'ms': ['Ditaja'],
            'ne': ['प्रायोजित'],
            'nl': ['Gesponsord'],
            'or': ['ପ୍ରଯୋଜିତ'],
            'pa': ['ਸਰਪ੍ਰਸਤੀ ਪ੍ਰਾਪਤ'],
            'pl': ['Sponsorowane'],
            'ps': ['تمويل شوي'],
            'pt': ['Patrocinado'],
            'ru': ['Реклама'],
            'sa': ['प्रायोजितः |'],
            'si': ['අනුග්‍රහය දක්වන ලද'],
            'so': ['La maalgeliyey'],
            'sv': ['Sponsrad'],
            'te': ['స్పాన్సర్ చేసినవి'],
            'th': ['ได้รับการสนับสนุน'],
            'tl': ['May Sponsor'],
            'tr': ['Sponsorlu'],
            'tz': ['ⵉⴷⵍ'],
            'uk': ['Реклама'],
            'ur': ['تعاون کردہ'],
            'vi': ['Được tài trợ'],
            'zh-Hans': ['赞助内容'],
            'zh-Hant': ['贊助']
        }
    }, {
        // Suggested Post
        'selector': [
            '.fbUserPost div > div > span > span',
            '.fbUserStory div > div > span > span',
            '.userContentWrapper div > div > div > span > span'
        ],
        'content': {
            'af': ['Voorgestelde Plasing'],
            'am': ['የሚመከር ልጥፍ'],
            'ar': ['منشور مقترح'],
            'as': ['পৰামৰ্শিত প\'ষ্ট'],
            'az': ['Təklif edilən yazılar'],
            'be': ['Прапанаваны допіс'],
            'bg': ['Предложена публикация'],
            'bn': ['প্রস্তাবিত পোস্ট'],
            'br': ['Embannadenn aliet'],
            'bs': ['Predloženi sadržaj'],
            'ca': ['Publicació suggerida'],
            'cb': ['بابەتی پێشنیارکراو'],
            'co': ['Posti cunsigliati'],
            'cs': ['Navrhovaný příspěvek'],
            'cx': ['Gisugyot nga Pagpatik'],
            'cy': ['Neges a Awgrymir'],
            'da': ['Foreslået opslag'],
            'de': ['Vorgeschlagener Beitrag'],
            'el': ['Προτεινόμενη δημοσίευση'],
            'en': ['Suggested Post', 'Recommended fer ye eye'],
            'eo': ['Proponita afiŝo'],
            'es': ['Publicación sugerida'],
            'et': ['Soovitatud postitus'],
            'eu': ['Iradokitako argitalpena'],
            'fa': ['پست پیشنهادی'],
            'fi': ['Ehdotettu julkaisu'],
            'fo': ['Viðmælt uppslag'],
            'fr': ['Publication suggérée'],
            'fy': ['Oanrikkemandearre berjocht'],
            'ga': ['Postáil Mholta'],
            'gl': ['Publicación suxerida'],
            'gn': ['Ojeikuaaukáva iporãva ojehecha'],
            'gx': ['Παϱαινουμένη Ἔκϑεσις'],
            'hi': ['सुझाई गई पोस्ट'],
            'hu': ['Ajánlott bejegyzés'],
            'it': ['Post consigliato'],
            'id': ['Saran Kiriman'],
            'ja': ['おすすめの投稿'],
            'jv': ['Kiriman sing Disaranake'],
            'kk': ['Ұсынылған жазба'],
            'km': ['ការប្រកាសដែលបានណែនាំ'],
            'ko': ['추천 게시물'],
            'lo': ['ໂພສຕ໌ແນະນຳ', 'ຜູ້ສະໜັບສະໜູນ'],
            'mk': ['Предложена објава'],
            'ml': ['നിർദ്ദേശിച്ച പോ‌സ്റ്റ്'],
            'mn': ['Санал болгосон нийтлэл'],
            'mr': ['सुचवलेली पोस्ट'],
            'ms': ['Kiriman Dicadangkan'],
            'ne': ['सुझाव गरिएको पोस्ट'],
            'nl': ['Voorgesteld bericht'],
            'or': ['ପ୍ରସ୍ତାବିତ ପୋଷ୍ଟ'],
            'pa': ['ਸੁਝਾਈ ਗਈ ਪੋਸਟ'],
            'pl': ['Proponowany post'],
            'ps': ['وړاندیز شوې ځړونه'],
            'pt': ['Publicação sugerida'],
            'ru': ['Рекомендуемая публикация'],
            'sa': ['उपॆक्षित प्रकटनं'],
            'si': ['යෝජිත පළ කිරීම'],
            'so': ['Bandhig la soo jeediye'],
            'sv': ['Föreslaget inlägg'],
            'te': ['సూచింపబడిన పోస్ట్'],
            'th': ['โพสต์ที่แนะนำ'],
            'tl': ['Iminungkahing Post'],
            'tr': ['Önerilen Gönderiler', 'Önerilen Gönderi'],
            'tz': ['ⵜⴰⵥⵕⵉⴳⵜ ⵉⵜⵜⵓⵙⵓⵎⵔⵏ'],
            'uk': ['Рекомендований допис'],
            'ur': ['تجویز کردہ مراسلہ'],
            'vi': ['Bài viết được đề xuất'],
            'zh-Hans': ['推荐帖子'],
            'zh-Hant': ['推薦帖子', '推薦貼文']
        }
    }, {
        // Popular Live Video                                                      // A Video You May Like                                                           // Suggested Page
        'selector': [
            '.fbUserPost div > div > div:not(.userContent)',
            '.fbUserStory div > div > div:not(.userContent)',
            '.fbUserContent div > div > div:not(.userContent)',
            '.userContentWrapper div > div > div > span > span'
        ],
        'exclude': function (node) {
            if (!node) {
                return true;
            }

            return (node.children && node.children.length);
        },
        'content': {
            'af': ['Popular Live Video', 'Gewilde Live Video', '\'n Video waarvan jy dalk sal hou'],
            'ar': ['مباشر رائج', 'فيديو قد يعجبك'],
            'as': ['Popular Live Video', 'আপুনি ভাল পাব পৰা এটা ভিডিঅ\''],
            'az': ['Popular Live Video', 'Bu video sənin xoşuna gələ bilər'],
            'bg': ['Популярно видео на живо', 'Видео, което е възможно да харесате'],
            'bn': ['জনপ্রিয় লাইভ ভিডিও', 'আপনার পছন্দ হতে পারে এমন একটি ভিডিও'],
            'br': ['Video Siaran Langsung Populer', 'Sebuah Video yang Mungkin Anda Suka'],
            'bs': ['Video Siaran Langsung Populer', 'Sebuah Video yang Mungkin Anda Suka'],
            'ca': ['Video Siaran Langsung Populer', 'Sebuah Video yang Mungkin Anda Suka'],
            'cs': ['Populární živé vysílání', 'Video, které by se vám mohlo líbit'],
            'cx': ['Popular Live Video', 'Usa ka Video nga Mahimong Ganahan Ka'],
            'da': ['Populær livevideo', 'En video, du måske vil synes godt om'],
            'de': ['Beliebtes Live-Video', 'Ein Video, das dir gefallen könnte'],
            'en': ['Popular Live Video', 'A Video You May Like', 'Suggested Page'],
            'es': ['Vídeo en directo popular', 'Video en vivo popular', 'Un video que te puede gustar', 'Un vídeo que te puede gustar'],
            'fi': ['Suosittu live-video'],
            'fr': ['Vidéo en direct populaire', 'Une vidéo que vous pourriez aimer'],
            'hi': ['लोकप्रिय लाइव वीडियो', 'वह वीडियो जो आपको पसंद हो सकता है'],
            'hu': ['Népszerű élő videó', 'Egy videó, amely esetleg tetszik neked'],
            'it': ['Video in diretta popolare', 'Un video che potrebbe piacerti'],
            'id': ['Video Siaran Langsung Populer', 'Sebuah Video yang Mungkin Anda Suka'],
            'ja': ['人気ライブ動画', 'おすすめの動画'],
            'jv': ['Video Siaran Langsung Populer', 'Video sing Menawa Sampeyan Seneng'],
            'kk': ['Popular Live Video', 'A Video You May Like'],
            'km': ['Popular Live Video', 'វីដេអូ​ដែល​អ្នក​ប្រហែល​ជាចូលចិត្ត'],
            'ko': ['인기 라이브 방송', '회원님이 좋아할 만한 동영상'],
            'lo': ['Popular Live Video', 'A Video You May Like'],
            'mk': ['Popular Live Video', 'Видео кое можеби ќе ти се допадне'],
            'ml': ['ജനപ്രിയ Live വീഡിയോ', 'നിങ്ങൾക്ക് ഇഷ്‌ടമാകാനിടയുള്ള ‌വീഡിയോ'],
            'mn': ['Popular Live Video', 'Танд таалагдаж магадгүй бичлэг'],
            'mr': ['प्रसिद्ध थेट व्हिडिओ', 'एक व्हिडिओ जो कदाचित आपल्याला आवडू शकतो'],
            'ms': ['Video Live Popular', 'Video Yang Anda Mungkin Suka'],
            'ne': ['Popular Live Video', 'तपाईंले मन पराउन सक्ने भिडियो'],
            'nl': ['Populaire livevideo', 'Een video die je misschien leuk vindt', 'Een video die je wellicht leuk vindt'],
            'or': ['Popular Live Video', 'ଏକ ଭିଡିଓ ଆପଣ ହୁଏତ ଲାଇକ୍ କରିପାରନ୍ତି'],
            'pa': ['ਪ੍ਰਸਿੱਧ ਲਾਈਵ ਵੀਡੀਓਜ਼', 'ਕੋਈ ਵੀਡੀਓ ਜੋ ਸ਼ਾਇਦ ਤੁਹਾਨੂੰ ਪਸੰਦ ਹੋਵੇ'],
            'pl': ['Popularna transmisja wideo na żywo', 'Film, który może Ci się spodobać'],
            'pt': ['Vídeo em direto popular', 'Vídeo ao vivo popular', 'Um vídeo de que talvez gostes', 'Um vídeo que você talvez curta'],
            'ru': ['Популярный прямой эфир', 'Вам может понравиться это видео'],
            'sa': ['Popular Live Video', 'A Video You May Like'],
            'si': ['Popular Live Video', 'ඔබ කැමති විය හැකි වීඩියෝවක්'],
            'so': ['Popular Live Video', 'A Video You May Like'],
            'te': ['ప్రసిద్ధ ప్రత్యక్ష ప్రసార వీడియో', 'మీకు నచ్చే వీడియో'],
            'th': ['Popular Live Video', 'วิดีโอที่คุณอาจจะถูกใจ'],
            'tr': ['Popular Live Video', 'Hoşuna Gidebilecek Bir Video'],
            'uk': ['Popular Live Video', 'Відео, яке може вам сподобатися'],
            'ur': ['Popular Live Video', 'ویڈیو جو شائد آپ کو پسند آئے'],
            'vi': ['Video trực tiếp phổ biến', 'Một video bạn có thể thích', 'Trang được đề xuất'],
            'zh-Hans': ['热门直播视频', '猜你喜欢'],
            'zh-Hant': ['熱門直播視訊', '熱門直播視像', '你可能會喜歡的影片', '你可能會喜歡的影片']
        }
    }, {
        // Popular Across Facebook
        'selector': [
            '.fbUserPost > div > div > div',
            '.fbUserStory > div > div > div',
            '.fbUserContent > div > div > div',
            '.userContentWrapper div > div > div'
        ],
        'content': {
            'af': ['Oral op Facebook gewild'],
            'ar': ['رائج على فيسبوك'],
            'az': ['Feysbukda məşhur'],
            'bs': ['Populer Lintas Facebook'],
            'ca': ['Populer Lintas Facebook'],
            'cb': ['Popular Across Facebook', '‎Popular Across Facebook‎'],
            'cs': ['Populární na Facebooku'],
            'cx': ['Sikat sa Kinatibuk-an sa Facebook'],
            'da': ['Populært på Facebook'],
            'de': ['Beliebt auf Facebook'],
            'en': ['Popular Across Facebook'],
            'eo': ['Popular Across Facebook'],
            'es': ['Popular en Facebook'],
            'et': ['Popular Across Facebook'],
            'eu': ['Popular Across Facebook'],
            'fa': ['داستان پرطرفدار در فیس‌بوک'],
            'fi': ['Suosittua Facebookissa'],
            'fo': ['Popular Across Facebook'],
            'fr': ['Populaire sur Facebook'],
            'fy': ['Popular Across Facebook'],
            'ga': ['Popular Across Facebook'],
            'gl': ['Popular Across Facebook'],
            'gn': ['Ojehechavéva Facebook-pe'],
            'id': ['Populer Lintas Facebook'],
            'it': ['Popolare su Facebook'],
            'ja': ['Facebookで人気'],
            'jv': ['Populer Ing Facebook'],
            'ko': ['Facebook에서 인기 있는 콘텐츠'],
            'ms': ['Terkenal Diseluruh Facebook'],
            'pl': ['Popularne na Facebooku'],
            'ps': ['Popular Across Facebook', '‎Popular Across Facebook‎'],
            'pt': ['Populares em todo o Facebook', 'Conteúdos populares no Facebook'],
            'nl': ['Populair op Facebook'],
            'ru': ['Популярно на Facebook'],
            'sv': ['Populärt på Facebook'],
            'tl': ['Sikat sa Facebook'],
            'ur': ['پورے Facebook میں مقبول'],
            'vi': ['Phổ biến trên Facebook'],
            'zh-Hans': ['Facebook 大热门'],
            'zh-Hant': ['廣受 Facebook 用戶歡迎']
        }
    }, {
        // Page Stories You May Like
        'selector': [
            'div[title] > div > div > div > div'
        ],
        'content': {
            'ar': ['أحداث الصفحات التي قد تعجبك'],
            'cb': ['سەرهاتەکانی پەڕە کە ڕەنگە بەدڵت بن'],
            'de': ['Seitenmeldungen, die dir gefallen könnten'],
            'en': ['Page Stories You May Like'],
            'es': ['Historias de páginas que te pueden gustar'],
            'fa': ['داستان‌های صفحه‌ای که شاید بپسندید'],
            'fr': ['Actualités de Pages à voir'],
            'it': ['Notizie interessanti delle Pagine che ti piacciono'],
            'ja': ['おすすめのページストーリー'],
            'ko': ['회원님이 좋아할 만한 페이지 소식'],
            'pl': ['Zdarzenia stron, które mogą Ci się spodobać'],
            'pt': ['Histórias da Página que você talvez curta'],
            'ru': ['Новости Страниц, которые могут вам понравиться'],
            'tr': ['Beğenebileceğin Sayfa Haberleri'],
            'ur': ['صفحہ کی کہانیاں جو شاید آپ کو پسند آئیں'],
            'vi': ['Tin bài bạn có thể thích'],
            'zh-Hans': ['猜你喜欢'],
            'zh-Hant': ['你可能會喜歡的粉絲專頁動態', '你可能會喜歡的專頁動態']
        }
    }, {
        // Suggestions From Related Pages
        'selector': [
            'div > div > span'
        ],
        'content': {
            'en': ['Suggestions From Related Pages'],
            'vi': ['Thêm đề xuất từ các Trang liên quan']
        }
    }];

    // Default to 'en' when the current language isn't yet supported
    var i;
    for (i = 0; i < searchedNodes.length; i++) {
        if (searchedNodes[i].content[language]) {
            searchedNodes[i].content = searchedNodes[i].content[language];
        } else {
            searchedNodes[i].content = searchedNodes[i].content.en;
        }
    }

    var body;
    var stream;
    var observer;

    function block(story) {
        if (!story) {
            return;
        }

        story.remove();
    }

    function isSponsored(story) {
        if (!story) {
            return false;
        }

        var nodes;
        var nodeContent;

        var comparisonString;

        var typeIterator;
        var selectorIterator;
        var nodeIterator;
        var targetIterator;
        for (typeIterator = 0; typeIterator < searchedNodes.length; typeIterator++) {
            for (selectorIterator = 0; selectorIterator < searchedNodes[typeIterator].selector.length; selectorIterator++) {
                nodes = story.querySelectorAll(searchedNodes[typeIterator].selector[selectorIterator]);
                for (nodeIterator = 0; nodeIterator < nodes.length; nodeIterator++) {
                    nodeContent = nodes[nodeIterator][nodeContentKey];
                    if (nodeContent) {
                        for (targetIterator = 0; targetIterator < searchedNodes[typeIterator].content.length; targetIterator++) {
                            if (searchedNodes[typeIterator].exclude && searchedNodes[typeIterator].exclude(nodes[nodeIterator])) {
                                continue;
                            }

                            if (searchedNodes[typeIterator].preCompare) {
                                comparisonString = searchedNodes[typeIterator].preCompare(nodes[nodeIterator]);
                            } else {
                                comparisonString = nodeContent.trim();
                            }

                            if (searchedNodes[typeIterator].content[targetIterator] == comparisonString) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    function process() {
        // Locate the stream every iteration to allow for FB SPA navigation which
        // replaces the stream element
        stream = document.querySelector(streamSelector);
        if (!stream) {
            return;
        }

        var i;
        var j;
        var stories;
        for (i = 0; i < storySelectors.length; i++) {
            stories = stream.querySelectorAll(storySelectors[i]);
            if (!stories.length) {
                return;
            }

            for (j = 0; j < stories.length; j++) {
                if (isSponsored(stories[j])) {
                    block(stories[j]);
                }
            }
        }
    }

    if (mutationObserver) {
        body = document.querySelector('body');
        if (!body) {
            return;
        }

        observer = new mutationObserver(process);
        observer.observe(body, {
            'childList': true,
            'subtree': true
        });
    }
})();
