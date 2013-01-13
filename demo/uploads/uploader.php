<?php

sleep(1); // FIXME

// A very basic server implementation for use with chunky.js

class Uploader {
  // Returns a handle on the file with the pointer set to the end 
  public function get_pointer ($filename) {
    return fopen(basename($filename), 'a+');
  }

  // Upload a chunk of data to the file
  public function upload_chunk ($filename, $chunk) {
    $handle = $this->get_pointer($filename);

    fwrite($handle, $chunk);
    fclose($handle);
  }

  // Return the status of the file upload, basically the size
  // of the file at this point
  public function status ($filename) {
    $stat = stat($filename);
    
    if ($stat) {
      return $stat['size'];
    }

    return 0;
  }
}


$uploader = new Uploader();

// get the current file size
if (array_key_exists('status', $_GET)) {
  echo '{"filesize": ' . $uploader->status($_GET['filename']) . '}'; 
}

// add a chunk of data to the upload file
if (array_key_exists('upload_chunk', $_GET)) {
  $chunk = file_get_contents('php://input');
  $uploader->upload_chunk($_GET['filename'], $chunk);
}
