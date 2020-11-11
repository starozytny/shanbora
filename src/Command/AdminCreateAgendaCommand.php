<?php

namespace App\Command;

use App\Entity\Agenda\AgendaEvent;
use App\Entity\User;
use DateTime;
use Doctrine\DBAL\DBALException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class AdminCreateAgendaCommand extends Command
{
    protected static $defaultName = 'admin:create:agenda';
    protected $em;

    public function __construct(EntityManagerInterface $entityManager)
    {
        parent::__construct();

        $this->em = $entityManager;
    }
    protected function configure()
    {
        $this
            ->setDescription('Create fake agenda event')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Reset des tables');
        $this->resetTable($io,'agenda_event_user');
        $this->resetTable($io,'agenda_event');

        $user = $this->em->getRepository(User::class)->findOneBy(['username' => 'shanbo']);

        $io->title('Création des agenda events fake');
        for($i=0; $i<5 ; $i++) {
            $new = (new AgendaEvent())
                ->setName("Evenement " . $i)
                ->setStartAt(new DateTime(date('d-m-Y\\TH:i:0', strtotime('22 October 2020 8:00:00'))))
                ->setEndAt(new DateTime(date('d-m-Y\\TH:i:0', strtotime('22 October 2020 10:00:00'))))
                ->setContent("Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. 
                        Sed odio lectus, lacinia vel lectus ut, ultricies sodales odio. Sed posuere sit amet tellus el
                        eifend porta. Aenean sit amet elit eget neque scelerisque sagittis elementum quis nibh. Pellen
                        tesque vehicula nisi vel interdum laoreet. Interdum et malesuada fames ac ante ipsum primis in 
                        faucibus. Proin non felis vulputate, imperdiet felis eget, suscipit tellus. Mauris nec augue es
                        t. Nam sit amet nunc aliquet, consectetur elit eget, sodales est. Duis consequat ultrices lect
                        us ac faucibus.
                ")
                ->addUser($user)
            ;

            $this->em->persist($new);
            $io->text('Agenda : ' . "Event " . $i . ' créé' );
        }

        
        $this->em->flush();

        
        $io->comment('--- [FIN DE LA COMMANDE] ---');

        return 0;
    }

    protected function resetTable(SymfonyStyle $io, $item)
    {
        $connection = $this->em->getConnection();

        $connection->beginTransaction();
        try {
            $connection->query('SET FOREIGN_KEY_CHECKS=0');
            $connection->executeUpdate(
                $connection->getDatabasePlatform()->getTruncateTableSQL(
                    $item, true
                )
            );
            $connection->query('SET FOREIGN_KEY_CHECKS=1');
            $connection->commit();

        } catch (DBALException $e) {
            $io->error('Reset [FAIL] : ' . $e);
        }
        $io->text('Reset [OK]');
    }
}
