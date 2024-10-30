<?php

namespace App\Controller\InternApi\Gallery;

use App\Entity\Main\Gallery\GaAlbum;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaAlbumRepository;
use App\Repository\Main\Gallery\GaImageRepository;
use App\Service\ApiResponse;
use App\Service\Data\DataGallery;
use App\Service\ValidatorService;
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
}
