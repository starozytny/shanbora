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

    #[Route('/lac-orceyrette-et-eychauda', name: 'orceyrette')]
    public function orceyrette(): Response
    {
        return $this->render('app/pages/blog/2024/lac_orceyrette_et_eychauda.html.twig', $this->getCommentaries(1));
    }

    private function getCommentaries($id): array
    {
        $commentaries = $this->commentaryRepository->findBy(['adventureId' => $id]);
        return [
            'adventureId' => $id,
            'commentaries' => $commentaries
        ];
    }
}
