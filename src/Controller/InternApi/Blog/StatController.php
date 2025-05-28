<?php

namespace App\Controller\InternApi\Blog;

use App\Entity\Blog\BoView;
use App\Repository\Blog\BoViewRepository;
use App\Service\ApiResponse;
use Jaybizzle\CrawlerDetect\CrawlerDetect;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/intern/api/blog/stats', name: 'intern_api_blog_stats_')]
class StatController extends AbstractController
{
    #[Route('/create', name: 'create', options: ['expose' => true], methods: 'POST')]
    public function create(Request $request, BoViewRepository $viewRepository, ApiResponse $apiResponse): Response
    {
        $data = json_decode($request->getContent());
        $crawlerDetect = new CrawlerDetect();

        // Vérifie si le User-Agent est un bot
        if ($crawlerDetect->isCrawler($request->headers->get('User-Agent')) || $this->isGranted('ROLE_ADMIN')) {
            return $apiResponse->apiJsonResponseSuccessful("ok");
        }

        $adventureId = $data->adventureId;

        $view = $viewRepository->findOneBy(['adventureId' => $adventureId]);
        if(!$view){
            $view = (new BoView())
                ->setAdventureId($adventureId)
            ;
        }

        $view = ($view)
            ->setNbTotal($view->getNbTotal() + 1)
        ;

        $viewRepository->save($view, true);

        return $apiResponse->apiJsonResponseSuccessful("ok");
    }
}
