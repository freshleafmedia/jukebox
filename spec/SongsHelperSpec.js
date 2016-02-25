"use strict";

describe("SongsHelper", function() {
  var songHelper = require('../js/source/helpers/songs');
  var prettyTime;

  beforeEach(function() {
    prettyTime = songHelper.prettyTime;
  });

    describe("PrettyTime", function() {

        it("should be able to format seconds under 60 as just seconds", function () {
            var seconds = 30;
            var result = prettyTime(seconds);
            expect(result).toBe('30');
        });

        it("should be able to format seconds of 60 or over in minutes", function () {
            var seconds = 60;
            var result = prettyTime(seconds);
            expect(result).toBe('1:00');

            var seconds2 = 72;
            var result2 = prettyTime(seconds2);
            expect(result2).toBe('1:12');
        });

        it("should be able to format seconds of over 3600 in hours", function () {
            var seconds = 3600;
            var result = prettyTime(seconds);
            expect(result).toBe('1:00:00');

            var seconds2 = 3672;
            var result2 = prettyTime(seconds2);
            expect(result2).toBe('1:01:12');
        });

    });
});
