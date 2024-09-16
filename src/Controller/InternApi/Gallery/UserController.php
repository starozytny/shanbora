<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\User;
use App\Service\Gallery\GalleryService;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/intern/api/gallery', name: 'intern_api_user_gallery_')]
class UserController extends AbstractController
{
    #[Route('/fetch-images', name: 'fetch_images', options: ['expose' => true])]
    public function fetchImages(Request $request, PaginatorInterface $paginator, GalleryService $galleryService): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        return $galleryService->fetchImages($user, $request, $paginator);
    }


    #[Route('/image/{filename}', name: 'read_image', options: ['expose' => true])]
    public function read($filename, GalleryService $galleryService): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $photoDirectory = $galleryService->getUserFolderThumbs($user);
        if($photoDirectory === false) {
            throw $this->createNotFoundException('Le dossier n\'existe pas.');
        }
        $photoPath = $photoDirectory . $filename;

        if (!file_exists($photoPath)) {
            throw $this->createNotFoundException('La photo demandée n\'existe pas.');
        }

        // Renvoie le fichier sécurisé
        $response = new StreamedResponse(function () use ($photoPath) {
            readfile($photoPath);
        });

        $response->headers->set('Content-Type', 'image/jpeg'); // À ajuster selon le type de fichier
        return $response;
    }
}
