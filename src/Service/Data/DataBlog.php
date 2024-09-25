<?php

namespace App\Service\Data;

use App\Entity\Blog\BoCommentary;
use App\Service\SanitizeData;

class DataBlog
{
    public function __construct(
        private readonly SanitizeData $sanitizeData
    ) {}

    public function setDataCommentary(BoCommentary $obj, $data): BoCommentary
    {
        return ($obj)
            ->setAdventureId((int) $data->adventureId)
            ->setUsername($this->sanitizeData->trimData($data->username))
            ->setMessage($this->sanitizeData->trimData($data->message))
        ;
    }
}
