<?php

namespace App\Service\Billing;

use App\Entity\Billing\BiQuote;
use Mpdf\Mpdf;
use Mpdf\Config\ConfigVariables;
use Mpdf\Config\FontVariables;
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

        // Configure mPDF
        $defaultConfig = (new ConfigVariables())->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];

        $defaultFontConfig = (new FontVariables())->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'margin_left' => 0,
            'margin_right' => 0,
            'margin_top' => 0,
            'margin_bottom' => 0,
            'margin_header' => 0,
            'margin_footer' => 0,
            'tempDir' => sys_get_temp_dir() . '/mpdf',
            'fontDir' => $fontDirs,
            'fontdata' => $fontData,
            'default_font' => 'dejavusans',
        ]);

        // Disable auto page break to control pages manually
        $mpdf->autoPageBreak = false;

        // Write HTML
        $mpdf->WriteHTML($html);

        return $mpdf->Output('', 'S');
    }

    public function getFilename(BiQuote $quote): string
    {
        $clientName = $this->slugify($quote->getClientFullName());
        return sprintf('Devis_%s_%s.pdf', $quote->getReference(), $clientName);
    }

    private function slugify(string $text): string
    {
        $text = transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $text);
        $text = preg_replace('/[^a-z0-9]+/', '_', $text);
        return trim($text, '_');
    }
}
