<?php

namespace App\Command\Fix;

use App\Entity\Main\Gallery\GaAlbum;
use App\Service\DatabaseService;
use DateTime;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'fix:tmp:data',
    description: 'Add a short description for your command',
)]
class FixTmpDataCommand extends Command
{
    private ObjectManager $em;
    private string $galleryDirectory;

    public function __construct(string $galleryImagesDirectory, DatabaseService $databaseService)
    {
        parent::__construct();

        $this->em = $databaseService->getDefaultManager();
        $this->galleryDirectory = $galleryImagesDirectory;
    }

//    protected function configure(): void
//    {
//        $this
//            ->addArgument('arg1', InputArgument::OPTIONAL, 'Argument description')
//            ->addOption('option1', null, InputOption::VALUE_NONE, 'Option description')
//        ;
//    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
//        $arg1 = $input->getArgument('arg1');
//
//        if ($arg1) {
//            $io->note(sprintf('You passed an argument: %s', $arg1));
//        }
//
//        if ($input->getOption('option1')) {
//        }

        $data = $this->em->getRepository(GaAlbum::class)->findAll();
        foreach($data as $item){
            $photos = $item->getImages();

            foreach($photos as $photo){
                $file = $this->galleryDirectory . $photo->getFileFile();

                if(file_exists($file)){
                    $exif = @exif_read_data($file);

                    $dateAt = $photo->getDateAt();

                    if ($exif && isset($exif['DateTimeOriginal'])) {
                        $dateAt = DateTime::createFromFormat('Y:m:d H:i:s', $exif['DateTimeOriginal']);
                    } else {
                        $io->error("Impossible de lire les exifs de : " . $photo->getId() . " - " . $photo->getOriginalName());
                    }
                }else{
                    $io->error("Le fichier n'existe pas : " . $photo->getId() . " - " . $photo->getOriginalName());
                }
            }
        }

        $this->em->flush();

        $io->newLine();
        $io->comment('--- [FIN DE LA COMMANDE] ---');
        return Command::SUCCESS;
    }
}
