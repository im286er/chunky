(function (ns) {

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
  ns.chunky = {
    upload: function (file, options) {
      var settings = {
              chunkSize: 1024 * 1024 // default 1MB upload chunks
            , graceful: false // complete current chunk on pause?
            , uploader: 'SerialUploader'
          }
        , setting;

      // Extend the default settings with the user defined options
      for (setting in options) {
        if (options.hasOwnProperty(setting)) {
          settings[setting] = options[setting];
        }
      }

      return new this.uploaders[settings.uploader](file, settings);
    },

    uploaders: {}
  };

}(this));
