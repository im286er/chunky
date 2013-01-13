(function (ns, undefined) {
  var chunky = (ns.chunky = {})
    , uploader; 
    

  // Chunky
  // ---

  // Creates a new chunked file uploader and returns it
  // `file` an instance of File/Blob to upload
  // `options` the uploader settings which must contain the following
  // server endpoints:
  //
  //     endpoints: {
  //       // should return the current size of 
  //       // the file on disk or 0 if the 
  //       // file does not yet exist
  //       status: '/path/to/status',
  //       // should save a chunk to the upload file
  //       upload: '/path/to/upload'
  //     }
  //
  chunky.uploader = function (file, options) {
    var settings = {
            chunkSize: 1024 * 1024 // default 1MB upload chunks
          , graceful: false // complete current chunk on pause?
        }
      , setting;

    // Extend the default settings with the user defined options
    for (setting in options) {
      if (options.hasOwnProperty(setting)) {
        settings[setting] = options[setting];
      }
    }

    return new uploader(file, settings);
  };

  // ##Uploader states
  const IDLE = 0; // The upload is not ready to start
  const READY = 1; // The request is setup ready to start the upload
  const UPLOADING = 2; // The upload is in progress
  const PAUSED = 3; // The upload has been paused
  const COMPLETE = 4; // The upload has completed

  // ##Uploader
  // 
  // Constructor for chunked file uploaders
  uploader = function (file, settings) {
    this.settings = settings;
    this.file = file;
    this.state = IDLE;
  };

  cup = uploader.prototype;

  // Get the file upload status then start the upload.
  //
  // The request to the `status` endpoint should return a json object with the
  // filesize attribute containing the size in bytes of the file on the server.
  // If the file does not exist then 0 should be returned.
  cup.start = function () {
    var fn = function () {
      this.state = UPLOADING;
      this.uploadChunk();
    };

    if (this.state === READY) {
      return fn.call(this);
    }

    this.checkStatus(fn);
  };

  // Check the status of a file upload by retrieving the size of the file on
  // the server
  cup.checkStatus = function (callback) {
    var xhr = new XMLHttpRequest
      , that = this;

    xhr.open('GET', this.requestURL('status'), true);
    xhr.onload = function () {
      var status;

      try {
        // Attempt to get the file size from the json response body
        status = JSON.parse(this.responseText);
        that.chunkOffset = +status.filesize || 0;
      }
      catch (ex) {
        that.chunkOffset = 0;
      }

      that.state = READY;
      
      if (callback) {
        callback.call(that);
      } 
    };

    xhr.send();
  };

  // Start the upload process
  cup.uploadChunk = function () {
    var xhr = new XMLHttpRequest
      , chunkTo = this.chunkOffset + this.settings.chunkSize
      , chunk = this.file.slice(this.chunkOffset, chunkTo)
      , that = this;

    this.chunkOffset = chunkTo;
    this._upload = xhr;

    xhr.open('POST', this.requestURL('upload'), true);
    xhr.onload = function () {
      // Run callback for chunk completion if set
      if (typeof that.settings.onchunkcomplete === 'function') {
        that.settings.onchunkcomplete.call(that);
      }

      if (that.state === UPLOADING) {
        // Upload next chunk or set as complete and finish
        if (chunkTo < that.file.size) {
          that.uploadChunk();
        }
        else {
          that.state = COMPLETE;
        }
      }
    };

    xhr.send(chunk);
  };

  cup.pause = function () {
    this.state = PAUSED;

    // abort current chunk
    if (
      !this.settings.graceful &&
      this._upload &&
      typeof this._upload.abort === 'function'
    ) {
      this._upload.abort(); 
    }
  };

  // Get the endpoint url with the files name appended
  cup.requestURL = function (endpoint) {
    var url = this.settings.endpoints[endpoint];
    
    if (url.indexOf('?') === -1) {
      url += '?';
    }
    else {
      url += '&';
    }

    return url + 'filename=' + this.file.name;
  };

}(this));
