<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\Gallery\GaImage;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaImageRepository;
use App\Service\ApiResponse;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/intern/api/gallery', name: 'intern_api_user_gallery_')]
class UserController extends AbstractController
{
    #[Route('/fetch-images', name: 'fetch_images', options: ['expose' => true], methods: 'GET')]
    public function fetchImages(Request $request, PaginatorInterface $paginator, ApiResponse $apiResponse,
                                GaImageRepository $imageRepository, SerializerInterface $serializer): Response
    {
        $images = $imageRepository->findBy(['user' => $this->getUser()], ['dateAt' => 'ASC']);

        $page = $request->query->getInt('page', 1);
        $pagination = $paginator->paginate(
            $images, // Les images récupérées
            $page,   // La page actuelle
            20  // Nombre d'images par page
        );

        $images = $serializer->serialize($pagination->getItems(), 'json', ['groups' => GaImage::LIST]);

        return $apiResponse->apiJsonResponseCustom([
            'images' => $images,
            'hasMore' => $pagination->getCurrentPageNumber() < $pagination->getPageCount(),
        ]);
    }

    #[Route('/image/{id}', name: 'read_image', options: ['expose' => true], methods: 'GET')]
    public function read($id, GaImageRepository $repository): Response
    {
        $obj = $repository->findOneBy(['id' => $id]);
        if($obj === false) {
            throw $this->createNotFoundException('Image not found.');
        }

        $photoPath = $this->getParameter('private_directory') . "gallery/" . $obj->getThumbsFile();
        if (!file_exists($photoPath)) {
            throw $this->createNotFoundException('La photo demandée n\'existe pas.');
        }

        // Renvoie le fichier sécurisé
        $response = new StreamedResponse(function () use ($photoPath) {
            readfile($photoPath);
        });

        $response->headers->set('Content-Type', 'image/jpg'); // À ajuster selon le type de fichier
        return $response;
    }

    #[Route('/download/{id}', name: 'download', options: ['expose' => true], methods: 'GET')]
    public function download($id, GaImageRepository $repository, ApiResponse $apiResponse): BinaryFileResponse|JsonResponse
    {
        $obj = $repository->findOneBy(['id' => $id]);

        $file = $this->getParameter('private_directory') . "gallery/" . $obj->getFileFile();

        if(!file_exists($file)){
            return $apiResponse->apiJsonResponseBadRequest("Le fichier n'existe pas.");
        }

        return $this->file($file, $obj->getOriginalName());
    }

    #[Route('/archive', name: 'archive', options: ['expose' => true], methods: 'GET')]
    public function archive(ApiResponse $apiResponse): BinaryFileResponse|JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $file = $this->getParameter('private_directory') . "import/gallery/" . $user->getUsername() . ".zip";

        if(!file_exists($file)){
            return $apiResponse->apiJsonResponseBadRequest("Le fichier n'existe pas.");
        }

        return $this->file($file);
    }
}