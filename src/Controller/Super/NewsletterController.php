<?php

namespace App\Controller\Super;

use App\Entity\Newsletter;
use App\Service\SerializeData;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/administrator/newsletter", name="super_newsletter_")
 */
class NewsletterController extends AbstractController
{
    const ATTRIBUTES_NEWSLETTER = ['id', 'email'];

    /**
     * @Route("/", name="index")
     */
    public function index(SerializeData $serializer)
    {
        $em = $this->getDoctrine()->getManager();
        $demandes = $em->getRepository(Newsletter::class)->findAll();

        $demandes = $serializer->getSerializeData($demandes, self::ATTRIBUTES_NEWSLETTER);

        return $this->render('root/super/pages/newsletter/index.html.twig', [
            'demandes' => $demandes
        ]);
    }

    /**
     * @Route("/delete/{news}", options={"expose"=true}, name="delete")
     */
    public function delete($news)
    {
        $em = $this->getDoctrine()->getManager();
        $demande = $em->getRepository(Newsletter::class)->find($news);
        if(!$demande){
            return new JsonResponse(['code' => 0, 'message' => '[ERREUR] Cette demande n\'existe pas.']);
        }

        dump($demande);

        $em->remove($demande); $em->flush();
        return new JsonResponse(['code' => 1]);
    }
}
