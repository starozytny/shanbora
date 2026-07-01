<?php

namespace App\Repository\Billing;

use App\Entity\Billing\BiQuote;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<BiQuote>
 */
class BiQuoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BiQuote::class);
    }

    /**
     * @return BiQuote[]
     */
    public function findAllOrderedByDate(): array
    {
        return $this->createQueryBuilder('q')
            ->orderBy('q.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return BiQuote[]
     */
    public function findByStatus(string $status): array
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.status = :status')
            ->setParameter('status', $status)
            ->orderBy('q.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return BiQuote[]
     */
    public function findByStatusIn(array $statuses): array
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.status IN (:statuses)')
            ->setParameter('statuses', $statuses)
            ->orderBy('q.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByReference(string $reference): ?BiQuote
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.reference = :reference')
            ->setParameter('reference', $reference)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return BiQuote[]
     */
    public function findExpiredSentQuotes(): array
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.status = :status')
            ->andWhere('q.validUntil < :today')
            ->setParameter('status', BiQuote::STATUS_SENT)
            ->setParameter('today', new \DateTime('today'))
            ->getQuery()
            ->getResult();
    }

    /**
     * @return BiQuote[]
     */
    public function findByClientEmail(string $email): array
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.clientEmail = :email')
            ->setParameter('email', $email)
            ->orderBy('q.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Search quotes by client name, email, or reference
     * @return BiQuote[]
     */
    public function search(string $query): array
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.reference LIKE :query OR q.clientFirstName LIKE :query OR q.clientLastName LIKE :query OR q.clientEmail LIKE :query')
            ->setParameter('query', '%' . $query . '%')
            ->orderBy('q.createdAt', 'DESC')
            ->setMaxResults(50)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return BiQuote[]
     */
    public function findByEventDateRange(\DateTimeInterface $start, \DateTimeInterface $end): array
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.eventDate >= :start')
            ->andWhere('q.eventDate <= :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->orderBy('q.eventDate', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function getNextReferenceNumber(int $year): int
    {
        $result = $this->createQueryBuilder('q')
            ->select('q.reference')
            ->andWhere('q.reference LIKE :pattern')
            ->setParameter('pattern', 'DEV-' . $year . '-%')
            ->orderBy('q.reference', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$result) {
            return 1;
        }

        // Extract number from reference like "DEV-2025-001"
        $parts = explode('-', $result['reference']);
        return (int)end($parts) + 1;
    }

    public function getStatsByStatus(): array
    {
        $result = $this->createQueryBuilder('q')
            ->select('q.status, COUNT(q.id) as count, SUM(q.totalAmount) as total')
            ->groupBy('q.status')
            ->getQuery()
            ->getResult();

        $stats = [];
        foreach ($result as $row) {
            $stats[$row['status']] = [
                'count' => (int)$row['count'],
                'total' => $row['total'] ? (float)$row['total'] : 0,
            ];
        }

        return $stats;
    }

    public function getStatsForYear(int $year): array
    {
        $start = new \DateTime("$year-01-01");
        $end = new \DateTime("$year-12-31 23:59:59");

        return $this->createQueryBuilder('q')
            ->select('q.status, COUNT(q.id) as count, SUM(q.totalAmount) as total')
            ->andWhere('q.createdAt >= :start')
            ->andWhere('q.createdAt <= :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->groupBy('q.status')
            ->getQuery()
            ->getResult();
    }

    public function save(BiQuote $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(BiQuote $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
