<?php

namespace App\Controller\App;

use App\Entity\Blog\BoView;
use App\Repository\Blog\BoCommentaryRepository;
use App\Repository\Blog\BoViewRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/aventures', name: 'app_adventures_')]
class BlogController extends AbstractController
{
    // LAST ID 12

    public function __construct(private readonly BoCommentaryRepository $commentaryRepository,
                                private readonly BoViewRepository $viewRepository)
    {}

    #[Route('/minorque', name: 'minorque')]
    public function minorque(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(12);
        }
        return $this->render('app/pages/blog/2025/minorque.html.twig', $this->getCommentaries(12));
    }

    #[Route('/lac-sainte-marguerite', name: 'marguerite')]
    public function marguerite(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(11);
        }
        return $this->render('app/pages/blog/2024/sainte_marguerite.html.twig', $this->getCommentaries(11));
    }

    #[Route('/plateau-emparis', name: 'emparis')]
    public function emparis(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(10);
        }
        return $this->render('app/pages/blog/2024/plateau_emparis.html.twig', $this->getCommentaries(10));
    }

    #[Route('/lacs-petarel', name: 'petarel')]
    public function petarel(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(9);
        }
        return $this->render('app/pages/blog/2024/lacs_petarel.html.twig', $this->getCommentaries(9));
    }

    #[Route('/lac-lauzon-blue-refuge', name: 'lauzon')]
    public function lauzon(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(8);
        }
        return $this->render('app/pages/blog/2024/refuge_pigeonnier.html.twig', $this->getCommentaries(8));
    }

    #[Route('/lac-orceyrette', name: 'orceyrette')]
    public function orceyrette(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(1);
        }
        return $this->render('app/pages/blog/2024/lac_orceyrette.html.twig', $this->getCommentaries(1));
    }

    #[Route('/pic-de-morgon', name: 'morgon')]
    public function morgon(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(7);
        }
        return $this->render('app/pages/blog/2024/pic_morgon.html.twig', $this->getCommentaries(7));
    }

    #[Route('/pas-demi-lune-semaphore', name: 'semaphore')]
    public function semaphore(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(6);
        }
        return $this->render('app/pages/blog/2024/pas_demi_lune.html.twig', $this->getCommentaries(6));
    }

    #[Route('/lac-miroir', name: 'miroir')]
    public function miroir(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(4);
        }
        return $this->render('app/pages/blog/2023/lac_miroir.html.twig', $this->getCommentaries(4));
    }

    #[Route('/lac-ayous', name: 'ayous')]
    public function ayous(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(3);
        }
        return $this->render('app/pages/blog/2023/lac_ayous.html.twig', $this->getCommentaries(3));
    }

    #[Route('/lac-gaube', name: 'gaube')]
    public function gaube(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(2);
        }
        return $this->render('app/pages/blog/2023/lac_gaube.html.twig', $this->getCommentaries(2));
    }

    #[Route('/la-reunion', name: 'reunion')]
    public function reunion(): Response
    {
        if(!$this->isGranted('ROLE_ADMIN')) {
            $this->stat(5);
        }
        return $this->render('app/pages/blog/2022/reunion.html.twig', $this->getCommentaries(5));
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

    private function stat($id): void
    {
        $view = $this->viewRepository->findOneBy(['adventureId' => $id]);
        if(!$view){
            $view = (new BoView())
                ->setAdventureId($id)
            ;
        }

        $view = ($view)
            ->setNbTotal($view->getNbTotal() + 1)
        ;

        $this->viewRepository->save($view, true);
    }
}
