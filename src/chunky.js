(function (ns, undefined) {
  var chunky = (ns.chunky = {})
    , uploader; 

  // creates a new chunked file uploader and returns it
  chunky.uploader = function (file, options) {
    var settings = { chunkSize: 1024 * 1024 } // default 1MB
      , setting;

    options || (options = {});

    // extend the built in settings
    for (setting in options) {
      if (options.hasOwnProperty(setting)) {
        settings[setting] = options[setting];
      }
    }

    return new uploader(file, settings);
  };

  // Uploader states
  const IDLE = 0; // The upload has not yet been started
  const UPLOADING = 1; // The upload is in progress
  const PAUSED = 2; // The upload has been paused
  const COMPLETE = 3; // The upload has completed

  // A chunked file uploader
  // 
  // Settings should contain the following server endpoints:
  //     endpoints: {
  //         status: '/path/to/status', // should return the current size of the file on disk
  //         upload: '/path/to/upload' // should save a chunk to the upload file
  //     }
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
    var xhr = new XMLHttpRequest
      , that = this;

    xhr.open('GET', this.requestURL('status'), true);
    xhr.onload = function () {
      // Attempt to get the file size from the
      try {
        status = JSON.parse(this.responseText);
        that.chunkOffset = +status.filesize || 0;
      }
      catch (ex) {
        that.chunkOffset = 0;
      }

      that.state = UPLOADING;
      that.uploadChunk();
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
    xhr.open('POST', this.requestURL('upload'), true);
    xhr.onload = function () {
      if (that.state === UPLOADING) {
        if (chunkTo < that.file.size) {
          that.uploadChunk();
        }
        else {
          that.state = FINISHED;
        }
      }
    };

    xhr.send(chunk);
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
