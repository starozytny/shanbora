<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\Gallery\GaImage;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaImageRepository;
use App\Service\Api\ApiResponse;
use App\Service\Gallery\ImageService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use ZipArchive;

#[Route('/intern/api/gallery/images', name: 'intern_api_user_gallery_images_')]
class ImagesController extends AbstractController
{
    #[Route('/fetch-images', name: 'fetch_images', options: ['expose' => true], methods: 'GET')]
    public function fetchImages(Request $request, ApiResponse $apiResponse, GaImageRepository $imageRepository, SerializerInterface $serializer): Response
    {
        $albumId = $request->query->get('albumId');
        $page = $request->query->getInt('page', 1);
        $limit = 48;
        $offset = ($page - 1) * $limit;

        if ($request->query->get('isAdmin')) {
            $orderBy = $request->query->get('sortBy') === 'dl'
                ? ['nbDownload' => 'DESC']
                : ['originalName' => 'ASC'];
        } else {
            $orderBy = ['originalName' => 'ASC'];
        }

        if ($page === 1) {
            $allImages = $imageRepository->findBy(['album' => $albumId], $orderBy);
        } else {
            $allImages = [];
        }

        $currentImages = $imageRepository->findBy(
            ['album' => $albumId],
            $orderBy,
            $limit,
            $offset
        );

        $totalImages = count($allImages);
        $hasMore = ($offset + $limit) < $totalImages;

        return $apiResponse->apiJsonResponseCustom([
            'images' => $page === 1
                ? $serializer->serialize($allImages, 'json', ['groups' => GaImage::LIST])
                : '[]',
            'currentImages' => $serializer->serialize($currentImages, 'json', ['groups' => GaImage::LIST]),
            'hasMore' => $hasMore,
            'total' => $totalImages,
            'page' => $page
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

    #[Route('/download-selected', name: 'download_selected', options: ['expose' => true], methods: 'POST')]
    public function downloadSelected(Request $request, GaImageRepository $repository, ApiResponse $apiResponse): BinaryFileResponse|JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent());

        if (!is_array($data->imageIds) || empty($data->imageIds)) {
            return $apiResponse->apiJsonResponseBadRequest("Aucune image sélectionnée.");
        }

        $imageIds = $data->imageIds;

        $images = $repository->findBy(['id' => $imageIds]);

        if (empty($images)) {
            return $apiResponse->apiJsonResponseBadRequest("Aucune image trouvée.");
        }

        // Créer un nom unique pour le fichier ZIP
        $zipFilename = 'selection_' . date('YmdHis') . '_' . uniqid() . '.zip';
        $zipPath = sys_get_temp_dir() . '/' . $zipFilename;

        // Créer le ZIP
        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return $apiResponse->apiJsonResponseBadRequest("Impossible de créer l'archive ZIP.");
        }

        $imagesDirectory = $this->getParameter('gallery_images_directory');
        $addedCount = 0;

        /** @var GaImage $image */
        foreach ($images as $image) {
            $filePath = $imagesDirectory . $image->getFileFile();

            if (file_exists($filePath)) {
                $zip->addFile($filePath, $image->getOriginalName());
                $addedCount++;

                if ($user->getHighRoleCode() == User::CODE_ROLE_USER) {
                    $image->setNbDownload($image->getNbDownload() + 1);
                }
            }
        }

        $zip->close();

        if ($user->getHighRoleCode() == User::CODE_ROLE_USER) {
            $repository->flush();
        }

        if ($addedCount === 0) {
            @unlink($zipPath);
            return $apiResponse->apiJsonResponseBadRequest("Aucun fichier valide à télécharger.");
        }

        $response = $this->file($zipPath, 'selection_photos_' . count($images) . '.zip');
        $response->deleteFileAfterSend(true);

        return $response;
    }
}
