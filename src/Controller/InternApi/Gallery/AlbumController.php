<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\Gallery\GaAlbum;
use App\Entity\Main\User;
use App\Repository\Main\UserRepository;
use App\Service\ApiResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/intern/api/gallery/albums', name: 'intern_api_user_gallery_albums_')]
class AlbumController extends AbstractController
{
    #[Route('/archive/{id}', name: 'archive', options: ['expose' => true], methods: 'GET')]
    public function archive(GaAlbum $album, ApiResponse $apiResponse, UserRepository $repository): BinaryFileResponse|JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $file = $this->getParameter('private_directory') . "import/gallery/" . $album->getArchive() . ".zip";

        if(!file_exists($file)){
            return $apiResponse->apiJsonResponseBadRequest("Le fichier n'existe pas.");
        }

        $album->setNbDownload($album->getNbDownload() + 1);

        $repository->save($user, true);
        return $this->file($file);
    }
}
