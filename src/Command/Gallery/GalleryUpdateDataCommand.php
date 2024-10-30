<?php

namespace App\Command\Gallery;

use App\Entity\Main\Gallery\GaAlbum;
use App\Entity\Main\Gallery\GaImage;
use App\Entity\Main\User;
use App\Service\DatabaseService;
use App\Service\SanitizeData;
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
    private SanitizeData $sanitizeData;

    public function __construct(DatabaseService $databaseService, $galleryArchiveDirectory, $galleryImagesDirectory, SanitizeData $sanitizeData)
    {
        parent::__construct();

        $this->em = $databaseService->getDefaultManager();
        $this->importDirectory = $galleryArchiveDirectory;
        $this->galleryDirectory = $galleryImagesDirectory;
        $this->sanitizeData = $sanitizeData;
    }

    protected function configure(): void
    {
        $this
            ->addArgument('username', InputArgument::REQUIRED, 'user username')
            ->addArgument('archive', InputArgument::REQUIRED, 'gallery archive')
        ;
    }

    /**
     * @throws ImageWorkshopException
     * @throws ImageWorkshopLayerException
     */
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $username = $input->getArgument('username');
        $filename = $input->getArgument('archive');

        $io->title("Extraction de l'archive");

        $extractDirectory = $this->galleryDirectory . $username . "/" . $filename . '/original/';
        if(!is_dir($extractDirectory)){
            mkdir($extractDirectory, 0777, true);
        }
        $thumbsDirectory = $this->galleryDirectory . $username . "/" . $filename . '/thumbs/';
        if(!is_dir($thumbsDirectory)){
            mkdir($thumbsDirectory, 0777, true);
        }
        $lightboxDirectory = $this->galleryDirectory . $username . "/" . $filename . '/lightbox/';
        if(!is_dir($lightboxDirectory)){
            mkdir($lightboxDirectory, 0777, true);
        }

        $nb = 0;
        if($this->extractZIP($io, $username, $filename)){
            $em = $this->em;

            $user = $em->getRepository(User::class)->findOneBy(['username' => $username]);
            if(!$user){
                $io->error('User not found');
                return Command::FAILURE;
            }

            $io->title("Suppression des images existantes");

            $album = $em->getRepository(GaAlbum::class)->findOneBy(['user' => $user, 'archive' => $filename]);
            if(!$album){
                $album = (new GaAlbum())
                    ->setTitle($filename)
                    ->setDateAt(new \DateTime())
                    ->setSlug($this->sanitizeData->slugString($filename))
                    ->setArchive($filename)
                    ->setUser($user)
                ;
            }

            $files = $album->getImages();

            $nb = 0;
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

            $io->newLine();

            $finder = new Finder();
            $finder->files()->in($extractDirectory)->name('/\.(jpg|jpeg|png|gif)$/i');

            $today = new \DateTime();
            $today->setTimezone(new \DateTimeZone('Europe/Paris'));
            $dateToday = $today->format('d_m_Y_H_i');

            $progressBar = new ProgressBar($output, count($finder));
            $progressBar->start();
            foreach ($finder as $file) {
                $newFilename = $dateToday . '-' . $file->getFilename();

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
                    ->setAlbum($album)
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

            $io->newLine();
            $io->newLine();

            $progressBar = new ProgressBar($output, count($finder));
            $progressBar->start();
            foreach ($finder as $file) {
                $newFilename = $dateToday . '-' . $file->getFilename();

                $originalFile = ImageWorkshop::initFromPath($file->getRealPath());
                if($originalFile->getWidth() > 280){
                    $originalFile->resizeInPixel(280, null, true);
                }
                $originalFile->save($thumbsDirectory, $newFilename);

                $originalFile = ImageWorkshop::initFromPath($file->getRealPath());
                if($originalFile->getWidth() > 1024){
                    $originalFile->resizeInPixel(1024, null, true);
                }
                $originalFile->save($lightboxDirectory, $newFilename);

                rename($file->getRealPath(), $extractDirectory . $newFilename);
                $nb++;
                $progressBar->advance();
            }
            $progressBar->finish();
        }

        $io->newLine();
        $io->text($nb . ' images extracted');

        $io->newLine();
        $io->comment('--- [FIN DE LA COMMANDE] ---');
        return Command::SUCCESS;
    }

    protected function extractZIP(SymfonyStyle $io, $username, $filename): bool
    {
        $file = $this->importDirectory . $username . "/" . $filename . ".zip";

        if(!file_exists($file)){
            $io->error("L'archive n'existe pas.");
            return false;
        }

        $archive = new ZipArchive();
        if($archive->open($file)){
            $extractDirectory = $this->galleryDirectory . $username . "/" . $filename . '/original/';

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
