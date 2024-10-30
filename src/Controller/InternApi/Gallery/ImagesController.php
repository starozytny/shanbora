<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\Gallery\GaImage;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaImageRepository;
use App\Service\ApiResponse;
use App\Service\Gallery\ImageService;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/intern/api/gallery/images', name: 'intern_api_user_gallery_images_')]
class ImagesController extends AbstractController
{
    #[Route('/fetch-images', name: 'fetch_images', options: ['expose' => true], methods: 'GET')]
    public function fetchImages(Request $request, PaginatorInterface $paginator, ApiResponse $apiResponse,
                                GaImageRepository $imageRepository, SerializerInterface $serializer): Response
    {
        $albumId = $request->query->get('albumId');
        if($request->query->get('isAdmin')){
            if($request->query->get('sortBy') == "dl"){
                $images = $imageRepository->findBy(['album' => $albumId], ['nbDownload' => 'DESC']);
            }else{
                $images = $imageRepository->findBy(['album' => $albumId], ['originalName' => 'ASC']);
            }
        }else{
            $images = $imageRepository->findBy(['album' => $albumId], ['originalName' => 'ASC']);
        }

        // Pagination
        $page = $request->query->getInt('page', 1);
        $pagination = $paginator->paginate(
            $images, // Les images récupérées
            $page,   // La page actuelle
            48  // Nombre d'images par page
        );

        return $apiResponse->apiJsonResponseCustom([
            'images' => $serializer->serialize($images, 'json', ['groups' => GaImage::LIST]),
            'currentImages' => $serializer->serialize($pagination->getItems(), 'json', ['groups' => GaImage::LIST]),
            'hasMore' => $pagination->getCurrentPageNumber() < $pagination->getPageCount(),
        ]);
    }

    #[Route('/image/{id}', name: 'read_image', options: ['expose' => true], methods: 'GET')]
    public function read($id, GaImageRepository $repository, ImageService $imageService): Response
    {
        $obj = $repository->findOneBy(['id' => $id]);
        if($obj === false) {
            throw $this->createNotFoundException('Image not found.');
        }

        $response = $imageService->getImageGallery($obj->getThumbsFile());

        if($response === false){
            throw $this->createNotFoundException('La photo demandée n\'existe pas.');
        }

        return $response;
    }

    #[Route('/image-hd/{id}', name: 'read_image_hd', options: ['expose' => true], methods: 'GET')]
    public function readHD($id, GaImageRepository $repository, ImageService $imageService): Response
    {
        $obj = $repository->findOneBy(['id' => $id]);
        if($obj === false) {
            throw $this->createNotFoundException('Image not found.');
        }

        $response = $imageService->getImageGallery($obj->getLightboxFile());

        if($response === false){
            throw $this->createNotFoundException('La photo demandée n\'existe pas.');
        }

        return $response;
    }

    #[Route('/download/{id}', name: 'download', options: ['expose' => true], methods: 'GET')]
    public function download($id, GaImageRepository $repository, ApiResponse $apiResponse): BinaryFileResponse|JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $obj = $repository->findOneBy(['id' => $id]);

        if($user->getHighRoleCode() == User::CODE_ROLE_USER){
            $obj->setNbDownload($obj->getNbDownload() + 1);
        }

        $file = $this->getParameter('gallery_images_directory') . $obj->getFileFile();

        if(!file_exists($file)){
            return $apiResponse->apiJsonResponseBadRequest("Le fichier n'existe pas.");
        }

        $repository->save($obj, true);
        return $this->file($file, $obj->getOriginalName());
    }
}
