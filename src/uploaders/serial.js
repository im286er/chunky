(function () {
  'use strict';

  var SerialUploader = function (file, settings) {
    this.settings = settings;
    this.file = file;
    this.state = this._states.IDLE;
    this.failedChunks = 0; // Track failed chunk uploads
    this._upload;
  };

  // XXX Add an extends method
  var sp = SerialUploader.prototype = new chunky._Uploader_;

  // Check the status of a file upload by retrieving the size of the file on
  // the server
  sp.checkStatus = function (callback) {
    var xhr = new XMLHttpRequest
      , that = this;

    xhr.open('GET', this.requestURL('status'), true);
    xhr.onload = function () {
      var status;

      // upload parts
      try {
        // Attempt to get the file size from the json response body
        status = JSON.parse(this.responseText);
        that.chunkOffset = +status.filesize || 0;
      }
      catch (ex) {
        that.chunkOffset = 0;
      }

      that.state = that._states.READY;

      if (typeof callback === 'function') {
        callback.call(that);
      }
    };

    xhr.send();
  };

  sp.upload = function () {
    var chunkTo = this.chunkOffset + this.settings.chunkSize
      , chunk = this.file.slice(this.chunkOffset, chunkTo)
      , that = this;

    this.chunkOffset = chunkTo;
    this._upload = this.uploadChunk(chunk, function (result) {
      // Run callback for chunk completion if set
      if (typeof that.settings.onchunkcomplete === 'function') {
        that.settings.onchunkcomplete.call(that);
      }

      if (that.state === this._states.UPLOADING) {
        // Upload next chunk or set as complete and finish
        if (chunkTo < that.file.size) {
          that.upload();
        }
        else {
          that.state = this._states.COMPLETE;

          if (typeof that.settings.oncomplete === 'function') {
            that.settings.oncomplete.call(this);
          }
        }
      }
    });
  };

  sp.pauseUpload = function () {
    if (
      !this.settings.graceful &&
      this._upload &&
      typeof this._upload.abort === 'function'
    ) {
      this._upload.abort();
    }
  };

  // Allows settings.attempts, which default to 1 if not set,  consecutive
  // attempts before calling error handler
  sp.onError = function () {
    this.failedChunks += 1;

    // Three failed attempts for the same chunk then abort and set state
    if (this.failedChunks === (this.settings.attempts || 1)) {
      this.state = this._states.ERROR;

      if (typeof this.settings.onerror === 'function') {
        this.settings.onerror.call(this);
      }
    }
    // Retry the last chunk upload
    else {
      this.upload();
    }
  };

  // XXX Make AMD compatible
  chunky.uploaders.SerialUploader = SerialUploader;
}());
