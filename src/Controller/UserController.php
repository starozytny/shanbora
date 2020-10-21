<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    /**
     * @Route("/espace-utilisateur", name="user_dashboard")
     */
    public function index()
    {
        return $this->render('root/user/index.html.twig');
    }
}
