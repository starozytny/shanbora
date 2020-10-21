<?php

namespace App\Controller\Styleguide;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/administrator/styleguide", options={"expose"=true}, name="super_styleguide_")
 */
class StyleguideController extends AbstractController
{
    /**
     * @Route("/", name="index")
     */
    public function index()
    {
        return $this->render('root/super/pages/styleguide/index.html.twig');
    }
}
