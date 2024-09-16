<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\User;
use App\Service\Gallery\GalleryService;
use Knp\Component\Pager\Paginator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/intern/api/gallery', name: 'user_gallery_')]
class UserController extends AbstractController
{
    #[Route('/fetch-images', name: 'fetchImages', options: ['expose' => true])]
    public function fetchImages(Request $request, Paginator $paginator, GalleryService $galleryService): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        return $galleryService->fetchImages($user, $request, $paginator);
    }
}
