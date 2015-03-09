(function () {
  'use strict';

  var Uploader = function (file, settings) {
    this.settings = settings;
    this.file = file;
    this.state = Uploader.states.IDLE;
    this.jobQueue = Jobz.createQueue({ concurrency: 4 }); // XXX AMD
  };

  Uploader.states = {
    IDLE: 0, // The upload is not ready to start
    READY: 1, // The request is setup ready to start the upload
    UPLOADING: 2, // The upload is in progress
    PAUSED: 3, // The upload has been paused
    COMPLETE: 4, // The upload has completed
    ERROR: 5 // The upload failed
  };

  Uploader.prototype = {
    // Gets the file upload status then start the upload.
    //
    // The request to the `status` endpoint should return a json object with
    // the filesize attribute containing the size in bytes of the file on
    // the server. If the file does not exist then 0 should be returned.
    start: function () {
      var fn = function () {
        this.state = Uploader.states.UPLOADING;
        this.upload();
      }.bind(this);

      // Status of file upload has already been checked so start upload
      if (this.state === Uploader.states.READY) {
        return fn();
      }

      // Check the status before starting
      this.checkStatus(fn);
    },

    checkStatus: function (callback) {
      var job = this.jobQueue.add({
        type: 'get',
        url: this.requestURL('status')
      });

      job.done(function (status) {
        this.state = Uploader.states.READY;

        if (typeof callback === 'function') {
          callback.call(this, status);
        }
      }.bind(this));
    },

    upload: function () {
      var totalParts = Math.ceil(this.file.size / this.settings.chunkSize)
        , i = 0
        , start
        , stop;

      for (; i < totalParts; i++) {
        start = i * this.settings.chunkSize;

        if (i === totalParts - 1) {
          stop = this.file.size;
        }
        else {
          stop = start + this.settings.chunkSize;
        }

        this.uploadChunk(this.file.slice(start, stop), {
          part: i,
          total: totalParts
        });
      }
    },

    uploadChunk: function (chunk, params) {
      var job = this.jobQueue.add({
        url: this.requestURL('upload', params),
        type: 'post',
        data: chunk
      });

      job.done(function (result) {
        if (typeof this.settings.onchunkcomplete === 'function') {
          this.settings.onchunkcomplete.call(this, chunk.size);
        }
      }.bind(this));

      job.fail(this.onError.bind(this));
    },

    pause: function () {
      this.state = Uploader.states.PAUSED;
      this.jobQueue.stop();
    },

    play: function () {
      this.state = Uploader.states.UPLOADING;
      this.jobQueue.start();
    },

    // Returns true if this uploader is actively uploading
    isUploading: function () {
      return this.state === Uploader.states.UPLOADING;
    },

    // Returns true if this uploader is paused
    isPaused: function () {
      return this.state === Uploader.states.PAUSED;
    },

    // Get the endpoint url with the files name appended
    requestURL: function (endpoint, params) {
      var url = this.settings.endpoints[endpoint].replace(/(?:\?|&)\s*$/, '');

      if (url.indexOf('?') === -1) {
        url += '?';
      }
      else {
        url += '&';
      }

      params = this.requestParameters(endpoint, params || {});
      params.filename = this.file.name;
      return url + this.serialize(params);
    },

    serialize: function (params) {
      var param
        , tokens = [];

      for (param in params) {
        if (params.hasOwnProperty(param)) {
          tokens.push(param + '=' + params[param]);
        }
      }

      return tokens.join('&');
    },

    requestParameters: function (endpoint, params) {
      return params;
    },

    // Default error handler,
    onError: function () {
      if (typeof this.settings.onerror === 'function') {
        this.settings.onerror.call(this);
      }
    }
  };

  chunky.Uploader = Uploader; // XXX AMD
}());
