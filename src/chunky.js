(function (ns, undefined) {
  var chunky = (ns.chunky = {})
    , uploader; 


  // creates a new chunked file uploader and returns it
  chunky.uploader = function (file, options) {
    var settings = { chunkSize: 10 }
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

  // A chunked file uploader
  uploader = function (file, settings) {
    this.settings = settings;
    this.file = file;
  };

  cup = uploader.prototype;

  cup.start = function () {
    var xhr = new XMLHttpRequest
      , that = this;

    xhr.open('GET', this.settings.endpoints.status + '&filename=' + this.file.name, true);
    xhr.onload = function () {
      status = JSON.parse(this.responseText);
      that.chunkOffset = status.filesize || 0;
      that.uploadChunk();
    };

    xhr.send();
  };

  cup.uploadChunk = function () {
    var xhr = new XMLHttpRequest
      , chunkTo = this.chunkOffset + this.settings.chunkSize
      , chunk = this.file.slice(this.chunkOffset, chunkTo)
      , that = this;

    this.chunkOffset = chunkTo;
    xhr.open('POST', this.settings.endpoints.upload + '&filename=' + this.file.name, true);
    xhr.onload = function () {
      if (chunkTo < that.file.size) {
        that.uploadChunk();
      }
    };

    xhr.send(chunk);
  };

}(this));
