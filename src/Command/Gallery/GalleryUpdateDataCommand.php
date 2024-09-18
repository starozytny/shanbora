<?php

namespace App\Command\Gallery;

use App\Entity\Main\Gallery\GaImage;
use App\Entity\Main\User;
use App\Service\DatabaseService;
use Doctrine\Persistence\ObjectManager;
use PHPImageWorkshop\Core\Exception\ImageWorkshopLayerException;
use PHPImageWorkshop\Exception\ImageWorkshopException;
use PHPImageWorkshop\ImageWorkshop;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Finder\Finder;
use ZipArchive;

#[AsCommand(
    name: 'gallery:update:data',
    description: 'Update gallery of user',
)]
class GalleryUpdateDataCommand extends Command
{
    private ObjectManager $em;
    private string $importDirectory;
    private string $galleryDirectory;

    public function __construct(DatabaseService $databaseService, ParameterBagInterface $params)
    {
        parent::__construct();

        $this->em = $databaseService->getDefaultManager();
        $this->importDirectory = $params->get('kernel.project_dir') . '/documents/import/gallery/';
        $this->galleryDirectory = $params->get('kernel.project_dir') . '/documents/gallery/';
    }

    protected function configure(): void
    {
        $this
            ->addArgument('username', InputArgument::REQUIRED, 'gallery user username')
        ;
    }

    /**
     * @throws ImageWorkshopException
     * @throws ImageWorkshopLayerException
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filename = $input->getArgument('username');

        $io->title("Extraction de l'archive");


        $extractDirectory = $this->galleryDirectory . $filename . '/original/';
        if(!is_dir($extractDirectory)){
            mkdir($extractDirectory, 0777, true);
        }
        $thumbsDirectory = $this->galleryDirectory . $filename . '/thumbs/';
        if(!is_dir($thumbsDirectory)){
            mkdir($thumbsDirectory, 0777, true);
        }
        $lightboxDirectory = $this->galleryDirectory . $filename . '/lightbox/';
        if(!is_dir($lightboxDirectory)){
            mkdir($lightboxDirectory, 0777, true);
        }

        $nb = 0;
        if($this->extractZIP($io, $filename)){

            $em = $this->em;

            $user = $em->getRepository(User::class)->findOneBy(['username' => $filename]);
            if(!$user){
                $io->error('User not found');
                return Command::FAILURE;
            }
            $io->title("Suppression des images existantes");

            $nb = 0;
            $files = $em->getRepository(GaImage::class)->findBy(['user' => $user]);
            foreach($files as $file){
                $fileFile = $this->galleryDirectory . $file->getThumbsFile();
                if(file_exists($fileFile)){
                    unlink($fileFile);
                    $nb++;
                }
                $fileFile = $this->galleryDirectory . $file->getFileFile();
                if(file_exists($fileFile)){
                    unlink($fileFile);
                }
                $fileFile = $this->galleryDirectory . $file->getLightboxFile();
                if(file_exists($fileFile)){
                    unlink($fileFile);
                }

                $em->remove($file);
            }

            $io->text($nb . ' images supprimées');
            $io->text(count($files) . ' entrées supprimées');

            $finder = new Finder();
            $finder->files()->in($extractDirectory)->name('/\.(jpg|jpeg|png|gif)$/i');

            $today = new \DateTime();
            $today->setTimezone(new \DateTimeZone('Europe/Paris'));

            $progressBar = new ProgressBar($output, count($finder));
            $progressBar->start();
            foreach ($finder as $file) {
                $newFilename = $today->format('d_m_Y_H_i') . '-' . $file->getFilename();

                $info = new \SplFileInfo($file->getRealPath());

                $dateAt = new \DateTime();
                if($info->isFile() && $info->getCTime() !== false){
                    $dateAt->setTimestamp($info->getCTime());
                }

                $newImage = (new GaImage())
                    ->setUser($user)
                    ->setOriginalName($file->getFilename())
                    ->setFile($newFilename)
                    ->setThumbs($newFilename)
                    ->setLightbox($newFilename)
                    ->setDateAt($dateAt)
                ;

                $em->persist($newImage);

                $nb++;
                $progressBar->advance();

                if($nb%200 == 0){
                    $em->flush();
                }
            }
            $progressBar->finish();
            $em->flush();

            $progressBar = new ProgressBar($output, count($finder));
            $progressBar->start();
            foreach ($finder as $file) {
                $newFilename = $today->format('d_m_Y_H_i') . '-' . $file->getFilename();

                $originalFile = ImageWorkshop::initFromPath($file->getRealPath());
                if($originalFile->getWidth() > 280){
                    $originalFile->resizeInPixel(280, null, true);
                }
                $originalFile->save($this->galleryDirectory . $filename . '/thumbs/', $newFilename);

                $originalFile = ImageWorkshop::initFromPath($file->getRealPath());
                if($originalFile->getWidth() > 1024){
                    $originalFile->resizeInPixel(1024, null, true);
                }
                $originalFile->save($this->galleryDirectory . $filename . '/lightbox/', $newFilename);

                rename($file->getRealPath(), $extractDirectory . $newFilename);
                $nb++;
                $progressBar->advance();
            }
            $progressBar->finish();
        }


        $io->text($nb . ' images extracted');

        $io->newLine();
        $io->comment('--- [FIN DE LA COMMANDE] ---');
        return Command::SUCCESS;
    }

    protected function extractZIP(SymfonyStyle $io, $filename): bool
    {
        $file = $this->importDirectory . $filename . ".zip";

        if(!file_exists($file)){
            $io->error("L'archive n'existe pas.");
            return false;
        }

        $archive = new ZipArchive();
        if($archive->open($file)){
            $extractDirectory = $this->galleryDirectory . $filename . '/original/';

            $archive->extractTo($extractDirectory);
            $archive->close(); unset($archive);
            $io->comment("Archive " . $filename . " extracted [OK]");
        }else{
            $io->error("Erreur archive");
            return false;
        }

        return true;
    }
}
