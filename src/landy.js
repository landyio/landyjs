/* global UAParser, _landyCampaigns */

/**
 * Go through campaigns Array and initialize
 * Landy if current url has installed campaign
 * or has any goals on it
 * @param  {Array} campaignList List of active campaigns
 */
function startLandy(campaignList) {
  for (var i = campaignList.length - 1; i >= 0; i--) {
    var cfg = campaignList[i];
    var validCampaignUrl = landyCheckUrls(window.location.href,
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
    } else if (typeof cfg.g !== 'undefined') {
      for (var k = cfg.g.length - 1; k >= 0; k--) {
        var goal = cfg.g[k];
        if (goal.event === 'visit') {
          var validGoalUrl = landyCheckUrls(window.location.href,
                                            goal.value,
                                            goal.type);
          if (validGoalUrl) {
            campaign = new Landy(cfg.id,
                               cfg.url,
                               cfg.type,
                               cfg.subtype);

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
      xhr.setRequestHeader('Content-Type', 'application/json');
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
    // TODO: (dtsepelev) Not sure how showd it work on cross-domain
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
            applyVariation(variationInResponse);
            setCookie(userIdKey, uid, 360);
            setCookie(variationsKey, JSON.stringify(variationInResponse), 30);
          }
        });
      } else {
        var variationInCookie = JSON.parse(cookie);
        applyVariation(variationInCookie);
      }
    }
    // Check goals array and execute on success
    if (typeof goals !== 'undefined') {
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

  /* test-code */
  var api = {};
  api._doPostRequest = doPostRequest;
  api._sendSuccess = sendSuccess;
  api._setListener = setListener;
  api._getDomain = getDomain;
  api._getCookie = getCookie;
  api._generateUid = generateUid;
  api._generateIdentity = generateIdentity;
  api._unescapeHtml = unescapeHtml;
  api._zaxUrl = zaxUrl;
  api._userIdKey = userIdKey;
  api._variationsKey = variationsKey;
  api._goalsKey = goalsKey;
  api._timeStorageExpireId = timeStorageExpireId;
  this.api = api;
  /* end-test-code */
}

if (_landyCampaigns && _landyCampaigns.length > 0) {
  startLandy(_landyCampaigns);
}
