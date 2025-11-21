<?php

namespace App\Controller;

use App\Entity\Main\Gallery\GaAlbum;
use App\Entity\Main\User;
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
        /** @var User $user */
        $user = $this->getUser();

        $userId = $user->getId();
        $albums = $albumRepository->findBy([], ['dateAt' => 'DESC']);

        return $this->render('user/pages/index.html.twig', [
            'albums' => array_filter($albums, function ($entity) use ($userId) {
                return ($entity->getCanAccess() && in_array($userId, $entity->getCanAccess())) || $entity->getUser()->getId() === $userId;
            })
        ]);
    }

    #[Route('/albums/{slug}', name: 'album_read')]
    public function albumRead(GaAlbum $album): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if($album->getUser()->getId() != $user->getId()) {
            if(!$album->getCanAccess() || !in_array($user->getId(), $album->getCanAccess())){
                throw $this->createNotFoundException('Cette page n\'existe pas');
            }
        }

        return $this->render('user/pages/albums/read.html.twig', [
            'album' => $album
        ]);
    }
}
