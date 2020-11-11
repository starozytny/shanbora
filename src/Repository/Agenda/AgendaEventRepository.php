<?php

namespace App\Repository\Agenda;

use App\Entity\Agenda\AgendaEvent;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method AgendaEvent|null find($id, $lockMode = null, $lockVersion = null)
 * @method AgendaEvent|null findOneBy(array $criteria, array $orderBy = null)
 * @method AgendaEvent[]    findAll()
 * @method AgendaEvent[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AgendaEventRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AgendaEvent::class);
    }

    // /**
    //  * @return AgendaEvent[] Returns an array of AgendaEvent objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('a.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?AgendaEvent
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
