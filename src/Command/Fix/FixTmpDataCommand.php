<?php

namespace App\Command\Fix;

use App\Entity\Main\Gallery\GaAlbum;
use App\Entity\Main\User;
use App\Service\DatabaseService;
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

    public function __construct(DatabaseService $databaseService)
    {
        parent::__construct();

        $this->em = $databaseService->getDefaultManager();
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

        $users = $this->em->getRepository(User::class)->findAll();

        foreach($users as $user){
            if($user->getGalleryTitle()) {
                $album = (new GaAlbum())
                    ->setTitle($user->getGalleryTitle())
                    ->setDateAt($user->getGalleryDate())
                    ->setNbDownload($user->getGalleryNbDownload())
                    ->setUser($user)
                ;

                $this->em->persist($album);

                foreach($user->getGaImages() as $gaImage){
                    $gaImage->setAlbum($album);
                }
            }
        }
        $this->em->flush();

        $io->newLine();
        $io->comment('--- [FIN DE LA COMMANDE] ---');
        return Command::SUCCESS;
    }
}
