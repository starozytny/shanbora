<?php

namespace App\Controller\InternApi\Blog;

use App\Entity\Blog\BoCommentary;
use App\Repository\Blog\BoCommentaryRepository;
use App\Service\ApiResponse;
use App\Service\Data\DataBlog;
use App\Service\MailerService;
use App\Service\SettingsService;
use App\Service\ValidatorService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/intern/api/blog/commentaries', name: 'intern_api_blog_commentaries_')]
class CommentaryController extends AbstractController
{
    #[Route('/create', name: 'create', options: ['expose' => true], methods: 'POST')]
    public function create(Request $request, ApiResponse $apiResponse, ValidatorService $validator,
                           DataBlog $dataEntity, BoCommentaryRepository $repository,
                           MailerService $mailerService, SettingsService $settingsService): Response
    {
        $data = json_decode($request->getContent());
        if ($data === null) {
            return $apiResponse->apiJsonResponseBadRequest('Les données sont vides.');
        }

        $obj = $dataEntity->setDataCommentary(new BoCommentary(), $data);

        $noErrors = $validator->validate($obj);
        if ($noErrors !== true) {
            return $apiResponse->apiJsonResponseValidationFailed($noErrors);
        }

        $repository->save($obj, true);

        $mailerService->sendMail(
            [$settingsService->getEmailContact()],
            "Commentaire blog pour article : " . $data->adventureName,
            "Commentaire blog pour article : " . $data->adventureName,
            'app/email/blog/commentary.html.twig',
            [
                'adventureName' => $data->adventureName, 'adventureUrl' =>  $data->adventureUrl,
                'elem' => $obj,
                'settings' => $settingsService->getSettings()
            ],
        );

        return $apiResponse->apiJsonResponseSuccessful("Message envoyé.");
    }

    #[Route('/delete/{id}', name: 'delete', options: ['expose' => true], methods: 'DELETE')]
    public function delete($id, BoCommentaryRepository $repository, ApiResponse $apiResponse): Response
    {
        $obj = $repository->find($id);
        if(!$obj){
            return $apiResponse->apiJsonResponseBadRequest("Object not found.");
        }

        $repository->remove($obj, true);
        return $apiResponse->apiJsonResponseSuccessful("ok");
    }
}
