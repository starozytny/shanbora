<?php

namespace App\Controller\Api;

use App\Entity\Main\Settings;
use App\Repository\Main\SettingsRepository;
use App\Service\ApiResponse;
use App\Service\SanitizeData;
use App\Service\ValidatorService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/settings', name: 'api_settings_')]
#[IsGranted('ROLE_ADMIN')]
class SettingsController extends AbstractController
{
    #[Route('/update', name: 'update', options: ['expose' => true], methods: 'POST')]
    public function update(Request $request, ApiResponse $apiResponse, ValidatorService $validator,
                           SettingsRepository $repository, SanitizeData $sanitizeData): Response
    {
        $objs = $repository->findAll();
        $obj = $objs ? $objs[0] : new Settings();

        $data = json_decode($request->get('data'));
        $file = $request->files->get('logo');
        if($data === null){
            return $apiResponse->apiJsonResponseBadRequest("Il manque des données");
        }

        $logo = $obj->getLogoMail();
        if($file){
            $extension = pathinfo(parse_url($file, PHP_URL_PATH), PATHINFO_EXTENSION);
            $img = file_get_contents($file);
            $base64 = base64_encode($img);

            $logo = "data:image/" . $extension . ';base64,' . $base64;
        }

        $obj = ($obj)
            ->setWebsiteName($sanitizeData->trimData($data->websiteName))
            ->setEmailGlobal($sanitizeData->trimData($data->emailGlobal))
            ->setEmailContact($sanitizeData->trimData($data->emailContact))
            ->setEmailRgpd($sanitizeData->trimData($data->emailRgpd))
            ->setLogoMail($logo)
            ->setUrlHomepage($this->generateUrl('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL))
            ->setMultipleDatabase((int) $data->multipleDatabase[0])
        ;

        $noErrors = $validator->validate($obj);
        if ($noErrors !== true) {
            return $apiResponse->apiJsonResponseValidationFailed($noErrors);
        }

        $repository->save($obj, true);
        return $apiResponse->apiJsonResponseSuccessful("ok");
    }
}
