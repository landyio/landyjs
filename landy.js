var landy = (function (w, d, n) {
  var t = {},
    ci = "landy-uid",
    vid = "landy-variations",
    gid = "landy-goals",
    uid,
    timeStorageExpireId = "landy-expire",
    count = {},
    hasOwnProperty = Object.prototype.hasOwnProperty,
    modelId,
    predictUrl = w.location.protocol !== "https:" ? "http://zax.landy.io:80" : "https://zax.landy.io:443",
    // predictUrl = w.location.protocol !== "https:" ? "http://192.168.99.100:9180" : "http://192.168.99.100:9180",
    type,
    subtype;

  //check support of localStorage
  var supports_html5_storage = function () {
    try {
      return 'localStorage' in w && w.localStorage !== null;
    } catch (e) {
      return false;
    }
  }();

  //parse userAgent
  (function (e, t) {
    "use strict";
    var n = "7.9.1",
      r = "",
      i = "?",
      s = "function",
      o = "undefined",
      u = "object",
      a = "string",
      f = "major",
      l = "model",
      c = "name",
      h = "type",
      p = "vendor",
      d = "version",
      v = "architecture",
      m = "console",
      g = "mobile",
      y = "tablet",
      b = "smarttv",
      w = "wearable",
      E = "embedded",
      S = {
        extend: function (e, t) {
          for (var n in t) "browser cpu device engine os".indexOf(n) !== -1 && t[n].length % 2 === 0 && (e[n] = t[n].concat(e[n]));
          return e
        },
        has: function (e, t) {
          return typeof e == "string" ? t.toLowerCase().indexOf(e.toLowerCase()) !== -1 : !1
        },
        lowerize: function (e) {
          return e.toLowerCase()
        },
        major: function (e) {
          return typeof e === a ? e.split(".")[0] : t
        }
      },
      x = {
        rgx: function () {
          var e, n = 0,
            r, i, a, f, l, c, h = arguments;
          while (n < h.length && !l) {
            var p = h[n],
              d = h[n + 1];
            if (typeof e === o) {
              e = {};
              for (a in d) f = d[a], typeof f === u ? e[f[0]] = t : e[f] = t
            }
            r = i = 0;
            while (r < p.length && !l) {
              l = p[r++].exec(this.getUA());
              if (!!l)
                for (a = 0; a < d.length; a++) c = l[++i], f = d[a], typeof f === u && f.length > 0 ? f.length == 2 ? typeof f[1] == s ? e[f[0]] = f[1].call(this, c) : e[f[0]] = f[1] : f.length == 3 ? typeof f[1] === s && (!f[1].exec || !f[1].test) ? e[f[0]] = c ? f[1].call(this, c, f[2]) : t : e[f[0]] = c ? c.replace(f[1], f[2]) : t : f.length == 4 && (e[f[0]] = c ? f[3].call(this, c.replace(f[1], f[2])) : t) : e[f] = c ? c : t
            }
            n += 2
          }
          return e
        },
        str: function (e, n) {
          for (var r in n)
            if (typeof n[r] === u && n[r].length > 0) {
              for (var s = 0; s < n[r].length; s++)
                if (S.has(n[r][s], e)) return r === i ? t : r
            } else if (S.has(n[r], e)) return r === i ? t : r;
          return e
        }
      },
      T = {
        browser: {
          oldsafari: {
            version: {
              "1.0": "/8",
              1.2: "/1",
              1.3: "/3",
              "2.0": "/412",
              "2.0.2": "/416",
              "2.0.3": "/417",
              "2.0.4": "/419",
              "?": "/"
            }
          }
        },
        device: {
          amazon: {
            model: {
              "Fire Phone": ["SD", "KF"]
            }
          },
          sprint: {
            model: {
              "Evo Shift 4G": "7373KT"
            },
            vendor: {
              HTC: "APA",
              Sprint: "Sprint"
            }
          }
        },
        os: {
          windows: {
            version: {
              ME: "4.90",
              "NT 3.11": "NT3.51",
              "NT 4.0": "NT4.0",
              2e3: "NT 5.0",
              XP: ["NT 5.1", "NT 5.2"],
              Vista: "NT 6.0",
              7: "NT 6.1",
              8: "NT 6.2",
              8.1: "NT 6.3",
              10: ["NT 6.4", "NT 10.0"],
              RT: "ARM"
            }
          }
        }
      },
      N = {
        browser: [
          [/(opera\smini)\/([\w\.-]+)/i, /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i, /(opera).+version\/([\w\.]+)/i, /(opera)[\/\s]+([\w\.]+)/i],
          [c, d],
          [/\s(opr)\/([\w\.]+)/i],
          [
            [c, "Opera"], d
          ],
          [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i, /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i, /(?:ms|\()(ie)\s([\w\.]+)/i, /(rekonq)\/([\w\.]+)*/i, /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium)\/([\w\.-]+)/i],
          [c, d],
          [/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i],
          [
            [c, "IE"], d
          ],
          [/(edge)\/((\d+)?[\w\.]+)/i],
          [c, d],
          [/(yabrowser)\/([\w\.]+)/i],
          [
            [c, "Yandex"], d
          ],
          [/(comodo_dragon)\/([\w\.]+)/i],
          [
            [c, /_/g, " "], d
          ],
          [/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i, /(qqbrowser)[\/\s]?([\w\.]+)/i],
          [c, d],
          [/(uc\s?browser)[\/\s]?([\w\.]+)/i, /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i, /JUC.+(ucweb)[\/\s]?([\w\.]+)/i],
          [
            [c, "UCBrowser"], d
          ],
          [/(dolfin)\/([\w\.]+)/i],
          [
            [c, "Dolphin"], d
          ],
          [/((?:android.+)crmo|crios)\/([\w\.]+)/i],
          [
            [c, "Chrome"], d
          ],
          [/XiaoMi\/MiuiBrowser\/([\w\.]+)/i],
          [d, [c, "MIUI Browser"]],
          [/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i],
          [d, [c, "Android Browser"]],
          [/FBAV\/([\w\.]+);/i],
          [d, [c, "Facebook"]],
          [/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i],
          [d, [c, "Mobile Safari"]],
          [/version\/([\w\.]+).+?(mobile\s?safari|safari)/i],
          [d, c],
          [/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i],
          [c, [d, x.str, T.browser.oldsafari.version]],
          [/(konqueror)\/([\w\.]+)/i, /(webkit|khtml)\/([\w\.]+)/i],
          [c, d],
          [/(navigator|netscape)\/([\w\.-]+)/i],
          [
            [c, "Netscape"], d
          ],
          [/fxios\/([\w\.-]+)/i],
          [d, [c, "Firefox"]],
          [/(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i, /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i, /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf)[\/\s]?([\w\.]+)/i, /(links)\s\(([\w\.]+)/i, /(gobrowser)\/?([\w\.]+)*/i, /(ice\s?browser)\/v?([\w\._]+)/i, /(mosaic)[\/\s]([\w\.]+)/i],
          [c, d]
        ],
        cpu: [
          [/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],
          [
            [v, "amd64"]
          ],
          [/(ia32(?=;))/i],
          [
            [v, S.lowerize]
          ],
          [/((?:i[346]|x)86)[;\)]/i],
          [
            [v, "ia32"]
          ],
          [/windows\s(ce|mobile);\sppc;/i],
          [
            [v, "arm"]
          ],
          [/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],
          [
            [v, /ower/, "", S.lowerize]
          ],
          [/(sun4\w)[;\)]/i],
          [
            [v, "sparc"]
          ],
          [/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],
          [
            [v, S.lowerize]
          ]
        ],
        device: [
          [/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],
          [l, p, [h, y]],
          [/applecoremedia\/[\w\.]+ \((ipad)/],
          [l, [p, "Apple"],
            [h, y]
          ],
          [/(apple\s{0,1}tv)/i],
          [
            [l, "Apple TV"],
            [p, "Apple"]
          ],
          [/(archos)\s(gamepad2?)/i, /(hp).+(touchpad)/i, /(kindle)\/([\w\.]+)/i, /\s(nook)[\w\s]+build\/(\w+)/i, /(dell)\s(strea[kpr\s\d]*[\dko])/i],
          [p, l, [h, y]],
          [/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i],
          [l, [p, "Amazon"],
            [h, y]
          ],
          [/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i],
          [
            [l, x.str, T.device.amazon.model],
            [p, "Amazon"],
            [h, g]
          ],
          [/\((ip[honed|\s\w*]+);.+(apple)/i],
          [l, p, [h, g]],
          [/\((ip[honed|\s\w*]+);/i],
          [l, [p, "Apple"],
            [h, g]
          ],
          [/(blackberry)[\s-]?(\w+)/i, /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i, /(hp)\s([\w\s]+\w)/i, /(asus)-?(\w+)/i],
          [p, l, [h, g]],
          [/\(bb10;\s(\w+)/i],
          [l, [p, "BlackBerry"],
            [h, g]
          ],
          [/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i],
          [l, [p, "Asus"],
            [h, y]
          ],
          [/(sony)\s(tablet\s[ps])\sbuild\//i, /(sony)?(?:sgp.+)\sbuild\//i],
          [
            [p, "Sony"],
            [l, "Xperia Tablet"],
            [h, y]
          ],
          [/(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i],
          [
            [p, "Sony"],
            [l, "Xperia Phone"],
            [h, g]
          ],
          [/\s(ouya)\s/i, /(nintendo)\s([wids3u]+)/i],
          [p, l, [h, m]],
          [/android.+;\s(shield)\sbuild/i],
          [l, [p, "Nvidia"],
            [h, m]
          ],
          [/(playstation\s[3portablevi]+)/i],
          [l, [p, "Sony"],
            [h, m]
          ],
          [/(sprint\s(\w+))/i],
          [
            [p, x.str, T.device.sprint.vendor],
            [l, x.str, T.device.sprint.model],
            [h, g]
          ],
          [/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i],
          [p, l, [h, y]],
          [/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i, /(zte)-(\w+)*/i, /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],
          [p, [l, /_/g, " "],
            [h, g]
          ],
          [/(nexus\s9)/i],
          [l, [p, "HTC"],
            [h, y]
          ],
          [/[\s\(;](xbox(?:\sone)?)[\s\);]/i],
          [l, [p, "Microsoft"],
            [h, m]
          ],
          [/(kin\.[onetw]{3})/i],
          [
            [l, /\./g, " "],
            [p, "Microsoft"],
            [h, g]
          ],
          [/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i, /mot[\s-]?(\w+)*/i, /(XT\d{3,4}) build\//i],
          [l, [p, "Motorola"],
            [h, g]
          ],
          [/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],
          [l, [p, "Motorola"],
            [h, y]
          ],
          [/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i, /((SM-T\w+))/i],
          [
            [p, "Samsung"], l, [h, y]
          ],
          [/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i, /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i, /sec-((sgh\w+))/i],
          [
            [p, "Samsung"], l, [h, g]
          ],
          [/(samsung);smarttv/i],
          [p, l, [h, b]],
          [/\(dtv[\);].+(aquos)/i],
          [l, [p, "Sharp"],
            [h, b]
          ],
          [/sie-(\w+)*/i],
          [l, [p, "Siemens"],
            [h, g]
          ],
          [/(maemo|nokia).*(n900|lumia\s\d+)/i, /(nokia)[\s_-]?([\w-]+)*/i],
          [
            [p, "Nokia"], l, [h, g]
          ],
          [/android\s3\.[\s\w;-]{10}(a\d{3})/i],
          [l, [p, "Acer"],
            [h, y]
          ],
          [/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i],
          [
            [p, "LG"], l, [h, y]
          ],
          [/(lg) netcast\.tv/i],
          [p, l, [h, b]],
          [/(nexus\s[45])/i, /lg[e;\s\/-]+(\w+)*/i],
          [l, [p, "LG"],
            [h, g]
          ],
          [/android.+(ideatab[a-z0-9\-\s]+)/i],
          [l, [p, "Lenovo"],
            [h, y]
          ],
          [/linux;.+((jolla));/i],
          [p, l, [h, g]],
          [/((pebble))app\/[\d\.]+\s/i],
          [p, l, [h, w]],
          [/android.+;\s(glass)\s\d/i],
          [l, [p, "Google"],
            [h, w]
          ],
          [/android.+(\w+)\s+build\/hm\1/i, /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i, /android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i],
          [
            [l, /_/g, " "],
            [p, "Xiaomi"],
            [h, g]
          ],
          [/(mobile|tablet);.+rv\:.+gecko\//i],
          [
            [h, S.lowerize], p, l
          ]
        ],
        engine: [
          [/windows.+\sedge\/([\w\.]+)/i],
          [d, [c, "EdgeHTML"]],
          [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i, /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, /(icab)[\/\s]([23]\.[\d\.]+)/i],
          [c, d],
          [/rv\:([\w\.]+).*(gecko)/i],
          [d, c]
        ],
        os: [
          [/microsoft\s(windows)\s(vista|xp)/i],
          [c, d],
          [/(windows)\snt\s6\.2;\s(arm)/i, /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],
          [c, [d, x.str, T.os.windows.version]],
          [/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],
          [
            [c, "Windows"],
            [d, x.str, T.os.windows.version]
          ],
          [/\((bb)(10);/i],
          [
            [c, "BlackBerry"], d
          ],
          [/(blackberry)\w*\/?([\w\.]+)*/i, /(tizen)[\/\s]([\w\.]+)/i, /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i, /linux;.+(sailfish);/i],
          [c, d],
          [/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],
          [
            [c, "Symbian"], d
          ],
          [/\((series40);/i],
          [c],
          [/mozilla.+\(mobile;.+gecko.+firefox/i],
          [
            [c, "Firefox OS"], d
          ],
          [/(nintendo|playstation)\s([wids3portablevu]+)/i, /(mint)[\/\s\(]?(\w+)*/i, /(mageia|vectorlinux)[;\s]/i, /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i, /(hurd|linux)\s?([\w\.]+)*/i, /(gnu)\s?([\w\.]+)*/i],
          [c, d],
          [/(cros)\s[\w]+\s([\w\.]+\w)/i],
          [
            [c, "Chromium OS"], d
          ],
          [/(sunos)\s?([\w\.]+\d)*/i],
          [
            [c, "Solaris"], d
          ],
          [/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],
          [c, d],
          [/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i],
          [
            [c, "iOS"],
            [d, /_/g, "."]
          ],
          [/(mac\sos\sx)\s?([\w\s\.]+\w)*/i, /(macintosh|mac(?=_powerpc)\s)/i],
          [
            [c, "Mac OS"],
            [d, /_/g, "."]
          ],
          [/((?:open)?solaris)[\/\s-]?([\w\.]+)*/i, /(haiku)\s(\w+)/i, /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i, /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i, /(unix)\s?([\w\.]+)*/i],
          [c, d]
        ]
      },
      C = function (t, n) {
        if (this instanceof C) {
          var i = t || (e && e.navigator && e.navigator.userAgent ? e.navigator.userAgent : r),
            s = n ? S.extend(N, n) : N;
          return this.getBrowser = function () {
            var e = x.rgx.apply(this, s.browser);
            return e.major = S.major(e.version), e
          }, this.getCPU = function () {
            return x.rgx.apply(this, s.cpu)
          }, this.getDevice = function () {
            return x.rgx.apply(this, s.device)
          }, this.getEngine = function () {
            return x.rgx.apply(this, s.engine)
          }, this.getOS = function () {
            return x.rgx.apply(this, s.os)
          }, this.getResult = function () {
            return {
              ua: this.getUA(),
              browser: this.getBrowser(),
              engine: this.getEngine(),
              os: this.getOS(),
              device: this.getDevice(),
              cpu: this.getCPU()
            }
          }, this.getUA = function () {
            return i
          }, this.setUA = function (e) {
            return i = e, this
          }, this.setUA(i), this
        }
        return (new C(t, n)).getResult()
      };
    C.VERSION = n, C.BROWSER = {
      NAME: c,
      MAJOR: f,
      VERSION: d
    }, C.CPU = {
      ARCHITECTURE: v
    }, C.DEVICE = {
      MODEL: l,
      VENDOR: p,
      TYPE: h,
      CONSOLE: m,
      MOBILE: g,
      SMARTTV: b,
      TABLET: y,
      WEARABLE: w,
      EMBEDDED: E
    }, C.ENGINE = {
      NAME: c,
      VERSION: d
    }, C.OS = {
      NAME: c,
      VERSION: d
    }, typeof exports !== o ? (typeof module !== o && module.exports && (exports = module.exports = C), exports.AGParser = C) : typeof define === s && define.amd ? define(function () {
      return C
    }) : e.AGParser = C;
    var k = e.jQuery || e.Zepto;
    if (typeof k !== o) {
      var L = new C;
      k.ua = L.getResult(), k.ua.get = function () {
        return L.getUA()
      }, k.ua.set = function (e) {
        L.setUA(e);
        var t = L.getResult();
        for (var n in t) k.ua[n] = t[n]
      }
    }
  })(w);
  var parser = new AGParser;
  AGData = parser.getResult();

  function setUid() {
    c(ci, uid, 30);
  }

  var xhr = new XMLHttpRequest();

  //call other domain with XMLHttpRequest
  function callOtherDomain(url, body, callback) {
    if (xhr) {
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            if (url.indexOf(modelId + "/event/finish") != -1) {
              c(gid, true, 30);
            }
            if (!xhr.responseText) return false;
            var resp = JSON.parse(xhr.responseText);
            if (resp.variation) {
              var value = JSON.parse(resp.variation.value),
                els = value.elements || value.url;
              //set uid
              setUid();
              //set cookie for nex variations
              c(vid, els, 360);
              callback(els);
            }
          }
        }
      };

      if (typeof body == "undefined") {
        xhr.send();
      } else {
        xhr.send(body);
      }
    }
  }

  //try to find elements on page 
  function K(sel, attrs, styles, html, func) {
    if (typeof count[sel] === "undefined") {
      count[sel] = 0
    }
    if (count[sel]++ > 1000) {
      func(sel, attrs, styles, html)
    } else {
      d.querySelectorAll(sel).length < 1 ? setTimeout(function () {
        K(sel, attrs, styles, html, func)
      }, 5) : func(sel, attrs, styles, html)
    }
  };

  //success or goal function
  function sendSuccess() {
    if (!gc(gid) && gc(ci)) {
      var data = {
        session: gc(ci),
        timestamp: Date.now()
      };

      var url = predictUrl + "/app/" + modelId + "/event/finish";

      callOtherDomain(url, JSON.stringify(data));
    }

  };

  //set listener of sendSuccess on dom element
  function setListener(selector) {
    var i, max;
    var els = d.querySelectorAll(selector);
    for (max = els.length, i = max - 1; i >= 0; i -= 1) {
      els[i].addEventListener("click", sendSuccess, false);
    }
  };

  //get cookie or localStorage(for variations) variable
  function gc(N) {
    var name = N + "_" + modelId;
    if (supports_html5_storage && N == vid) {
      return checkStorageExpire() ? localStorage.getItem(name) : false;
    } else {
      var m = d.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return m ? decodeURIComponent(m[1]) : undefined;
    }
  };

  //set cookie or localStorage(for variations) variable
  function c(Q, T, R) {
    var name = Q + "_" + modelId,
      S = new Date(),
      timeExpire = S.getTime() + (R * 24 * 60 * 60 * 1000);
    if (supports_html5_storage && Q == vid) {
      localStorage.setItem(name, T);
      localStorage.setItem(timeStorageExpireId, timeExpire);
    } else {

      S.setTime(timeExpire);
      var P = "expires=" + S.toUTCString();
      d.cookie = name + "=" + T + ";path=/;domain=." + d.domain + ";" + P;
    }
  };

  //check that localStorage variable don't expires
  function checkStorageExpire() {
    var S = new Date();
    return S.getTime() - localStorage.getItem(timeStorageExpireId) < 0;
  };

  //get width of browser
  function getWidth() {
    if (d.documentElement && d.documentElement.clientWidth) {
      return d.documentElement.clientWidth;
    }

    if (d.body) {
      return d.body.clientWidth;
    }
  }

  //get height of browser
  function getHeight() {
    if (d.documentElement && d.documentElement.clientHeight) {
      return d.documentElement.clientHeight;
    }

    if (d.body) {
      return d.body.clientHeight;
    }
  }


  // Get parameter from url
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  //get data about user
  function H() {
    var Q = {
      browser: (function () {
        return AGData.browser.name;
      })(),
      browserV: (function () {
        return AGData.browser.name + " " + AGData.browser.major;
      })(),
      devType: (function () {
        return AGData.device.type || "";
      })(),
      device: (function () {
        return AGData.device.model || "";
      })(),
      vendor: (function () {
        return AGData.device.vendor || "";
      })(),
      lang: (function () {
        var R = w.navigator.userLanguage || w.navigator.language;
        return R.toLowerCase()
      })(),
      hour: (function () {
        var S = new Date();
        return "" + S.getHours()
      })(),
      day: (function () {
        var S = new Date();
        return "" + S.getDay()
      })(),
      month: (function () {
        var S = new Date();
        return "" + S.getMonth()
      })(),
      mobile: (function () {
        var R = "0";
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          R = "1"
        }
        return R
      })(),
      screen: (function () {
        return w.screen.availWidth + "x" + w.screen.availHeight;
      })(),
      browserWH: (function () {
        return getWidth() + "x" + getHeight();
      })(),
      os: (function () {
        return AGData.os.name;
      })(),
      osVersion: (function () {
        return AGData.os.name + AGData.os.version;
      })(),
      cookieEnabled: (function () {
        return "" + n.cookieEnabled
      })(),
      ref: (function () {
        var ref = d.referrer;
        if (ref) {
          ref = ref.split("/")[2]
          if (ref) {
            ref = ref.split(".")[1];
          } else {
            return "#"
          }
          if (ref) {
            return ref
          }
        }
        return "#"
      })(),
      utm_source: (function () {
        return getParameterByName('utm_source')
      })(),
      utm_campaign: (function () {
        return getParameterByName('utm_campaign')
      })(),
      utm_medium: (function () {
        return getParameterByName('utm_medium')
      })()
    };
    for (var P in t) {
      if (typeof Q[P] === "undefined") {
        Q[P] = t[P]
      }
    }
    return Q
  }

  //parse uri function
  function parseUri(str) {
    var o = parseUri.options,
      m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      uri = {},
      i = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
  };

  //options for parseUri
  parseUri.options = {
    strictMode: false,
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };

  //check that host and relative path matches in urls
  function checkUrls(url1, url2) {
    var originalUrl = parseUri(url1).host + "/" + parseUri(url1).relative.slice(1, -1),
      currentUrl = parseUri(url2).host + "/" + parseUri(url2).relative.slice(1, -1);

    return originalUrl == currentUrl;
  }

  //unescape html ))
  function unescapeHtml(string) {
    var entityMap = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      '&quot;': '"',
      '&#39;': "'",
      '&#x2F;': "/",
      '<fakebr>': "\n"
    };

    return String(string).replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;|<fakebr>/g, function (s) {
      return entityMap[s];
    });
  }

  //return init and other options(todo custom sendSuccess) about
  return {
    init: function (I) {
      modelId = I.modelId;
      uid = gc(ci);
      type = I.type;
      subtype = I.subtype;

      var data,
        url = I.url,
        //check subtype contains or check matches
        urlIsCorrect = (subtype == "contains" && w.location.href.indexOf(url) > -1) || checkUrls(w.location.href, url);

      //function, which applies attributes, styles and html to element
      var T = function (sel, attrs, styles, html) {
        var ac = d.querySelectorAll(sel);
        if (!ac.length) {
          return console.log("We could not find " + sel + " !")
        }
        var ab, max, key;
        for (max = ac.length, ab = max - 1; ab >= 0; ab -= 1) {
          var aa = ac[ab];
          for (key in attrs) {
            aa.setAttribute(key, attrs[key]);
          }
          for (key in styles) {
            aa.style[key] = styles[key];
          }
          if (typeof html != "undefined") {
            aa.innerHTML = unescapeHtml(html);
          }

        }
      };

      //loop by elements and check 
      var processing = function (elements) {
        var attrs = {},
          styles = {},
          html,
          i,
          max,
          checkSplit = (typeof elements.url !== "undefined" && elements.url !== url) && !checkUrls(w.location.href, elements.url);



        //split mode
        if (checkSplit) {
          if (urlIsCorrect) {
            w.location = elements.url;
          }

          return;
        }

        // a/b mode
        for (max = elements.length, i = max - 1; i >= 0; i -= 1) {
          element = JSON.parse(elements[i]);
          if (typeof element.attributes != "undefined") {
            attrs = element.attributes;
          }
          if (typeof element.styles != "undefined") {
            styles = element.styles;
          }

          if (typeof element.html != "undefined") {
            html = element.html;
          }

          K(element.selector, attrs, styles, html, T);
        }
      };


      //if it is first visit
      if (!uid) {
        uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };



      data = {
        "session": uid,
        "timestamp": Date.now(),
        "identity": H()
      };


      //try to get variation from cookie
      var firstVariations = gc(vid);
      //check that it is url of landing page
      if (urlIsCorrect) {
        if (firstVariations) {
          processing(JSON.parse(firstVariations));
        } else {
          callOtherDomain(predictUrl + "/app/" + modelId + "/event/predict", JSON.stringify(data), processing);
        }
      }

      var element,
        goal,
        i, max,
        goals = I.g;
      //check goals are exist
      if (typeof goals !== "undefined") {
        for (max = goals.length, i = max - 1; i >= 0; i -= 1) {
          goal = goals[i];
          if (goal.event === "visit") {
            if (checkUrls(goal.value, w.location.href) && goal.type == "matches") {
              sendSuccess();
            }

            if (w.location.href.indexOf(goal.value) > -1 && goal.type == "contains") {
              sendSuccess();
            }
          } else if (goal.event === "click") {
            var selector = goal.value;
            //when page has been loaded we set listener on elements
            w.addEventListener('load', function (selector) {
              setListener(selector);
            }(selector), false);
          }
        }
      }
    }
  }
})(window, document, navigator);
