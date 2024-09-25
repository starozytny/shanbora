<?php

namespace App\Controller\Admin;

use App\Repository\Main\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/galeries', name: 'admin_galleries_')]
class GalleryController extends AbstractController
{
    #[Route('/', name: 'index', options: ['expose' => true])]
    public function index(UserRepository $userRepository): Response
    {
        return $this->render('admin/pages/gallery/index.html.twig', [
            'users' => $userRepository->findAll(),
        ]);
    }
    #[Route('/galerie/{userId}', name: 'read', options: ['expose' => true])]
    public function read($userId, UserRepository $userRepository): Response
    {
        $user = $userRepository->find($userId);

        return $this->render('admin/pages/gallery/read.html.twig', [
            'user' => $user,
            'userId' => $userId,
        ]);
    }
}
