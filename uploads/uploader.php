<?php

class Uploader {

  public function __construct () {

  }

  public function get_pointer ($filename) {
    return fopen($filename, 'a+');
  }

  public function upload_chunk ($filename, $chunk) {
    $handle = $this->get_pointer($filename);
    fwrite($handle, $chunk);
    fclose($handle);
  }

  public function status ($filename) {
    $stat = stat($filename);
    
    if ($stat) {
      return $stat['size'];
    }

    return 0;
  }
}

$uploader = new Uploader();

if (array_key_exists('status', $_GET)) {
  echo '{"filesize": ' . $uploader->status($_GET['filename']) . '}'; 
}

if (array_key_exists('upload_chunk', $_GET)) {
  $chunk = file_get_contents('php://input');
  $uploader->upload_chunk($_GET['filename'], $chunk);
}
