<?php

namespace App\Service\Data;

use App\Entity\Main\Gallery\GaAlbum;
use App\Service\SanitizeData;

class DataGallery
{
    public function __construct(
        private readonly SanitizeData $sanitizeData
    ) {}

    public function setDataAlbum(GaAlbum $obj, $data): GaAlbum
    {
        $title = $this->sanitizeData->trimData($data->title);

        return ($obj)
            ->setTitle($title)
            ->setSlug($this->sanitizeData->slugString($title))
            ->setDateAt($this->sanitizeData->createDate($data->dateAt))
            ->setCanAccess($data->canAccess)
        ;
    }
}
