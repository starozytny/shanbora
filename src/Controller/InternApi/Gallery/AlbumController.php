<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\Gallery\GaAlbum;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaAlbumRepository;
use App\Repository\Main\Gallery\GaImageRepository;
use App\Service\Api\ApiResponse;
use App\Service\Data\DataGallery;
use App\Service\Gallery\ImageService;
use App\Service\ValidatorService;
use PHPImageWorkshop\Core\Exception\ImageWorkshopLayerException;
use PHPImageWorkshop\Exception\ImageWorkshopException;
use PHPImageWorkshop\ImageWorkshop;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/intern/api/gallery/albums', name: 'intern_api_user_gallery_albums_')]
class AlbumController extends AbstractController
{
    #[Route('/update/{id}', name: 'update', options: ['expose' => true], methods: 'POST')]
    public function create(Request $request, GaAlbum $obj, ApiResponse $apiResponse, ValidatorService $validator,
                           DataGallery $dataEntity, GaAlbumRepository $repository): Response
    {
        $data = json_decode($request->getContent());
        if ($data === null) {
            return $apiResponse->apiJsonResponseBadRequest('Les données sont vides.');
        }

        $obj = $dataEntity->setDataAlbum($obj, $data);

        if($existe = $repository->findOneBy(['slug' => $obj->getSlug()])){
            if($existe->getId() != $obj->getId()){
                return $apiResponse->apiJsonResponseValidationFailed([
                    ["name" => "title", "message" => "Ce titre existe déjà."]
                ]);
            }
        }

        $noErrors = $validator->validate($obj);
        if ($noErrors !== true) {
            return $apiResponse->apiJsonResponseValidationFailed($noErrors);
        }

        $repository->save($obj, true);

        $this->addFlash('info', 'Données mises à jour.');
        return $apiResponse->apiJsonResponseSuccessful("ok");
    }

    #[Route('/delete/{id}', name: 'delete', options: ['expose' => true], methods: 'DELETE')]
    public function delete(GaAlbum $album, ApiResponse $apiResponse, GaAlbumRepository $repository,
                           GaImageRepository $imageRepository): BinaryFileResponse|JsonResponse
    {
        foreach($album->getImages() as $image){
            $file = $this->getParameter('gallery_images_directory') . $image->getFileFile();
            if(file_exists($file)){
                unlink($file);
            }
            $file = $this->getParameter('gallery_images_directory') . $image->getThumbsFile();
            if(file_exists($file)){
                unlink($file);
            }
            $file = $this->getParameter('gallery_images_directory') . $image->getLightboxFile();
            if(file_exists($file)){
                unlink($file);
            }

            $imageRepository->remove($image);
        }

        if($album->getCover()){
            $file = $this->getParameter('gallery_images_directory') . $album->getCoverFile();
            if(file_exists($file)){
                unlink($file);
            }
        }

        $repository->remove($album, true);
        $this->addFlash('info', 'L\'archive existe toujours. Veuillez le supprimer manuellement.');
        return $apiResponse->apiJsonResponseSuccessful("ok");
    }

    #[Route('/archive/{id}', name: 'archive', options: ['expose' => true], methods: 'GET')]
    public function archive(GaAlbum $album, ApiResponse $apiResponse, GaAlbumRepository $repository): BinaryFileResponse|JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $file = $this->getParameter('gallery_archive_directory') . $album->getUser()->getUsername() . "/" . $album->getArchive() . ".zip";

        if(!file_exists($file)){
            return $apiResponse->apiJsonResponseBadRequest("Le fichier n'existe pas.");
        }

        if($user->getHighRoleCode() == User::CODE_ROLE_USER){
            $album->setNbDownload($album->getNbDownload() + 1);
        }

        $repository->save($album, true);
        return $this->file($file);
    }

    /**
     * @throws ImageWorkshopLayerException
     * @throws ImageWorkshopException
     */
    #[Route('/cover/{id}', name: 'cover', options: ['expose' => true], methods: 'PUT')]
    public function cover(Request $request, GaAlbum $album, ApiResponse $apiResponse, GaAlbumRepository $repository,
                          GaImageRepository $imageRepository): JsonResponse
    {
        $data = json_decode($request->getContent());

        $image = $imageRepository->findOneBy(['id' => $data->imageId]);
        if(!$image){
            return $apiResponse->apiJsonResponseBadRequest("L'image n'existe pas.");
        }

        $coverFile = $this->getParameter('gallery_images_directory') . $image->getFileFile();
        if($coverFile){
            $oldCover = $album->getCoverFile();
            $oldCoverFile = $this->getParameter('gallery_images_directory') . $oldCover;
            if(!is_dir($oldCoverFile) && file_exists($oldCoverFile)){
                unlink($oldCoverFile);
            }

            $directoryCover = $this->getParameter('gallery_images_directory') . $album->getUser()->getUsername() . "/" . $album->getArchive() . "/cover/";
            if(!is_dir($directoryCover)){
                mkdir($directoryCover, 0777, true);
            }

            $originalFile = ImageWorkshop::initFromPath($coverFile);
            if($originalFile->getWidth() > 1408){
                $originalFile->cropInPixel($originalFile->getWidth(), 552, 0 ,0, 'MM');
                $originalFile->resizeInPixel(1408, null, true);
            }
            $originalFile->save($directoryCover, $image->getFile());

            $album->setCover($image->getFile());
        }else{
            $album->setCover(null);
        }

        $repository->save($album, true);
        return $apiResponse->apiJsonResponseSuccessful("ok");
    }

    #[Route('/cover/{id}', name: 'read_cover', options: ['expose' => true], methods: 'GET')]
    public function read($id, GaAlbumRepository $repository, ImageService $imageService): Response
    {
        $obj = $repository->findOneBy(['id' => $id]);
        if($obj === false) {
            throw $this->createNotFoundException('Album not found.');
        }

        $response = $imageService->getImageGallery($obj->getCoverLightbox());

        if($response === false){
            throw $this->createNotFoundException('La photo demandée n\'existe pas.');
        }

        return $response;
    }

    #[Route('/cover-hd-ultra/{id}', name: 'read_cover_hd_ultra', options: ['expose' => true], methods: 'GET')]
    public function readHDUltra($id, GaAlbumRepository $repository, ImageService $imageService): Response
    {
        $obj = $repository->findOneBy(['id' => $id]);
        if($obj === false) {
            throw $this->createNotFoundException('Album not found.');
        }

        $response = $imageService->getImageGallery($obj->getCoverFile());

        if($response === false){
            throw $this->createNotFoundException('La photo demandée n\'existe pas.');
        }

        return $response;
    }
}
