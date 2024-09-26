<?php

namespace App\Controller\App;

use App\Repository\Blog\BoCommentaryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/aventures', name: 'app_adventures_')]
class BlogController extends AbstractController
{
    public function __construct(private readonly BoCommentaryRepository $commentaryRepository)
    {}

    #[Route('/lac-orceyrette', name: 'orceyrette')]
    public function orceyrette(): Response
    {
        return $this->render('app/pages/blog/2024/lac_orceyrette.html.twig', $this->getCommentaries(1));
    }

    #[Route('/lac-gaube', name: 'gaube')]
    public function gaube(): Response
    {
        return $this->render('app/pages/blog/2023/lac_gaube.html.twig', $this->getCommentaries(2));
    }

    private function getCommentaries($id): array
    {
        $data = $this->commentaryRepository->findBy(['adventureId' => $id]);

        $commentaries = []; $responses = [];
        foreach($data as $item){
            if($item->getResponseId()){
                $responses[] = $item;
            }else{
                $commentaries[] = $item;
            }
        }

        return [
            'adventureId' => $id,
            'commentaries' => $commentaries,
            'responses' => $responses,
        ];
    }
}
