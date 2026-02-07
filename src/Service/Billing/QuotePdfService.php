<?php

namespace App\Service\Billing;

use App\Entity\Billing\BiQuote;
use Dompdf\Dompdf;
use Dompdf\Options;
use Twig\Environment;

class QuotePdfService
{
    public function __construct(
        private Environment $twig,
        private string $siret,
        private string $address,
        private string $phone,
        private string $email,
    ) {}

    public function generate(BiQuote $quote): string
    {
        // Render HTML
        $html = $this->twig->render('pdfs/quote.html.twig', [
            'quote' => $quote,
            'config' => [
                'siret' => $this->siret,
                'address' => $this->address,
                'phone' => $this->phone,
                'email' => $this->email,
            ],
        ]);

        // Configure Dompdf
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'Helvetica');
        $options->set('isFontSubsettingEnabled', true);
        $options->set('isPhpEnabled', false);

        // Generate PDF
        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    public function getFilename(BiQuote $quote): string
    {
        $clientName = $this->slugify($quote->getClientFullName());
        return sprintf('Devis_%s_%s.pdf', $quote->getReference(), $clientName);
    }

    private function slugify(string $text): string
    {
        // Transliterate
        $text = transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $text);
        // Replace non-alphanumeric
        $text = preg_replace('/[^a-z0-9]+/', '_', $text);
        // Trim underscores
        return trim($text, '_');
    }
}
