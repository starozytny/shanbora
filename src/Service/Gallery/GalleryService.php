<?php

namespace App\Service\Gallery;

use App\Entity\Main\User;
use App\Service\ApiResponse;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class GalleryService
{
    const FOLDER = "gallery/";

    public function __construct(private readonly string $privateDirectory, private readonly ApiResponse $apiResponse)
    {
    }

    private function getUserFolderGallery(User $user): bool|string
    {
        $userDirectory = $this->privateDirectory . self::FOLDER . $user->getUsername() . '/';
        if(!is_dir($userDirectory)) {
            return false;
        }

        return $userDirectory;
    }

    public function getUserFolderThumbs(User $user): bool|string
    {
        return $this->getUserFolderGallery($user) . 'thumbs/';
    }

    public function fetchImages(User $user, Request $request, PaginatorInterface $paginator): JsonResponse
    {
        $photoDirectory = $this->getUserFolderThumbs($user);
        if($photoDirectory === false){
            return $this->apiResponse->apiJsonResponseBadRequest('Le dossier n\'existe pas.');
        }

        $finder = new Finder();
        $finder->files()->in($photoDirectory)->name('/\.(jpg|jpeg|png|gif)$/i');

        $images = [];
        foreach ($finder as $file) {
            $images[] = $file->getFilename();
        }

        // Pagination
        $page = $request->query->getInt('page', 1);
        $pagination = $paginator->paginate(
            $images, // Les images récupérées
            $page,   // La page actuelle
            20      // Nombre d'images par page
        );

        return new JsonResponse([
            'images' => $pagination->getItems(),
            'hasMore' => $pagination->getCurrentPageNumber() < $pagination->getPageCount(),
        ]);
    }
}
