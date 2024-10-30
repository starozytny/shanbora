<?php

namespace App\Controller;

use App\Entity\Main\Gallery\GaAlbum;
use App\Repository\Main\Gallery\GaAlbumRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/espace-membre', name: 'user_')]
class UserController extends AbstractController
{
    #[Route('/', name: 'homepage')]
    public function index(GaAlbumRepository $albumRepository): Response
    {
        return $this->render('user/pages/index.html.twig', [
            'albums' => $albumRepository->findBy(['user' => $this->getUser()]),
        ]);
    }

    #[Route('/albums/{slug}', name: 'album_read')]
    public function albumRead(GaAlbum $album): Response
    {
        return $this->render('user/pages/albums/read.html.twig', [
            'album' => $album
        ]);
    }
}
