<?php

namespace App\Controller;

use App\Entity\Main\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/espace-membre', name: 'user_')]
class UserController extends AbstractController
{
    #[Route('/', name: 'homepage')]
    public function index(): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $userDirectory = $this->getParameter('private_directory') . 'gallery/' . $user->getUsername() . '/';
        if(!is_dir($userDirectory)) {
            throw $this->createNotFoundException('Le dossier n\'existe pas.');
        }
        $photoDirectory = $this->getParameter('private_directory') . 'gallery/' . $user->getUsername() . '/thumbs/';
        if(!is_dir($photoDirectory)) {
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

    #[Route('/photo/{filename}', name: 'photo_read')]
    public function photo($filename): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $photoPath = $this->getParameter('private_directory') . 'gallery/' . $user->getUsername() . '/thumbs/' . $filename;

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
