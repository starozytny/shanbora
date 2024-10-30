<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\Gallery\GaAlbum;
use App\Repository\Main\Gallery\GaAlbumRepository;
use App\Service\ApiResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/intern/api/gallery/albums', name: 'intern_api_user_gallery_albums_')]
class AlbumController extends AbstractController
{
    #[Route('/archive/{id}', name: 'archive', options: ['expose' => true], methods: 'GET')]
    public function archive(GaAlbum $album, ApiResponse $apiResponse, GaAlbumRepository $repository): BinaryFileResponse|JsonResponse
    {
        $file = $this->getParameter('gallery_archive_directory') . $album->getUser()->getUsername() . "/" . $album->getArchive() . ".zip";

        if(!file_exists($file)){
            return $apiResponse->apiJsonResponseBadRequest("Le fichier n'existe pas.");
        }

        $album->setNbDownload($album->getNbDownload() + 1);

        $repository->save($album, true);
        return $this->file($file);
    }
}
