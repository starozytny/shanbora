<?php

namespace App\Controller\Admin\Billing;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/facturation/devis', name: 'admin_facturation_devis_')]
class QuotationController extends AbstractController
{
    #[Route('/', name: 'index')]
    public function index(): Response
    {
        return $this->render('admin/pages/billing/quotes/index.html.twig');
    }
}
