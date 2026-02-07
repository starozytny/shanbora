<?php

namespace App\Command;

use App\Entity\Billing\BiQuotePackageTemplate;
use App\Service\DatabaseService;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'admin:create:formules',
    description: 'Create formules',
)]
class AdminCreateFormulesCommand extends Command
{
    private ObjectManager $em;

    public function __construct(DatabaseService $databaseService,)
    {
        parent::__construct();

        $this->em = $databaseService->getDefaultManager();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Création des formules');

        $packages = [
            [
                'slug' => 'half_day',
                'name' => 'Demi-Journée',
                'description' => 'Couverture essentielle pour les moments clés',
                'basePrice' => '800.00',
                'position' => 1,
                'defaultContent' => [
                    'duration' => '4 heures de couverture (cérémonie + cocktail ou cocktail + soirée)',
                    'photos_count' => '250 à 300 images haute résolution retouchées professionnellement',
                    'delivery' => 'Galerie en ligne privée',
                    'delivery_time' => 'Livraison sous 4 semaines maximum',
                    'inclusions' => [
                        'Téléchargement gratuit et illimité',
                        'Matériel pro redondant (2 boîtiers + flash)',
                        'Déplacement inclus Bouches-du-Rhône (13)',
                    ],
                    'extras' => [],
                ],
            ],
            [
                'slug' => 'full_day',
                'name' => 'Journée Complète',
                'description' => 'L\'intégralité de votre journée immortalisée',
                'basePrice' => '1400.00',
                'position' => 2,
                'defaultContent' => [
                    'duration' => '8 heures de couverture (préparatifs, cérémonie, cocktail, début soirée)',
                    'photos_count' => '450 à 500 images HD retouchées',
                    'delivery' => 'Galerie privée en ligne',
                    'delivery_time' => 'Livraison sous 4 semaines maximum',
                    'inclusions' => [
                        'Séance couple dédiée 20-30 min',
                        'Téléchargement gratuit et illimité',
                        'Matériel pro redondant (2 boîtiers + flash)',
                        'Déplacement inclus Bouches-du-Rhône (13)',
                    ],
                    'extras' => [],
                ],
            ],
            [
                'slug' => 'premium',
                'name' => 'Formule Premium',
                'description' => 'Une couverture complète des préparatifs à l\'ouverture de bal',
                'basePrice' => '1800.00',
                'position' => 3,
                'defaultContent' => [
                    'duration' => '12 heures de couverture (préparatifs matinaux jusqu\'à ouverture de bal)',
                    'photos_count' => '600 à 650 images HD retouchées',
                    'delivery' => 'Galerie privée en ligne',
                    'delivery_time' => 'Livraison sous 4 semaines maximum',
                    'inclusions' => [
                        'Séance couple dédiée 30-45 min',
                        'Photos de groupe (organisation et réalisation)',
                        'Téléchargement gratuit et illimité',
                        'Matériel pro redondant (2 boîtiers + flash)',
                        'Déplacement inclus Bouches-du-Rhône (13)',
                    ],
                    'extras' => [],
                ],
            ],
        ];

        foreach ($packages as $data) {
            $package = new BiQuotePackageTemplate();
            $package->setSlug($data['slug']);
            $package->setName($data['name']);
            $package->setDescription($data['description']);
            $package->setBasePrice($data['basePrice']);
            $package->setPosition($data['position']);
            $package->setDefaultContent($data['defaultContent']);
            $package->setIsActive(true);

            $this->em->persist($package);
        }

        $this->em->flush();

        $io->newLine();
        $io->comment('--- [FIN DE LA COMMANDE] ---');
        return Command::SUCCESS;
    }
}
