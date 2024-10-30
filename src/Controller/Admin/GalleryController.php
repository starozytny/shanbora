<?php

namespace App\Controller\Admin;

use App\Entity\Main\Gallery\GaAlbum;
use App\Repository\Main\Gallery\GaAlbumRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/galeries', name: 'admin_galleries_')]
class GalleryController extends AbstractController
{
    #[Route('/', name: 'index', options: ['expose' => true])]
    public function index(GaAlbumRepository $repository): Response
    {
        return $this->render('admin/pages/gallery/index.html.twig', [
            'albums' => $repository->findAll(),
        ]);
    }

    #[Route('/galerie/{id}', name: 'read', options: ['expose' => true])]
    public function read(GaAlbum $album): Response
    {
        return $this->render('admin/pages/gallery/read.html.twig', [
            'album' => $album
        ]);
    }
}
