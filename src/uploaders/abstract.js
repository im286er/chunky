(function () {
  'use strict';

  var AbstractUploader = function () {};

  AbstractUploader.prototype = {
    // ##Uploader states
    _states: {
      IDLE: 0, // The upload is not ready to start
      READY: 1, // The request is setup ready to start the upload
      UPLOADING: 2, // The upload is in progress
      PAUSED: 3, // The upload has been paused
      COMPLETE: 4, // The upload has completed
      ERROR: 5 // The upload failed
    },

    // Gets the file upload status then start the upload.
    //
    // The request to the `status` endpoint should return a json object with
    // the filesize attribute containing the size in bytes of the file on
    // the server. If the file does not exist then 0 should be returned.
    start: function () {
      var fn = function () {
        this.state = this._states.UPLOADING;
        this.upload();
      }.bind(this);

      // Status of file upload has already been checked so start upload
      if (this.state === this._states.READY) {
        return fn();
      }

      // Check the status before starting
      this.checkStatus(fn);
    },

    uploadChunk: function (chunk, callback) {
      var xhr = new XMLHttpRequest
        , upload = xhr.upload
        , that = this;

      xhr.open('POST', this.requestURL('upload'), true);
      xhr.onload = function () {
        var response;

        if (this.status === 200) {
          if (this.responseText) {
            response = JSON.parse(this.responseText);
          }

          callback.call(that, response);
        }
        else {
          that.onError();
        }
      };
      xhr.onerror = that.onError.bind(that);

      xhr.send(chunk);
      return xhr;
    },

    pause: function () {
      this.state = this._states.PAUSED;
      this.pauseUpload;
    },

    // Returns true if this uploader is actively uploading
    isUploading: function () {
      return this.state === this._states.UPLOADING;
    },

    // Returns true if this uploader is paused
    isPaused: function () {
      return this.state === this._states.PAUSED;
    },

    // Get the endpoint url with the files name appended
    requestURL: function (endpoint) {
      var url = this.settings.endpoints[endpoint];

      if (url.indexOf('?') === -1) {
        url += '?';
      }
      else {
        url += '&';
      }

      // XXX Need to make this more generic with helper to get addtional
      // parameters for the url
      return url + 'filename=' + this.file.name;
    },

    // Default error handler,
    onError: function () {
      if (typeof this.settings.onerror === 'function') {
        this.settings.onerror.call(this);
      }
    }

    // Methods to be implemented in sub-classes
    // ---
    //
    // checkStatus(callback) => XMLHttpRequest
    // upload() => XMLHttpRequest
    // pauseUpload() => void
  };

  // XXX Make AMD compatible
  chunky._Uploader_ = AbstractUploader;
}());
