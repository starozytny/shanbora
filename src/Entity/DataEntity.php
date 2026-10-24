<?php

namespace App\Entity;

class DataEntity
{
    public function getFileOrDefault($file, $folder, $default = "/placeholders/placeholder.jpg")
    {
        return $file ? "/" . $folder . "/" . $file : $default;
    }

    /**
     * encrypt or decrypt
     *
     * @param $action
     * @param $data
     * @return false|string|void
     */
    public function crypt($action, $data)
    {
        if($data == null || $data == ""){
            return $data;
        }

        $data = trim($data);
        $data = preg_replace('/\s+/', '', $data);

        $method = 'aes-256-cbc';
        $passBank = $_ENV['APP_CRYPT_KEY'] ?? null;
        if (!$passBank) {
            throw new \RuntimeException('APP_CRYPT_KEY environment variable is not configured.');
        }
        $passBank = substr(hash('sha256', $passBank, true), 0, 32);
        $ivLength = openssl_cipher_iv_length($method);

        if ($action == 'encrypt') {
            $iv = random_bytes($ivLength);
            $encrypted = openssl_encrypt($data, $method, $passBank, OPENSSL_RAW_DATA, $iv);
            return base64_encode($iv . $encrypted);
        } elseif ($action == 'decrypt') {
            $raw = base64_decode($data);
            $iv = substr($raw, 0, $ivLength);
            $encrypted = substr($raw, $ivLength);
            return openssl_decrypt($encrypted, $method, $passBank, OPENSSL_RAW_DATA, $iv);
        }
    }
}
