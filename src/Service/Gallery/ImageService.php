<?php

namespace App\Service\Gallery;

use Symfony\Component\HttpFoundation\StreamedResponse;

class ImageService
{
    public function __construct(private readonly string $galleryImagesDirectory)
    {}

    public function getImageGallery($file): bool|StreamedResponse
    {
        $photoPath = $this->galleryImagesDirectory . $file;
        if (!file_exists($photoPath)) {
            return false;
        }

        $response = new StreamedResponse(function () use ($photoPath) {
            readfile($photoPath);
        });

        $response->headers->set('Content-Type', 'image/jpg');
        return $response;
    }
}
