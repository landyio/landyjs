/* eslint func-names: 0 */

describe('landy.js', function() {
  /* global landyParseUrl */

  describe('landyParseUrl', function() {
    it('returns proper url parsed object', function() {
      var url = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var parsedUrl = landyParseUrl(url);
      expect(parsedUrl.protocol).toEqual('http:');
      expect(parsedUrl.host).toEqual('www.landy.io:9000');
      expect(parsedUrl.hostname).toEqual('landy.io');
      expect(parsedUrl.port).toEqual('9000');
      expect(parsedUrl.pathname).toEqual('/secret/index.html');
      expect(parsedUrl.search).toEqual('?ad=doge');
      expect(parsedUrl.hash).toEqual('#kush');
    });

    it('returns proper url without slash parsed object', function() {
      var url = 'http://landy.io?ad=doge#kush';
      var parsedUrl = landyParseUrl(url);
      expect(parsedUrl.protocol).toEqual('http:');
      expect(parsedUrl.host).toEqual('landy.io');
      expect(parsedUrl.hostname).toEqual('landy.io');
      expect(parsedUrl.port).not.toBeDefined();
      expect(parsedUrl.pathname).toEqual('');
      expect(parsedUrl.search).toEqual('?ad=doge');
      expect(parsedUrl.hash).toEqual('#kush');
    });
  });

  describe('landyCheckUrls', function() {
    /* global landyCheckUrls */
    it('matches urls in contains mode', function() {
      var url1 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var url2 = 'landy.io:9000/secret';
      var type = 'contains';
      expect(landyCheckUrls(url1, url2, type)).toBe(true);
    });

    it('matches urls in contains mode with trailing slash in location', function() {
      var url1 = 'http://www.landy.io';
      var url2 = 'http://www.landy.io/';
      var type = 'contains';
      expect(landyCheckUrls(url1, url2, type)).toBe(true);
    });

    it('fails urls in contains mode', function() {
      var url1 = 'landy.io/secret';
      var url2 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var type = 'contains';
      expect(landyCheckUrls(url1, url2, type)).toBe(false);
    });

    it('matches urls in matches mode', function() {
      var url1 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var url2 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var type = 'matches';
      expect(landyCheckUrls(url1, url2, type)).toBe(true);
    });

    it('fails urls in matches mode', function() {
      var url1 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var url2 = 'http://www.landy.io:9000/secet/index.html?ad=doge#kush';
      var type = 'matches';
      expect(landyCheckUrls(url1, url2, type)).toBe(false);
    });

    it('matches complex urls in simple match mode', function() {
      var url1 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var url2 = 'https://landy.io:3333/secret/index.html';
      var type = 'simpleMatch';
      expect(landyCheckUrls(url1, url2, type)).toBe(true);
    });

    it('matches urls with trailing slash after domain in simple match mode', function() {
      var url1 = 'http://www.landy.io:9000/';
      var url2 = 'http://www.landy.io:9000';
      var type = 'simpleMatch';
      expect(landyCheckUrls(url1, url2, type)).toBe(true);
    });

    it('matches urls with trailing slash after path in simple match mode', function() {
      var url1 = 'http://www.landy.io:9000/the/super/path/';
      var url2 = 'https://www.landy.io:9000/the/super/path';
      var type = 'simpleMatch';
      expect(landyCheckUrls(url1, url2, type)).toBe(true);
    });

    it('matches urls with trailing slash after path and search in simple match mode', function() {
      var url1 = 'http://www.landy.io:9000/the/super/path/?q=foo';
      var url2 = 'https://www.landy.io:9000/the/super/path?q=foo';
      var type = 'simpleMatch';
      expect(landyCheckUrls(url1, url2, type)).toBe(true);
    });

    it('fails urls in simple match mode', function() {
      var url1 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var url2 = 'https://www.landy.io:3333/secet/index.html';
      var type = 'simpleMatch';
      expect(landyCheckUrls(url1, url2, type)).toBe(false);
    });

    it('fails with wrong url in simple match mode', function() {
      var url1 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var url2 = 'landy.io:3333/secet/index.html';
      var type = 'simpleMatch';
      expect(landyCheckUrls(url1, url2, type)).toBe(false);
    });

    it('fails with wrong mode', function() {
      var url1 = 'http://www.landy.io:9000/secret/index.html?ad=doge#kush';
      var url2 = 'https://www.landy.io:3333/secet/index.html';
      var type = 'wrongMode';
      expect(landyCheckUrls(url1, url2, type)).toBe(false);
    });
  });

  describe('Landy', function() {
    /* global Landy, fooCampaign */

    describe('init', function() {
      describe('on wrong url', function() {
        var requestOnWrongUrl;
        var data;
        var campaign;

        beforeAll(function() {
          localStorage.clear();
          jasmine.Ajax.install();
          data = {
            goals: [],
            modelId: '1146c3cc98ffed3bc271ff15',
            user: 'b9nHJ3H7fWFKbC98q',
            type: 'ab',
            subtype: 'contains',
            'url': 'http://wrongurl.com'
          };
          campaign = new Landy(data.modelId,
            data.url,
            data.type,
            data.subtype,
            data.goals);

          campaign.init();

          requestOnWrongUrl = jasmine
            .Ajax
            .requests
            .mostRecent();
        });

        afterAll(function() {
          jasmine.Ajax.uninstall();
        });

        it('should not make post request to predict url', function() {
          expect(requestOnWrongUrl).not.toBeDefined();
        });


        describe('should properly apply', function() {
          it('changes to html content', function() {
            var selector = ':nth-child(2) > :nth-child(1) > h1';
            var h1Content = $(selector).html();
            expect(h1Content.indexOf('Tool<br> or not to tool')).toBe(-1);
          });

          it('background-color style', function() {
            var selector = 'body > :nth-child(2) > :nth-child(1) > a';
            var buttonColor = $(selector).css('background-color');
            expect(buttonColor).not.toEqual('rgb(136, 136, 136)');
          });

          it('display style', function() {
            var selector = 'main > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > img';
            var imageDisplay = $(selector).css('display');
            expect(imageDisplay).not.toEqual('none');
          });

          it('changes to huge html content block', function() {
            var selector = ':nth-child(7) > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1)';
            var question = $(selector).html();
            expect(question).not.toEqual('Who kill Kenny?');
          });

          it('attribute changes to input', function() {
            var selector = ':nth-child(2) > input';
            var input = $(selector).attr('value');
            expect(input).not.toEqual('Create or not to create');
          });

          it('new class to element', function() {
            var selector = 'main > :nth-child(1) > :nth-child(1) > h2';
            var input = $(selector).attr('class');
            expect(input).not.toEqual('h1');
          });
        });
      });


      describe('on correct url in ab campaign', function() {
        /* global zaxResponses, abResponseText */
        var requestOnCorrectUrl;
        var api;
        var uid;
        var data;
        var campaign;
        var predictUrl;

        beforeAll(function() {
          localStorage.clear();
          jasmine.Ajax.install();

          data = {
            goals: [],
            modelId: '1146c3cc98ffed3bc271ff15',
            user: 'b9nHJ3H7fWFKbC98q',
            type: 'ab',
            subtype: 'contains',
            'url': 'http://0.0.0.0:9001/_SpecRunner.html'
          };
          campaign = new Landy(data.modelId,
            data.url,
            data.type,
            data.subtype,
            data.goals);

          campaign.init();
          api = campaign.api;

          predictUrl = api._zaxUrl +
            '/app/' +
            data.modelId +
            '/event/predict';

          requestOnCorrectUrl = jasmine
            .Ajax
            .requests
            .mostRecent();

          requestOnCorrectUrl.respondWith(zaxResponses.predict.ab);

          uid = requestOnCorrectUrl.data().session;
        });

        afterAll(function() {
          jasmine.Ajax.uninstall();
        });

        it('should make post requestOnCorrectUrl to predict url', function() {
          expect(requestOnCorrectUrl.url).toBe(predictUrl);
          expect(requestOnCorrectUrl.method).toBe('POST');
        });


        it('should send proper request body', function() {
          var body = requestOnCorrectUrl.data();
          expect(typeof (body.identity)).toEqual('object');
          expect(body.identity.browser).toEqual('PhantomJS');
          expect(typeof (body.timestamp)).toEqual('number');
          expect(uid.length).toEqual(36);
        });

        describe('should properly apply', function() {
          it('changes to html content', function() {
            var selector = ':nth-child(2) > :nth-child(1) > h1';
            var h1Content = $(selector).html();
            expect(h1Content.indexOf('Tool<br> or not to tool')).not.toBe(-1);
          });

          it('background-color style', function() {
            var selector = 'body > :nth-child(2) > :nth-child(1) > a';
            var buttonColor = $(selector).css('background-color');
            expect(buttonColor).toEqual('rgb(136, 136, 136)');
          });

          it('display style', function() {
            var selector = 'main > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1) > img';
            var imageDisplay = $(selector).css('display');
            expect(imageDisplay).toEqual('none');
          });

          it('changes to huge html content block', function() {
            var selector = ':nth-child(7) > :nth-child(1) > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(1)';
            var question = $(selector).html();
            expect(question).toEqual('Who kill Kenny?');
          });

          it('attribute changes to input', function() {
            var selector = ':nth-child(2) > input';
            var input = $(selector).attr('value');
            expect(input).toEqual('Create or not to create');
          });

          it('new class to element', function() {
            var selector = 'main > :nth-child(1) > :nth-child(1) > h2';
            var input = $(selector).attr('class');
            expect(input).toEqual('h1');
          });
        });

        describe('should set cookies', function() {
          it('with variations', function() {
            var variation = JSON.parse(api._getCookie(api._variationsKey));
            var originalVariation = JSON.parse(abResponseText.variation.value);
            expect(variation).toEqual(originalVariation.elements);
          });

          it('with landy uid', function() {
            var landyUID = api._getCookie(api._userIdKey);
            expect(landyUID).toBeDefined(uid);
          });
        });
      });

      describe('on correct url should make post requestOnSuccess to finish endpoint', function() {
        /* global deleteCookie */
        var requestOnSuccess;
        var api;
        var data;
        var campaign;
        var finishUrl;

        beforeAll(function() {
          jasmine.Ajax.install();
          data = {
            goals: [{
              'event': 'visit',
              'value': 'http://0.0.0.0:9001/_SpecRunner.html',
              'type': 'contains'
            }],
            modelId: '1146c3cc98ffed3bc271ff15',
            user: 'b9nHJ3H7fWFKbC98q',
            type: 'ab',
            subtype: 'contains',
            url: 'http://wrongurl.com'
          };
          campaign = new Landy(data.modelId,
            data.url,
            data.type,
            data.subtype,
            data.goals);

          campaign.init();
          api = campaign.api;

          finishUrl = api._zaxUrl +
            '/app/' +
            data.modelId +
            '/event/finish';

          requestOnSuccess = jasmine
            .Ajax
            .requests
            .mostRecent();

          requestOnSuccess.respondWith(zaxResponses.finish);
        });

        afterAll(function() {
          jasmine.Ajax.uninstall();
          var successCookie = api._goalsKey + data.modelId;
          deleteCookie(successCookie);
        });

        it('on visiting url', function() {
          expect(requestOnSuccess.url).toEqual(finishUrl);
          expect(requestOnSuccess.method).toBe('POST');
        });
      });

      // TODO: (dtsepelev) Fix on click goal test. Have no idea
      // why it does not work
      xdescribe('should make post requestOnSuccess to finish endpoint', function() {
        /* global clickGoal, clickElement */
        var requestOnSuccess;
        var api;
        var campaign;
        var finishUrl;
        var data;

        beforeAll(function() {
          jasmine.Ajax.install();
          data = {
            goals: [{
              'event': 'click',
              'value': ':nth-child(2) > :nth-child(1) > h1',
              'type': 'contains'
            }],
            modelId: '1146c3cc98ffed3bc271ff15',
            user: 'b9nHJ3H7fWFKbC98q',
            type: 'ab',
            subtype: 'contains',
            url: 'http://wrongurl.com'
          };
          campaign = new Landy(data.modelId,
            data.url,
            data.type,
            data.subtype,
            data.goals);

          campaign.init();
          api = campaign.api;

          finishUrl = api._zaxUrl +
            '/app/' +
            data.modelId +
            '/event/finish';

          var selector = data.goals[0].value;
          var el = document.querySelector(selector);
          clickElement(el);

          requestOnSuccess = jasmine
            .Ajax
            .requests
            .mostRecent();

          requestOnSuccess.respondWith(zaxResponses.finish);
        });

        afterAll(function() {
          jasmine.Ajax.uninstall();
          var successCookie = api._goalsKey + data.modelId;
          deleteCookie(successCookie);
        });

        it('on visiting url', function() {
          expect(requestOnSuccess.url).toEqual(finishUrl);
          expect(requestOnSuccess.method).toBe('POST');
        });
      });

      describe('on correct url in split campaign', function() {
        /* global zaxResponses, splitResponseText */
        var requestOnCorrectUrl;
        var api;
        var uid;
        var data;
        var campaign;
        var predictUrl;

        beforeAll(function() {
          localStorage.clear();
          jasmine.Ajax.install();
          data = {
            goals: [],
            modelId: '1146c3cc98ffed3bc271ff16',
            user: 'b9nHJ3H7fWFKbC98q',
            type: 'split',
            subtype: 'contains',
            url: 'http://0.0.0.0:9001/_SpecRunner.html'
          };
          campaign = new Landy(data.modelId,
            data.url,
            data.type,
            data.subtype,
            data.goals);

          campaign.init();
          api = campaign.api;

          predictUrl = api._zaxUrl +
            '/app/' +
            data.modelId +
            '/event/predict';

          requestOnCorrectUrl = jasmine
            .Ajax
            .requests
            .mostRecent();

          requestOnCorrectUrl.respondWith(zaxResponses.predict.split);

          uid = requestOnCorrectUrl.data().session;
        });

        afterAll(function() {
          jasmine.Ajax.uninstall();
        });

        it('should make post requestOnCorrectUrl to predict url', function() {
          expect(requestOnCorrectUrl.url).toBe(predictUrl);
          expect(requestOnCorrectUrl.method).toBe('POST');
        });

        it('should change window location', function() {
          var redirectUrl = JSON.parse(splitResponseText.variation.value);
          expect(window.location.href).toEqual(redirectUrl.url);
        });

        describe('should set cookies', function() {
          it('with variations', function() {
            var variation = JSON.parse(api._getCookie(api._variationsKey));
            var originalVariation = JSON.parse(splitResponseText.variation.value);
            expect(variation).toEqual(originalVariation);
          });

          it('with landy uid', function() {
            var landyUID = api._getCookie(api._userIdKey);
            expect(landyUID).toBeDefined(uid);
          });
        });
      });
    });
  });
});
