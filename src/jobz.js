(function () {
  'use strict';

  var Job = function (settings) {
    // url =>
    // type =>
    // dataType =>
    this.settings = settings;
    this._doneCallbacks = [];
    this._failCallbacks = [];
  };

  Job.prototype = {
    run: function () {
      this.settings.success = this._onDone.bind(this);
      this.settings.error = this._onFail.bind(this);
      $xhr.ajax(this.settings);
    },

    done: function (fn) {
      this._doneCallbacks.push(fn);
    },

    fail: function (fn) {
      this._failCallbacks.push(fn);
    },

    _onDone: function (response) {
      this._doneCallbacks.forEach(function (fn) {
        fn(response);
      });
    },

    _onFail: function () {
      this._doneCallbacks.forEach(function (fn) {
        fn.apply(void 0, arguments);
      });
    }
  };

  var Jobz = function (settings) {
    this.settings = settings || {
      concurrency: 5 // The number of allowed concurrent jobz
    };
    this._buffer = []; // Jobs to be run
    this._runningJobCount = 0; // Number of jobs currently running
    this.isRunning = true; // flag for start/stopping the queue
  };

  Jobz.prototype = {
    add: function (settings) {
      var job = new Job(settings);
      this._buffer.unshift(job);
      this.next();

      return job;
    },

    next: function () {
      var job;

      if (this.isRunning) {
        while (this._hasSlotAvailable() && (job = this._buffer.pop())) {
          this._runningJobCount += 1;
          job.done(this._onJobComplete.bind(this));
          job.fail(this._onJobFailed.bind(this));
          job.run();
        }
      }
    },

    stop: function () {
      this.isRunning = false;
    },

    start: function () {
      this.isRunning = true;
      this.next();
    },

    _hasSlotAvailable: function () {
       return this._runningJobCount < this.settings.concurrency;
    },

    _onJobComplete: function () {
      this._runningJobCount -= 1;
      this.next();
    },

    _onJobFailed: function () {
      this._runningJobCount -= 1;
      // XXX Check job and re-try?
      this.next();
    }
  };

  // XXX AMD
  window.Jobz = {
    createQueue: function (settings) {
      return new Jobz(settings);
    }
  };
}());
