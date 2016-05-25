/**
 * UAParser.js v0.7.10
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */

/* eslint-disable */

(function(window, undefined) {

  'use strict';

  //////////////
  // Constants
  /////////////


  var LIBVERSION = '0.7.10',
    EMPTY = '',
    UNKNOWN = '?',
    FUNC_TYPE = 'function',
    UNDEF_TYPE = 'undefined',
    OBJ_TYPE = 'object',
    STR_TYPE = 'string',
    MAJOR = 'major', // deprecated
    MODEL = 'model',
    NAME = 'name',
    TYPE = 'type',
    VENDOR = 'vendor',
    VERSION = 'version',
    ARCHITECTURE = 'architecture',
    CONSOLE = 'console',
    MOBILE = 'mobile',
    TABLET = 'tablet',
    SMARTTV = 'smarttv',
    WEARABLE = 'wearable',
    EMBEDDED = 'embedded';


  ///////////
  // Helper
  //////////


  var util = {
    extend: function(regexes, extensions) {
      var margedRegexes = {};
      for (var i in regexes) {
        if (extensions[i] && extensions[i].length % 2 === 0) {
          margedRegexes[i] = extensions[i].concat(regexes[i]);
        } else {
          margedRegexes[i] = regexes[i];
        }
      }
      return margedRegexes;
    },
    has: function(str1, str2) {
      if (typeof str1 === "string") {
        return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
      } else {
        return false;
      }
    },
    lowerize: function(str) {
      return str.toLowerCase();
    },
    major: function(version) {
      return typeof(version) === STR_TYPE ? version.split(".")[0] : undefined;
    }
  };


  ///////////////
  // Map helper
  //////////////


  var mapper = {

    rgx: function() {

      var result, i = 0,
        j, k, p, q, matches, match, args = arguments;

      // loop through all regexes maps
      while (i < args.length && !matches) {

        var regex = args[i], // even sequence (0,2,4,..)
          props = args[i + 1]; // odd sequence (1,3,5,..)

        // construct object barebones
        if (typeof result === UNDEF_TYPE) {
          result = {};
          for (p in props) {
            if (props.hasOwnProperty(p)) {
              q = props[p];
              if (typeof q === OBJ_TYPE) {
                result[q[0]] = undefined;
              } else {
                result[q] = undefined;
              }
            }
          }
        }

        // try matching uastring with regexes
        j = k = 0;
        while (j < regex.length && !matches) {
          matches = regex[j++].exec(this.getUA());
          if (!!matches) {
            for (p = 0; p < props.length; p++) {
              match = matches[++k];
              q = props[p];
              // check if given property is actually array
              if (typeof q === OBJ_TYPE && q.length > 0) {
                if (q.length == 2) {
                  if (typeof q[1] == FUNC_TYPE) {
                    // assign modified match
                    result[q[0]] = q[1].call(this, match);
                  } else {
                    // assign given value, ignore regex match
                    result[q[0]] = q[1];
                  }
                } else if (q.length == 3) {
                  // check whether function or regex
                  if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                    // call function (usually string mapper)
                    result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                  } else {
                    // sanitize match using given regex
                    result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                  }
                } else if (q.length == 4) {
                  result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                }
              } else {
                result[q] = match ? match : undefined;
              }
            }
          }
        }
        i += 2;
      }
      return result;
    },

    str: function(str, map) {

      for (var i in map) {
        // check if array
        if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
          for (var j = 0; j < map[i].length; j++) {
            if (util.has(map[i][j], str)) {
              return (i === UNKNOWN) ? undefined : i;
            }
          }
        } else if (util.has(map[i], str)) {
          return (i === UNKNOWN) ? undefined : i;
        }
      }
      return str;
    }
  };


  ///////////////
  // String map
  //////////////


  var maps = {

    browser: {
      oldsafari: {
        version: {
          '1.0': '/8',
          '1.2': '/1',
          '1.3': '/3',
          '2.0': '/412',
          '2.0.2': '/416',
          '2.0.3': '/417',
          '2.0.4': '/419',
          '?': '/'
        }
      }
    },

    device: {
      amazon: {
        model: {
          'Fire Phone': ['SD', 'KF']
        }
      },
      sprint: {
        model: {
          'Evo Shift 4G': '7373KT'
        },
        vendor: {
          'HTC': 'APA',
          'Sprint': 'Sprint'
        }
      }
    },

    os: {
      windows: {
        version: {
          'ME': '4.90',
          'NT 3.11': 'NT3.51',
          'NT 4.0': 'NT4.0',
          '2000': 'NT 5.0',
          'XP': ['NT 5.1', 'NT 5.2'],
          'Vista': 'NT 6.0',
          '7': 'NT 6.1',
          '8': 'NT 6.2',
          '8.1': 'NT 6.3',
          '10': ['NT 6.4', 'NT 10.0'],
          'RT': 'ARM'
        }
      }
    }
  };


  //////////////
  // Regex map
  /////////////


  var regexes = {

    browser: [
      [

        // Presto based
        /(opera\smini)\/([\w\.-]+)/i, // Opera Mini
        /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i, // Opera Mobi/Tablet
        /(opera).+version\/([\w\.]+)/i, // Opera > 9.80
        /(opera)[\/\s]+([\w\.]+)/i // Opera < 9.80
      ],
      [NAME, VERSION],
      [

        /(OPiOS)[\/\s]+([\w\.]+)/i // Opera mini on iphone >= 8.0
      ],
      [
        [NAME, 'Opera Mini'], VERSION
      ],
      [

        /\s(opr)\/([\w\.]+)/i // Opera Webkit
      ],
      [
        [NAME, 'Opera'], VERSION
      ],
      [

        // Mixed
        /(kindle)\/([\w\.]+)/i, // Kindle
        /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
        // Lunascape/Maxthon/Netfront/Jasmine/Blazer

        // Trident based
        /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
        // Avant/IEMobile/SlimBrowser/Baidu
        /(?:ms|\()(ie)\s([\w\.]+)/i, // Internet Explorer

        // Webkit/KHTML based
        /(rekonq)\/([\w\.]+)*/i, // Rekonq
        /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i
        // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS
      ],
      [NAME, VERSION],
      [

        /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i // IE11
      ],
      [
        [NAME, 'IE'], VERSION
      ],
      [

        /(edge)\/((\d+)?[\w\.]+)/i // Microsoft Edge
      ],
      [NAME, VERSION],
      [

        /(yabrowser)\/([\w\.]+)/i // Yandex
      ],
      [
        [NAME, 'Yandex'], VERSION
      ],
      [

        /(comodo_dragon)\/([\w\.]+)/i // Comodo Dragon
      ],
      [
        [NAME, /_/g, ' '], VERSION
      ],
      [

        /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,
        // Chrome/OmniWeb/Arora/Tizen/Nokia
        /(qqbrowser)[\/\s]?([\w\.]+)/i
        // QQBrowser
      ],
      [NAME, VERSION],
      [

        /(uc\s?browser)[\/\s]?([\w\.]+)/i,
        /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i,
        /JUC.+(ucweb)[\/\s]?([\w\.]+)/i
        // UCBrowser
      ],
      [
        [NAME, 'UCBrowser'], VERSION
      ],
      [

        /(dolfin)\/([\w\.]+)/i // Dolphin
      ],
      [
        [NAME, 'Dolphin'], VERSION
      ],
      [

        /((?:android.+)crmo|crios)\/([\w\.]+)/i // Chrome for Android/iOS
      ],
      [
        [NAME, 'Chrome'], VERSION
      ],
      [

        /XiaoMi\/MiuiBrowser\/([\w\.]+)/i // MIUI Browser
      ],
      [VERSION, [NAME, 'MIUI Browser']],
      [

        /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i // Android Browser
      ],
      [VERSION, [NAME, 'Android Browser']],
      [

        /FBAV\/([\w\.]+);/i // Facebook App for iOS
      ],
      [VERSION, [NAME, 'Facebook']],
      [

        /fxios\/([\w\.-]+)/i // Firefox for iOS
      ],
      [VERSION, [NAME, 'Firefox']],
      [

        /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i // Mobile Safari
      ],
      [VERSION, [NAME, 'Mobile Safari']],
      [

        /version\/([\w\.]+).+?(mobile\s?safari|safari)/i // Safari & Safari Mobile
      ],
      [VERSION, NAME],
      [

        /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i // Safari < 3.0
      ],
      [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]],
      [

        /(konqueror)\/([\w\.]+)/i, // Konqueror
        /(webkit|khtml)\/([\w\.]+)/i
      ],
      [NAME, VERSION],
      [

        // Gecko based
        /(navigator|netscape)\/([\w\.-]+)/i // Netscape
      ],
      [
        [NAME, 'Netscape'], VERSION
      ],
      [
        /(swiftfox)/i, // Swiftfox
        /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
        // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
        /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
        // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
        /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i, // Mozilla

        // Other
        /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
        // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
        /(links)\s\(([\w\.]+)/i, // Links
        /(gobrowser)\/?([\w\.]+)*/i, // GoBrowser
        /(ice\s?browser)\/v?([\w\._]+)/i, // ICE Browser
        /(mosaic)[\/\s]([\w\.]+)/i // Mosaic
      ],
      [NAME, VERSION]

      /* /////////////////////
      // Media players BEGIN
      ////////////////////////

      , [

      /(apple(?:coremedia|))\/((\d+)[\w\._]+)/i,                          // Generic Apple CoreMedia
      /(coremedia) v((\d+)[\w\._]+)/i
      ], [NAME, VERSION], [

      /(aqualung|lyssna|bsplayer)\/((\d+)?[\w\.-]+)/i                     // Aqualung/Lyssna/BSPlayer
      ], [NAME, VERSION], [

      /(ares|ossproxy)\s((\d+)[\w\.-]+)/i                                 // Ares/OSSProxy
      ], [NAME, VERSION], [

      /(audacious|audimusicstream|amarok|bass|core|dalvik|gnomemplayer|music on console|nsplayer|psp-internetradioplayer|videos)\/((\d+)[\w\.-]+)/i,
                                                                          // Audacious/AudiMusicStream/Amarok/BASS/OpenCORE/Dalvik/GnomeMplayer/MoC
                                                                          // NSPlayer/PSP-InternetRadioPlayer/Videos
      /(clementine|music player daemon)\s((\d+)[\w\.-]+)/i,               // Clementine/MPD
      /(lg player|nexplayer)\s((\d+)[\d\.]+)/i,
      /player\/(nexplayer|lg player)\s((\d+)[\w\.-]+)/i                   // NexPlayer/LG Player
      ], [NAME, VERSION], [
      /(nexplayer)\s((\d+)[\w\.-]+)/i                                     // Nexplayer
      ], [NAME, VERSION], [

      /(flrp)\/((\d+)[\w\.-]+)/i                                          // Flip Player
      ], [[NAME, 'Flip Player'], VERSION], [

      /(fstream|nativehost|queryseekspider|ia-archiver|facebookexternalhit)/i
                                                                          // FStream/NativeHost/QuerySeekSpider/IA Archiver/facebookexternalhit
      ], [NAME], [

      /(gstreamer) souphttpsrc (?:\([^\)]+\)){0,1} libsoup\/((\d+)[\w\.-]+)/i
                                                                          // Gstreamer
      ], [NAME, VERSION], [

      /(htc streaming player)\s[\w_]+\s\/\s((\d+)[\d\.]+)/i,              // HTC Streaming Player
      /(java|python-urllib|python-requests|wget|libcurl)\/((\d+)[\w\.-_]+)/i,
                                                                          // Java/urllib/requests/wget/cURL
      /(lavf)((\d+)[\d\.]+)/i                                             // Lavf (FFMPEG)
      ], [NAME, VERSION], [

      /(htc_one_s)\/((\d+)[\d\.]+)/i                                      // HTC One S
      ], [[NAME, /_/g, ' '], VERSION], [

      /(mplayer)(?:\s|\/)(?:(?:sherpya-){0,1}svn)(?:-|\s)(r\d+(?:-\d+[\w\.-]+){0,1})/i
                                                                          // MPlayer SVN
      ], [NAME, VERSION], [

      /(mplayer)(?:\s|\/|[unkow-]+)((\d+)[\w\.-]+)/i                      // MPlayer
      ], [NAME, VERSION], [

      /(mplayer)/i,                                                       // MPlayer (no other info)
      /(yourmuze)/i,                                                      // YourMuze
      /(media player classic|nero showtime)/i                             // Media Player Classic/Nero ShowTime
      ], [NAME], [

      /(nero (?:home|scout))\/((\d+)[\w\.-]+)/i                           // Nero Home/Nero Scout
      ], [NAME, VERSION], [

      /(nokia\d+)\/((\d+)[\w\.-]+)/i                                      // Nokia
      ], [NAME, VERSION], [

      /\s(songbird)\/((\d+)[\w\.-]+)/i                                    // Songbird/Philips-Songbird
      ], [NAME, VERSION], [

      /(winamp)3 version ((\d+)[\w\.-]+)/i,                               // Winamp
      /(winamp)\s((\d+)[\w\.-]+)/i,
      /(winamp)mpeg\/((\d+)[\w\.-]+)/i
      ], [NAME, VERSION], [

      /(ocms-bot|tapinradio|tunein radio|unknown|winamp|inlight radio)/i  // OCMS-bot/tap in radio/tunein/unknown/winamp (no other info)
                                                                          // inlight radio
      ], [NAME], [

      /(quicktime|rma|radioapp|radioclientapplication|soundtap|totem|stagefright|streamium)\/((\d+)[\w\.-]+)/i
                                                                          // QuickTime/RealMedia/RadioApp/RadioClientApplication/
                                                                          // SoundTap/Totem/Stagefright/Streamium
      ], [NAME, VERSION], [

      /(smp)((\d+)[\d\.]+)/i                                              // SMP
      ], [NAME, VERSION], [

      /(vlc) media player - version ((\d+)[\w\.]+)/i,                     // VLC Videolan
      /(vlc)\/((\d+)[\w\.-]+)/i,
      /(xbmc|gvfs|xine|xmms|irapp)\/((\d+)[\w\.-]+)/i,                    // XBMC/gvfs/Xine/XMMS/irapp
      /(foobar2000)\/((\d+)[\d\.]+)/i,                                    // Foobar2000
      /(itunes)\/((\d+)[\d\.]+)/i                                         // iTunes
      ], [NAME, VERSION], [

      /(wmplayer)\/((\d+)[\w\.-]+)/i,                                     // Windows Media Player
      /(windows-media-player)\/((\d+)[\w\.-]+)/i
      ], [[NAME, /-/g, ' '], VERSION], [

      /windows\/((\d+)[\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ (home media server)/i
                                                                          // Windows Media Server
      ], [VERSION, [NAME, 'Windows']], [

      /(com\.riseupradioalarm)\/((\d+)[\d\.]*)/i                          // RiseUP Radio Alarm
      ], [NAME, VERSION], [

      /(rad.io)\s((\d+)[\d\.]+)/i,                                        // Rad.io
      /(radio.(?:de|at|fr))\s((\d+)[\d\.]+)/i
      ], [[NAME, 'rad.io'], VERSION]

      //////////////////////
      // Media players END
      ////////////////////*/

    ],

    cpu: [
      [

        /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i // AMD64
      ],
      [
        [ARCHITECTURE, 'amd64']
      ],
      [

        /(ia32(?=;))/i // IA32 (quicktime)
      ],
      [
        [ARCHITECTURE, util.lowerize]
      ],
      [

        /((?:i[346]|x)86)[;\)]/i // IA32
      ],
      [
        [ARCHITECTURE, 'ia32']
      ],
      [

        // PocketPC mistakenly identified as PowerPC
        /windows\s(ce|mobile);\sppc;/i
      ],
      [
        [ARCHITECTURE, 'arm']
      ],
      [

        /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i // PowerPC
      ],
      [
        [ARCHITECTURE, /ower/, '', util.lowerize]
      ],
      [

        /(sun4\w)[;\)]/i // SPARC
      ],
      [
        [ARCHITECTURE, 'sparc']
      ],
      [

        /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
        // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
      ],
      [
        [ARCHITECTURE, util.lowerize]
      ]
    ],

    device: [
      [

        /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i // iPad/PlayBook
      ],
      [MODEL, VENDOR, [TYPE, TABLET]],
      [

        /applecoremedia\/[\w\.]+ \((ipad)/ // iPad
      ],
      [MODEL, [VENDOR, 'Apple'],
        [TYPE, TABLET]
      ],
      [

        /(apple\s{0,1}tv)/i // Apple TV
      ],
      [
        [MODEL, 'Apple TV'],
        [VENDOR, 'Apple']
      ],
      [

        /(archos)\s(gamepad2?)/i, // Archos
        /(hp).+(touchpad)/i, // HP TouchPad
        /(kindle)\/([\w\.]+)/i, // Kindle
        /\s(nook)[\w\s]+build\/(\w+)/i, // Nook
        /(dell)\s(strea[kpr\s\d]*[\dko])/i // Dell Streak
      ],
      [VENDOR, MODEL, [TYPE, TABLET]],
      [

        /(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i // Kindle Fire HD
      ],
      [MODEL, [VENDOR, 'Amazon'],
        [TYPE, TABLET]
      ],
      [
        /(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i // Fire Phone
      ],
      [
        [MODEL, mapper.str, maps.device.amazon.model],
        [VENDOR, 'Amazon'],
        [TYPE, MOBILE]
      ],
      [

        /\((ip[honed|\s\w*]+);.+(apple)/i // iPod/iPhone
      ],
      [MODEL, VENDOR, [TYPE, MOBILE]],
      [
        /\((ip[honed|\s\w*]+);/i // iPod/iPhone
      ],
      [MODEL, [VENDOR, 'Apple'],
        [TYPE, MOBILE]
      ],
      [

        /(blackberry)[\s-]?(\w+)/i, // BlackBerry
        /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
        // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Huawei/Meizu/Motorola/Polytron
        /(hp)\s([\w\s]+\w)/i, // HP iPAQ
        /(asus)-?(\w+)/i // Asus
      ],
      [VENDOR, MODEL, [TYPE, MOBILE]],
      [
        /\(bb10;\s(\w+)/i // BlackBerry 10
      ],
      [MODEL, [VENDOR, 'BlackBerry'],
        [TYPE, MOBILE]
      ],
      [
        // Asus Tablets
        /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i
      ],
      [MODEL, [VENDOR, 'Asus'],
        [TYPE, TABLET]
      ],
      [

        /(sony)\s(tablet\s[ps])\sbuild\//i, // Sony
        /(sony)?(?:sgp.+)\sbuild\//i
      ],
      [
        [VENDOR, 'Sony'],
        [MODEL, 'Xperia Tablet'],
        [TYPE, TABLET]
      ],
      [
        /(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i
      ],
      [
        [VENDOR, 'Sony'],
        [MODEL, 'Xperia Phone'],
        [TYPE, MOBILE]
      ],
      [

        /\s(ouya)\s/i, // Ouya
        /(nintendo)\s([wids3u]+)/i // Nintendo
      ],
      [VENDOR, MODEL, [TYPE, CONSOLE]],
      [

        /android.+;\s(shield)\sbuild/i // Nvidia
      ],
      [MODEL, [VENDOR, 'Nvidia'],
        [TYPE, CONSOLE]
      ],
      [

        /(playstation\s[34portablevi]+)/i // Playstation
      ],
      [MODEL, [VENDOR, 'Sony'],
        [TYPE, CONSOLE]
      ],
      [

        /(sprint\s(\w+))/i // Sprint Phones
      ],
      [
        [VENDOR, mapper.str, maps.device.sprint.vendor],
        [MODEL, mapper.str, maps.device.sprint.model],
        [TYPE, MOBILE]
      ],
      [

        /(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i // Lenovo tablets
      ],
      [VENDOR, MODEL, [TYPE, TABLET]],
      [

        /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i, // HTC
        /(zte)-(\w+)*/i, // ZTE
        /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
        // Alcatel/GeeksPhone/Huawei/Lenovo/Nexian/Panasonic/Sony
      ],
      [VENDOR, [MODEL, /_/g, ' '],
        [TYPE, MOBILE]
      ],
      [

        /(nexus\s9)/i // HTC Nexus 9
      ],
      [MODEL, [VENDOR, 'HTC'],
        [TYPE, TABLET]
      ],
      [

        /[\s\(;](xbox(?:\sone)?)[\s\);]/i // Microsoft Xbox
      ],
      [MODEL, [VENDOR, 'Microsoft'],
        [TYPE, CONSOLE]
      ],
      [
        /(kin\.[onetw]{3})/i // Microsoft Kin
      ],
      [
        [MODEL, /\./g, ' '],
        [VENDOR, 'Microsoft'],
        [TYPE, MOBILE]
      ],
      [

        // Motorola
        /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,
        /mot[\s-]?(\w+)*/i,
        /(XT\d{3,4}) build\//i,
        /(nexus\s[6])/i
      ],
      [MODEL, [VENDOR, 'Motorola'],
        [TYPE, MOBILE]
      ],
      [
        /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
      ],
      [MODEL, [VENDOR, 'Motorola'],
        [TYPE, TABLET]
      ],
      [

        /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i,
        /((SM-T\w+))/i
      ],
      [
        [VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]
      ],
      [ // Samsung
        /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i,
        /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
        /sec-((sgh\w+))/i
      ],
      [
        [VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]
      ],
      [
        /(samsung);smarttv/i
      ],
      [VENDOR, MODEL, [TYPE, SMARTTV]],
      [

        /\(dtv[\);].+(aquos)/i // Sharp
      ],
      [MODEL, [VENDOR, 'Sharp'],
        [TYPE, SMARTTV]
      ],
      [
        /sie-(\w+)*/i // Siemens
      ],
      [MODEL, [VENDOR, 'Siemens'],
        [TYPE, MOBILE]
      ],
      [

        /(maemo|nokia).*(n900|lumia\s\d+)/i, // Nokia
        /(nokia)[\s_-]?([\w-]+)*/i
      ],
      [
        [VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]
      ],
      [

        /android\s3\.[\s\w;-]{10}(a\d{3})/i // Acer
      ],
      [MODEL, [VENDOR, 'Acer'],
        [TYPE, TABLET]
      ],
      [

        /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i // LG Tablet
      ],
      [
        [VENDOR, 'LG'], MODEL, [TYPE, TABLET]
      ],
      [
        /(lg) netcast\.tv/i // LG SmartTV
      ],
      [VENDOR, MODEL, [TYPE, SMARTTV]],
      [
        /(nexus\s[45])/i, // LG
        /lg[e;\s\/-]+(\w+)*/i
      ],
      [MODEL, [VENDOR, 'LG'],
        [TYPE, MOBILE]
      ],
      [

        /android.+(ideatab[a-z0-9\-\s]+)/i // Lenovo
      ],
      [MODEL, [VENDOR, 'Lenovo'],
        [TYPE, TABLET]
      ],
      [

        /linux;.+((jolla));/i // Jolla
      ],
      [VENDOR, MODEL, [TYPE, MOBILE]],
      [

        /((pebble))app\/[\d\.]+\s/i // Pebble
      ],
      [VENDOR, MODEL, [TYPE, WEARABLE]],
      [

        /android.+;\s(glass)\s\d/i // Google Glass
      ],
      [MODEL, [VENDOR, 'Google'],
        [TYPE, WEARABLE]
      ],
      [

        /android.+(\w+)\s+build\/hm\1/i, // Xiaomi Hongmi 'numeric' models
        /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i, // Xiaomi Hongmi
        /android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i // Xiaomi Mi
      ],
      [
        [MODEL, /_/g, ' '],
        [VENDOR, 'Xiaomi'],
        [TYPE, MOBILE]
      ],
      [

        /\s(tablet)[;\/\s]/i, // Unidentifiable Tablet
        /\s(mobile)[;\/\s]/i // Unidentifiable Mobile
      ],
      [
        [TYPE, util.lowerize], VENDOR, MODEL
      ]

      /*//////////////////////////
      // TODO: move to string map
      ////////////////////////////

      /(C6603)/i                                                          // Sony Xperia Z C6603
      ], [[MODEL, 'Xperia Z C6603'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
      /(C6903)/i                                                          // Sony Xperia Z 1
      ], [[MODEL, 'Xperia Z 1'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [

      /(SM-G900[F|H])/i                                                   // Samsung Galaxy S5
      ], [[MODEL, 'Galaxy S5'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
      /(SM-G7102)/i                                                       // Samsung Galaxy Grand 2
      ], [[MODEL, 'Galaxy Grand 2'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
      /(SM-G530H)/i                                                       // Samsung Galaxy Grand Prime
      ], [[MODEL, 'Galaxy Grand Prime'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
      /(SM-G313HZ)/i                                                      // Samsung Galaxy V
      ], [[MODEL, 'Galaxy V'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
      /(SM-T805)/i                                                        // Samsung Galaxy Tab S 10.5
      ], [[MODEL, 'Galaxy Tab S 10.5'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
      /(SM-G800F)/i                                                       // Samsung Galaxy S5 Mini
      ], [[MODEL, 'Galaxy S5 Mini'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
      /(SM-T311)/i                                                        // Samsung Galaxy Tab 3 8.0
      ], [[MODEL, 'Galaxy Tab 3 8.0'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [

      /(R1001)/i                                                          // Oppo R1001
      ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [
      /(X9006)/i                                                          // Oppo Find 7a
      ], [[MODEL, 'Find 7a'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
      /(R2001)/i                                                          // Oppo YOYO R2001
      ], [[MODEL, 'Yoyo R2001'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
      /(R815)/i                                                           // Oppo Clover R815
      ], [[MODEL, 'Clover R815'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
       /(U707)/i                                                          // Oppo Find Way S
      ], [[MODEL, 'Find Way S'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [

      /(T3C)/i                                                            // Advan Vandroid T3C
      ], [MODEL, [VENDOR, 'Advan'], [TYPE, TABLET]], [
      /(ADVAN T1J\+)/i                                                    // Advan Vandroid T1J+
      ], [[MODEL, 'Vandroid T1J+'], [VENDOR, 'Advan'], [TYPE, TABLET]], [
      /(ADVAN S4A)/i                                                      // Advan Vandroid S4A
      ], [[MODEL, 'Vandroid S4A'], [VENDOR, 'Advan'], [TYPE, MOBILE]], [

      /(V972M)/i                                                          // ZTE V972M
      ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [

      /(i-mobile)\s(IQ\s[\d\.]+)/i                                        // i-mobile IQ
      ], [VENDOR, MODEL, [TYPE, MOBILE]], [
      /(IQ6.3)/i                                                          // i-mobile IQ IQ 6.3
      ], [[MODEL, 'IQ 6.3'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
      /(i-mobile)\s(i-style\s[\d\.]+)/i                                   // i-mobile i-STYLE
      ], [VENDOR, MODEL, [TYPE, MOBILE]], [
      /(i-STYLE2.1)/i                                                     // i-mobile i-STYLE 2.1
      ], [[MODEL, 'i-STYLE 2.1'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [

      /(mobiistar touch LAI 512)/i                                        // mobiistar touch LAI 512
      ], [[MODEL, 'Touch LAI 512'], [VENDOR, 'mobiistar'], [TYPE, MOBILE]], [

      /////////////
      // END TODO
      ///////////*/

    ],

    engine: [
      [

        /windows.+\sedge\/([\w\.]+)/i // EdgeHTML
      ],
      [VERSION, [NAME, 'EdgeHTML']],
      [

        /(presto)\/([\w\.]+)/i, // Presto
        /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
        /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, // KHTML/Tasman/Links
        /(icab)[\/\s]([23]\.[\d\.]+)/i // iCab
      ],
      [NAME, VERSION],
      [

        /rv\:([\w\.]+).*(gecko)/i // Gecko
      ],
      [VERSION, NAME]
    ],

    os: [
      [

        // Windows based
        /microsoft\s(windows)\s(vista|xp)/i // Windows (iTunes)
      ],
      [NAME, VERSION],
      [
        /(windows)\snt\s6\.2;\s(arm)/i, // Windows RT
        /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
      ],
      [NAME, [VERSION, mapper.str, maps.os.windows.version]],
      [
        /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
      ],
      [
        [NAME, 'Windows'],
        [VERSION, mapper.str, maps.os.windows.version]
      ],
      [

        // Mobile/Embedded OS
        /\((bb)(10);/i // BlackBerry 10
      ],
      [
        [NAME, 'BlackBerry'], VERSION
      ],
      [
        /(blackberry)\w*\/?([\w\.]+)*/i, // Blackberry
        /(tizen)[\/\s]([\w\.]+)/i, // Tizen
        /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
        // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
        /linux;.+(sailfish);/i // Sailfish OS
      ],
      [NAME, VERSION],
      [
        /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i // Symbian
      ],
      [
        [NAME, 'Symbian'], VERSION
      ],
      [
        /\((series40);/i // Series 40
      ],
      [NAME],
      [
        /mozilla.+\(mobile;.+gecko.+firefox/i // Firefox OS
      ],
      [
        [NAME, 'Firefox OS'], VERSION
      ],
      [

        // Console
        /(nintendo|playstation)\s([wids34portablevu]+)/i, // Nintendo/Playstation

        // GNU/Linux based
        /(mint)[\/\s\(]?(\w+)*/i, // Mint
        /(mageia|vectorlinux)[;\s]/i, // Mageia/VectorLinux
        /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
        // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
        // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
        /(hurd|linux)\s?([\w\.]+)*/i, // Hurd/Linux
        /(gnu)\s?([\w\.]+)*/i // GNU
      ],
      [NAME, VERSION],
      [

        /(cros)\s[\w]+\s([\w\.]+\w)/i // Chromium OS
      ],
      [
        [NAME, 'Chromium OS'], VERSION
      ],
      [

        // Solaris
        /(sunos)\s?([\w\.]+\d)*/i // Solaris
      ],
      [
        [NAME, 'Solaris'], VERSION
      ],
      [

        // BSD based
        /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
      ],
      [NAME, VERSION],
      [

        /(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i // iOS
      ],
      [
        [NAME, 'iOS'],
        [VERSION, /_/g, '.']
      ],
      [

        /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
        /(macintosh|mac(?=_powerpc)\s)/i // Mac OS
      ],
      [
        [NAME, 'Mac OS'],
        [VERSION, /_/g, '.']
      ],
      [

        // Other
        /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i, // Solaris
        /(haiku)\s(\w+)/i, // Haiku
        /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i, // AIX
        /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
        // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
        /(unix)\s?([\w\.]+)*/i // UNIX
      ],
      [NAME, VERSION]
    ]
  };


  /////////////////
  // Constructor
  ////////////////


  var UAParser = function(uastring, extensions) {

    if (!(this instanceof UAParser)) {
      return new UAParser(uastring, extensions).getResult();
    }

    var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
    var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

    this.getBrowser = function() {
      var browser = mapper.rgx.apply(this, rgxmap.browser);
      browser.major = util.major(browser.version);
      return browser;
    };
    this.getCPU = function() {
      return mapper.rgx.apply(this, rgxmap.cpu);
    };
    this.getDevice = function() {
      return mapper.rgx.apply(this, rgxmap.device);
    };
    this.getEngine = function() {
      return mapper.rgx.apply(this, rgxmap.engine);
    };
    this.getOS = function() {
      return mapper.rgx.apply(this, rgxmap.os);
    };
    this.getResult = function() {
      return {
        ua: this.getUA(),
        browser: this.getBrowser(),
        engine: this.getEngine(),
        os: this.getOS(),
        device: this.getDevice(),
        cpu: this.getCPU()
      };
    };
    this.getUA = function() {
      return ua;
    };
    this.setUA = function(uastring) {
      ua = uastring;
      return this;
    };
    return this;
  };

  UAParser.VERSION = LIBVERSION;
  UAParser.BROWSER = {
    NAME: NAME,
    MAJOR: MAJOR, // deprecated
    VERSION: VERSION
  };
  UAParser.CPU = {
    ARCHITECTURE: ARCHITECTURE
  };
  UAParser.DEVICE = {
    MODEL: MODEL,
    VENDOR: VENDOR,
    TYPE: TYPE,
    CONSOLE: CONSOLE,
    MOBILE: MOBILE,
    SMARTTV: SMARTTV,
    TABLET: TABLET,
    WEARABLE: WEARABLE,
    EMBEDDED: EMBEDDED
  };
  UAParser.ENGINE = {
    NAME: NAME,
    VERSION: VERSION
  };
  UAParser.OS = {
    NAME: NAME,
    VERSION: VERSION
  };


  ///////////
  // Export
  //////////


  // check js environment
  if (typeof(exports) !== UNDEF_TYPE) {
    // nodejs env
    if (typeof module !== UNDEF_TYPE && module.exports) {
      exports = module.exports = UAParser;
    }
    exports.UAParser = UAParser;
  } else {
    // requirejs env (optional)
    if (typeof(define) === FUNC_TYPE && define.amd) {
      define("ua-parser-js", [], function() {
        return UAParser;
      });
    } else {
      // browser env
      window.UAParser = UAParser;
    }
  }

  // jQuery/Zepto specific (optional)
  // Note:
  //   In AMD env the global scope should be kept clean, but jQuery is an exception.
  //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
  //   and we should catch that.
  var $ = window.jQuery || window.Zepto;
  if (typeof $ !== UNDEF_TYPE) {
    var parser = new UAParser();
    $.ua = parser.getResult();
    $.ua.get = function() {
      return parser.getUA();
    };
    $.ua.set = function(uastring) {
      parser.setUA(uastring);
      var result = parser.getResult();
      for (var prop in result) {
        $.ua[prop] = result[prop];
      }
    };
  }

})(typeof window === 'object' ? window : this);
/* global UAParser, _landyCampaigns */

/**
 * Go through campaigns Array and initialize
 * Landy if current url has installed campaign
 * or has any goals on it
 * @param  {Array} campaignList List of active campaigns
 */
function startLandy(campaignList) {
  var currentUrl = window.location.href;
  for (var i = campaignList.length - 1; i >= 0; i--) {
    var cfg = campaignList[i];
    var validCampaignUrl = landyCheckUrls(currentUrl,
                                          cfg.url,
                                          cfg.subtype);
    var campaign;

    if (validCampaignUrl) {
      campaign = new Landy(cfg.id,
                               cfg.url,
                               cfg.type,
                               cfg.subtype,
                               cfg.g);
      campaign.init();
    } else if (Object.prototype.toString.call(cfg.g) === '[object Array]') {
      for (var k = cfg.g.length - 1; k >= 0; k--) {
        var goal = cfg.g[k];
        if (goal.event === 'visit') {
          var validGoalUrl = landyCheckUrls(currentUrl,
                                            goal.value,
                                            goal.type);
          if (validGoalUrl) {
            campaign = new Landy(cfg.id);

            campaign.sendSuccess();
          }
        }
      }
    }
  }
}


/**
 * Parse url
 * @param  {String} href Url
 * @return {Object}      Parsed url object
 */
function landyParseUrl(href) {
  var match = href.match(/^(https?\:)\/\/((?:www.|)([^:\/?#]*)(?:\:([0-9]+))?)(|\/[^?#]*)(\?[^#]*|)(#.*|)$/);
  return match && {
    protocol: match[1],
    host: match[2],
    hostname: match[3],
    port: match[4],
    pathname: match[5],
    search: match[6],
    hash: match[7]
  };
}

/**
 * Compare current and campaign urls
 * @param  {String} currentUrl  Current url
 * @param  {String} campaignUrl  Campaign url
 * @param  {String} compareType  Type of comparison
 * @return {Boolean}      does url matches
 */
function landyCheckUrls(currentUrl, campaignUrl, compareType) {
  var result;
  var clearedCurrentlUrl;
  var clearedCampaignUrl;
  switch (compareType) {
    case 'contains':
      clearedCurrentlUrl = currentUrl.replace(/\/$/, '');
      clearedCampaignUrl = campaignUrl.replace(/\/$/, '');
      result = (clearedCurrentlUrl.indexOf(clearedCampaignUrl) !== -1);
      break;
    case 'matches':
      clearedCurrentlUrl = currentUrl.replace(/\/$/, '');
      clearedCampaignUrl = campaignUrl.replace(/\/$/, '');
      result = (clearedCurrentlUrl === clearedCampaignUrl);
      break;
    case 'simpleMatch':
      var parsedCurrentUrl = landyParseUrl(currentUrl);
      var parsedCampaignUrl = landyParseUrl(campaignUrl);
      if (!parsedCurrentUrl || !parsedCampaignUrl) {
        result = false;
        break;
      }
      var pathnameCurrentUrl = parsedCurrentUrl.pathname.replace(/\/$/, '');
      var pathnameCampaignUrl = parsedCampaignUrl.pathname.replace(/\/$/, '');
      result = (parsedCurrentUrl.hostname === parsedCampaignUrl.hostname &&
        pathnameCurrentUrl === pathnameCampaignUrl);
      break;
    default:
      result = false;
      break;
  }
  return result;
}

function Landy(campaignId, url, type, subtype, goals) {
  var zaxUrl = '//zax.landy.io';

  var userIdKey = '_landyUID';
  var variationsKey = '_landyVariation';
  var goalsKey = '_landySuccess';
  var timeStorageExpireId = '_landyExpire';

  var w = window;
  var d = document;
  var n = navigator;

  function supportsLocalStorage() {
    try {
      return 'localStorage' in w && w.localStorage !== null;
    } catch (e) {
      return false;
    }
  }

  function checkStorageExpire() {
    var timestamp = new Date();
    return timestamp.getTime() - localStorage.getItem(timeStorageExpireId) < 0;
  }

  // Get cookie or localStorage(for variations) variable
  function getCookie(value) {
    var name = value + '_' + campaignId;
    var result;
    if (supportsLocalStorage(w) && value === variationsKey) {
      if (checkStorageExpire()) result = localStorage.getItem(name);
    } else {
      var m = d.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
      ));
      if (m) result = decodeURIComponent(m[1]);
    }
    return result;
  }

  /**
   * Loops through the parts of a full hostname and
   * tries to set a cookie on that domain,
   * it will set a cookie at the highest level possible
   * and return it as top-level domain
   * http://rossscrivener.co.uk/blog/javascript-get-domain-exclude-subdomain
   * @return {String} top domain
   */
  function getDomain() {
    var i = 0;
    var domain = d.domain;
    var p = domain.split('.');
    var s = '_gd' + (new Date()).getTime();
    while (i < (p.length - 1) && d.cookie.indexOf(s + '=' + s) === -1) {
      domain = p.slice(-1 - (++i)).join('.');
      d.cookie = s + '=' + s + ';domain=' + domain + ';';
    }
    d.cookie = s + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=' + domain + ';';
    return domain;
  }

  var topLevelDomain = getDomain() || d.domain;

  // Set cookie or localStorage(for variations) variable
  function setCookie(cookieName, value, lifetime) {
    var name = cookieName + '_' + campaignId;
    var timestamp = new Date();
    var timeExpire = timestamp.getTime() + (lifetime * 24 * 60 * 60 * 1000);

    if (supportsLocalStorage(w) && cookieName === variationsKey) {
      localStorage.setItem(name, value);
      localStorage.setItem(timeStorageExpireId, timeExpire);
    } else {
      timestamp.setTime(timeExpire);
      var expires = 'expires=' + timestamp.toUTCString();
      var cookie = name + '=' + value + ';path=/;domain=.' + topLevelDomain + ';' + expires;
      d.cookie = cookie;
    }
  }

  /**
   * Made post request to zax
   * @param  {String}   requestURL URL
   * @param  {String}   body       Request body
   * @param  {Function} callback   Callback function on response
   */
  function doPostRequest(requestURL, body, callback) {
    var xhr = new XMLHttpRequest();
    if (xhr) {
      xhr.open('POST', requestURL, true);
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.onreadystatechange = function onreadystatechange() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var resp = (xhr.responseText) ? JSON.parse(xhr.responseText) : true;
          if (typeof (callback) === 'function') callback(resp);
        }
      };

      if (typeof body === 'undefined') {
        xhr.send();
      } else {
        xhr.send(body);
      }
    }
  }


  /**
   * Sends success if visitor did not reach
   * the goal previosly and has visited original
   * campaign URL
   */
  function sendSuccess() {
    var uidInCookie = getCookie(userIdKey);
    if (!getCookie(goalsKey) && uidInCookie) {
      var data = {
        session: uidInCookie,
        timestamp: Date.now()
      };

      var requestURL = zaxUrl + '/app/' + campaignId + '/event/finish';

      doPostRequest(requestURL, JSON.stringify(data), function setSuccessCookie() {
        setCookie(goalsKey, true, 30);
      });
    }
  }

  this.sendSuccess = sendSuccess;


  /**
   * Attaching listener to selected selector
   * and sends success by click
   * @param {String} selector CSS selector
   * @return {Function} Function which sets listener
   */
  function setListener(selector) {
    return function listenerSetter() {
      var i;
      var max;
      var els = d.querySelectorAll(selector);
      for (max = els.length, i = max - 1; i >= 0; i -= 1) {
        els[i].addEventListener('click', sendSuccess, false);
      }
    };
  }


  /**
   * Browser window size
   * @type {Object}
   */
  var _browserWH = {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
  };


  /**
   * Gets query parameter from url by name
   * @param  {String} name Query parameter
   * @return {String}      Parameter value
   */
  function getQueryParameter(name) {
    var parsedName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + parsedName + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }


  /**
   * Generates visitors identity
   * @return {Object} With visitor characteristics
   */
  function generateIdentity() {
    // Creating an object from parsed User-Agent
    var parser = new UAParser();
    var parsedUA = parser.getResult();

    var userData = {
      browser: (function() {
        return parsedUA.browser.name;
      })(),
      browserV: (function() {
        return parsedUA.browser.name + ' ' + parsedUA.browser.major;
      })(),
      devType: (function() {
        return parsedUA.device.type || '';
      })(),
      device: (function() {
        return parsedUA.device.model || '';
      })(),
      vendor: (function() {
        return parsedUA.device.vendor || '';
      })(),
      lang: (function() {
        var lang = w.navigator.userLanguage || w.navigator.language;
        return lang.toLowerCase();
      })(),
      hour: (function() {
        var localHour = new Date();
        return '' + localHour.getHours();
      })(),
      day: (function() {
        var localDay = new Date();
        return '' + localDay.getDay();
      })(),
      month: (function() {
        var localMonth = new Date();
        return '' + localMonth.getMonth();
      })(),
      mobile: (function() {
        return +(parsedUA.device.type === 'mobile') + '';
      })(),
      screen: (function() {
        return w.screen.availWidth + 'x' + w.screen.availHeight;
      })(),
      browserWH: (function() {
        return _browserWH.width + 'x' + _browserWH.height;
      })(),
      os: (function() {
        return parsedUA.os.name;
      })(),
      osVersion: (function() {
        return parsedUA.os.name + ' ' + parsedUA.os.version;
      })(),
      cookieEnabled: (function() {
        return '' + n.cookieEnabled;
      })(),
      ref: (function() {
        var ref = d.referrer;
        if (ref) {
          ref = ref.split('/')[2];
          if (ref) {
            ref = ref.split('.')[1];
          } else {
            return '#';
          }
          if (ref) {
            return ref;
          }
        }
        return '#';
      })(),
      utm_source: (function() {
        return getQueryParameter('utm_source');
      })(),
      utm_campaign: (function() {
        return getQueryParameter('utm_campaign');
      })(),
      utm_medium: (function() {
        return getQueryParameter('utm_medium');
      })()
    };

    return userData;
  }


  /**
   * Unescape html string
   * @param  {String} htmlString escaped string
   * @return {String}            unescaped html string
   */
  function unescapeHtml(htmlString) {
    var entityMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': '\x27',
      '&#x2F;': '/',
      '<fakebr>': '\n'
    };

    return String(htmlString).replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|<fakebr>/g, function(s) {
      return entityMap[s];
    });
  }


  /**
   * Generates unique id
   * @return {String} UID
   */
  function generateUid() {
    var uniqueId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = (c === 'x') ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return uniqueId;
  }


  var count = {};
  /**
   * Search for element by selector as soon as
   * page was started to load
   * @param  {String} sel    css selector
   * @param  {Object} attrs  attributes to update
   * @param  {Object} styles style to update
   * @param  {String} html   content inside selector
   *                          element to update
   * @param  {Function} func   callback
   */
  function findElements(sel, attrs, styles, html, func) {
    if (typeof count[sel] === 'undefined') {
      count[sel] = 0;
    }
    if (count[sel]++ > 1000) {
      func(sel, attrs, styles, html);
    } else {
      d.querySelectorAll(sel).length < 1 ? setTimeout(function() {
        findElements(sel, attrs, styles, html, func);
      }, 5) : func(sel, attrs, styles, html);
    }
  }


  /**
   * Applies content, attributes and styles
   * to the selected element
   * @param  {String} sel    Css selector
   * @param  {Object} attrs  Tag attributes
   * @param  {Object} styles Css styles
   * @param  {String} html   Unescaped html
   */
  function applyProperties(sel, attrs, styles, html) {
    var elementsArray = d.querySelectorAll(sel);
    if (!elementsArray.length) {
      console.log('Could not find ' + sel + ' element on the page');
      return;
    }

    var ab;
    var max;
    var key;

    for (max = elementsArray.length, ab = max - 1; ab >= 0; ab -= 1) {
      var element = elementsArray[ab];
      for (key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          element.setAttribute(key, attrs[key]);
        }
      }
      for (key in styles) {
        if (styles.hasOwnProperty(key)) {
          element.style[key] = styles[key];
        }
      }
      if (typeof html !== 'undefined') {
        element.innerHTML = unescapeHtml(html);
      }
    }
  }


  /**
   * Apply variation
   * @param  {Array} elements List of elements or urls
   */
  function applyVariation(elements) {
    switch (type) {
      case 'split':
        if (url !== elements.url) w.location = elements.url;
        break;

      case 'ab':
        var attrs = {};
        var styles = {};
        var html;
        var i;
        var max;
        var element;

        for (max = elements.length, i = max - 1; i >= 0; i -= 1) {
          element = JSON.parse(elements[i]);
          attrs = element.attributes || {};
          styles = element.styles || {};
          html = element.html || undefined;

          findElements(element.selector, attrs, styles, html, applyProperties);
        }
        break;

      default:
        return;
    }
  }

  /**
   * Initialize Landy. Checks that script executed
   * on the correct url, request variations, save them
   * to cookies and apply to the page. If the goal is
   * reached, sends success to the zax and save state
   * to cookies.
   * @param  {Function} callback Callback for testing purpose
   */
  this.init = function init() {
    // Get uid from cookie and generate if it does not exists
    // TODO: (dtsepelev) Not sure how should it work on cross-domain
    var uid = getCookie(userIdKey) || generateUid();
    var data = {
      'session': uid,
      'timestamp': Date.now(),
      'identity': generateIdentity()
    };

    // Check that it is url of landing page
    var urlIsCorrect = landyCheckUrls(w.location.href, url, subtype);

    if (urlIsCorrect) {
      // Check if variation is in cookie
      var cookie = getCookie(variationsKey);

      // Make a response to ZAX, if variation is not in cookie
      if (!cookie) {
        var requestURL = zaxUrl + '/app/' + campaignId + '/event/predict';
        doPostRequest(requestURL, JSON.stringify(data), function saveAndApplyVariation(response) {
          if (response) {
            var responseValue = JSON.parse(response.variation.value);
            var variationInResponse;
            switch (type) {
              case 'ab':
                variationInResponse = responseValue.elements;
                break;
              case 'split':
                variationInResponse = responseValue;
                break;
              default:
                return;
            }
            setCookie(userIdKey, uid, 360);
            setCookie(variationsKey, JSON.stringify(variationInResponse), 30);
            applyVariation(variationInResponse);
          }
        });
      } else {
        var variationInCookie = JSON.parse(cookie);
        applyVariation(variationInCookie);
      }
    }
    // Check goals array and execute on success
    if (Object.prototype.toString.call(goals) === '[object Array]') {
      var i;
      var max;

      for (max = goals.length, i = max - 1; i >= 0; i -= 1) {
        var goal = goals[i];
        switch (goal.event) {
          case 'visit':
            if (landyCheckUrls(w.location.href, goal.value, goal.type)) {
              sendSuccess();
            }
            break;
          case 'click':
            if (urlIsCorrect) {
              w.addEventListener('load', setListener(goal.value), false);
            }
            break;
          default:
            return;
        }
      }
    }
  };

}

if (_landyCampaigns && _landyCampaigns.length > 0) {
  startLandy(_landyCampaigns);
}
