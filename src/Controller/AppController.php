<?php

namespace App\Controller;

use App\Repository\Blog\BoViewRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AppController extends AbstractController
{
    #[Route('/', name: 'app_homepage')]
    public function index(): Response
    {
        return $this->render('app/pages/index.html.twig');
    }

    #[Route('/contact', name: 'app_contact')]
    public function contact(): Response
    {
        return $this->render('app/pages/contact/create.html.twig');
    }

    #[Route('/galerie', name: 'app_gallery')]
    public function gallery(): Response
    {
        return $this->render('app/pages/gallery/index.html.twig');
    }

    #[Route('/aventures', name: 'app_adventures')]
    public function adventures(BoViewRepository $viewRepository): Response
    {
        $views = [];
        if($this->getUser()){
            $views = $viewRepository->findAll();
        }
        return $this->render('app/pages/blog/index.html.twig', ['views' => $views]);
    }

    #[Route('/legales/mentions-legales', name: 'app_mentions')]
    public function mentions(): Response
    {
        return $this->render('app/pages/legales/mentions.html.twig');
    }

    #[Route('/legales/politique-confidentialite', name: 'app_politique', options: ['expose' => true])]
    public function politique(): Response
    {
        return $this->render('app/pages/legales/politique.html.twig');
    }

    #[Route('/legales/cookies', name: 'app_cookies', options: ['expose' => true])]
    public function cookies(): Response
    {
        return $this->render('app/pages/legales/cookies.html.twig');
    }

}
