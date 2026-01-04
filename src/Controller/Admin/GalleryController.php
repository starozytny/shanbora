<?php

namespace App\Controller\Admin;

use App\Entity\Main\Gallery\GaAlbum;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaAlbumRepository;
use App\Repository\Main\Gallery\GaImageRepository;
use App\Repository\Main\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/admin/galeries', name: 'admin_galleries_')]
class GalleryController extends AbstractController
{
    #[Route('/', name: 'index', options: ['expose' => true])]
    public function index(GaAlbumRepository $repository, GaImageRepository $imageRepository): Response
    {
        $albums = $repository->findBy([], ['dateAt' => 'DESC']);
        $photos = $imageRepository->findAll();

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

        return $this->render('admin/pages/gallery/index.html.twig', [
            'data' => $data,
            'indexPhotos' => $indexPhotos,
            'totalAlbums' => $totalAlbums,
            'totalPhotos' => $totalPhotos,
            'totalYears' => $totalYears,
        ]);
    }

    #[Route('/galerie/{id}', name: 'read', options: ['expose' => true])]
    public function read(GaAlbum $album): Response
    {
        return $this->render('admin/pages/gallery/read.html.twig', [
            'album' => $album
        ]);
    }

    #[Route('/galerie/modifier/{id}', name: 'update', options: ['expose' => true])]
    public function update(GaAlbum $elem, SerializerInterface $serializer, UserRepository $userRepository): Response
    {
        $obj = $serializer->serialize($elem, 'json', ['groups' => GaAlbum::FORM]);
        $itemsUsers = $serializer->serialize($userRepository->findAll(), 'json', ['groups' => User::SELECT]);

        return $this->render('admin/pages/gallery/update.html.twig', [
            'elem' => $elem,
            'itemsUsers' => $itemsUsers,
            'obj' => $obj
        ]);
    }
}
