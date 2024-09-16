<?php

namespace App\Controller;

use App\Entity\Main\User;
use App\Service\Gallery\GalleryService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/espace-membre', name: 'user_')]
class UserController extends AbstractController
{
    #[Route('/', name: 'homepage')]
    public function index(GalleryService $galleryService): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $photoDirectory = $galleryService->getUserFolderThumbs($user);
        if($photoDirectory === false) {
            throw $this->createNotFoundException('Le dossier n\'existe pas.');
        }

        $finder = new Finder();
        $finder->files()->in($photoDirectory)->name('/\.(jpg|jpeg|png|gif)$/i');

        $images = [];
        foreach ($finder as $file) {
            $images[] = $file->getFilename(); // Récupère le nom des fichiers
        }

        return $this->render('user/pages/index.html.twig', [
            'images' => $images,
        ]);
    }
}
