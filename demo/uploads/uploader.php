<?php

// A very basic server implementation for use with chunky.js
class Uploader {
  // Upload a chunk of data to the file
  public function upload_chunk ($filename, $chunk) {
    $handle = fopen(basename($filename), 'a+');

    if ($handle) {
      fwrite($handle, $chunk);
      return fclose($handle);
    }

    throw new Exception('Failed to open file for writing');
  }

  // Return the status of the file upload, basically the size
  // of the file at this point
  public function status ($filename) {
    $stat = stat($filename);
    
    // File exists so return it's size
    if ($stat) {
      return $stat['size'];
    }

    // Start from beginning of file
    return 0;
  }
}


$uploader = new Uploader();

// get the current file size
if (array_key_exists('status', $_GET)) {
  header('Content-Type: application/json');
  echo '{"filesize": ' . $uploader->status($_GET['filename']) . '}'; 
  exit();
}
// add a chunk of data to the upload file
if (array_key_exists('upload_chunk', $_GET)) {
  $chunk = file_get_contents('php://input');
  $uploader->upload_chunk($_GET['filename'], $chunk);
}
