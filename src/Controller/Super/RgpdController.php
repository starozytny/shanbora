<?php

namespace App\Controller\Super;

use App\Entity\Rgpd;
use App\Service\SerializeData;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/administrator/rgpd", name="super_rgpd_")
 */
class RgpdController extends AbstractController
{
    const ATTRIBUTES_RGPD = ['id', 'firstname', 'email', 'subject', 'subjectToStringShort', 'message', 'createAtString', 'isSeen'];

    /**
     * @Route("/", name="index")
     */
    public function index(SerializeData $serializer)
    {
        $em = $this->getDoctrine()->getManager();
        $demandes = $em->getRepository(Rgpd::class)->findBy(['isTrash' => false], ['createAt' => 'DESC']);

        $demandes = $serializer->getSerializeData($demandes, self::ATTRIBUTES_RGPD);

        return $this->render('root/super/pages/rgpd/index.html.twig', [
            'demandes' => $demandes
        ]);
    }

    /**
    * @Route("/update/seen/{rgpd}", options={"expose"=true}, name="update_seen")
    */
    public function updateIsSeen(Rgpd $rgpd)
    {
        $em = $this->getDoctrine()->getManager();
        if(!$rgpd->getIsSeen()){
            $rgpd->setIsSeen(true);
            $em->persist($rgpd);
            $em->flush();

            return new JsonResponse([ 'code' => 1 ]);
        }

        return new JsonResponse([ 'code' => 0 ]);
    }

    /**
     * @Route("/delete/{rgpd}", options={"expose"=true}, name="delete")
     */
    public function delete($rgpd)
    {
        $em = $this->getDoctrine()->getManager();
        $rgpd = $em->getRepository(Rgpd::class)->find($rgpd);
        if(!$rgpd){
            return new JsonResponse(['code' => 0, 'message' => '[ERREUR] Cette demande RGPD n\'existe pas.']);
        }

        if(!$rgpd->getIsSeen()){
            return new JsonResponse(['code' => 0, 'message' => 'Vous n\'avez pas consulté ce message.']);
        }

        $rgpd->setIsTrash(true);

        $em->persist($rgpd); $em->flush();
        return new JsonResponse(['code' => 1]);
    }
}
