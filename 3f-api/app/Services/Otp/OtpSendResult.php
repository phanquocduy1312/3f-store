<?php
namespace App\Services\Otp;

class OtpSendResult {
    public $success;
    public $provider;
    public $messageId;
    public $rawResponse;
    public $errorMessage;

    public function __construct($success, $provider, $messageId = null, $rawResponse = null, $errorMessage = null) {
        $this->success = (bool)$success;
        $this->provider = $provider;
        $this->messageId = $messageId;
        $this->rawResponse = $rawResponse;
        $this->errorMessage = $errorMessage;
    }
}
