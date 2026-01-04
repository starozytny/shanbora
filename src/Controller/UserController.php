<?php

namespace App\Controller;

use App\Entity\Main\Gallery\GaAlbum;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaAlbumRepository;
use App\Repository\Main\Gallery\GaImageRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/espace-membre', name: 'user_')]
class UserController extends AbstractController
{
    #[Route('/', name: 'homepage', options: ['expose' => true], methods: 'GET')]
    public function index(GaAlbumRepository $albumRepository, GaImageRepository $imageRepository): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $userId = $user->getId();
        $albums = $albumRepository->findBy([], ['dateAt' => 'DESC']);
        $photos = $imageRepository->findAll();

        $albums = array_filter($albums, function ($entity) use ($userId) {
            return ($entity->getCanAccess() && in_array($userId, $entity->getCanAccess())) || $entity->getUser()->getId() === $userId;
        });

        $data = []; $totalAlbums = count($albums); $totalPhotos = 0; $totalYears = 0;
        foreach($albums as $album) {
            $tmp = $data[$album->getDateAt()->format('Y')] ?? null;
            if($tmp){
                $data[$album->getDateAt()->format('Y')][] = $album;
            }else{
                $data[$album->getDateAt()->format('Y')] = [$album];
                $totalYears++;
            }
        }

        $indexPhotos = [];
        foreach($photos as $photo){
            $indexPhotos[$photo->getAlbum()->getId()][] = $photo;
            $totalPhotos++;
        }

        return $this->render('user/pages/index.html.twig', [
            'data' => $data,
            'indexPhotos' => $indexPhotos,
            'totalAlbums' => $totalAlbums,
            'totalPhotos' => $totalPhotos,
            'totalYears' => $totalYears,
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
