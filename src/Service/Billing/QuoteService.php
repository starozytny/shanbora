<?php

namespace App\Service\Billing;

use App\Entity\Billing\BiQuote;
use App\Entity\Billing\BiQuotePackageTemplate;
use App\Repository\Billing\BiQuoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;

class QuoteService
{
    public function __construct(
        private EntityManagerInterface $em,
        private BiQuoteRepository $quoteRepository,
        private MailerInterface $mailer,
        private ?QuotePdfService $pdfService,
        private string $senderEmail,
        private string $senderName,
    ) {}

    public function createQuote(): BiQuote
    {
        $quote = new BiQuote();
        $quote->setReference($this->generateReference());
        $quote->setValidUntil(new \DateTime('+30 days'));

        return $quote;
    }

    public function createFromTemplate(BiQuotePackageTemplate $template): BiQuote
    {
        $quote = $this->createQuote();
        $quote->setPackageTemplate($template);
        $quote->setPackageName($template->getName());
        $quote->setTotalAmount($template->getBasePrice());
        $quote->setCustomContent($template->getDefaultContent());
        $quote->calculateDeposit();

        return $quote;
    }

    public function generateReference(): string
    {
        $year = (int)date('Y');
        $nextNumber = $this->quoteRepository->getNextReferenceNumber($year);

        return sprintf('DEV-%d-%03d', $year, $nextNumber);
    }

    public function updateStatus(BiQuote $quote, string $newStatus): void
    {
        $oldStatus = $quote->getStatus();

        // Validate transition
        if (!$this->isValidTransition($oldStatus, $newStatus)) {
            throw new \InvalidArgumentException(
                sprintf('Cannot transition from "%s" to "%s"', $oldStatus, $newStatus)
            );
        }

        $quote->setStatus($newStatus);

        // Set timestamp based on new status
        $now = new \DateTimeImmutable();
        match ($newStatus) {
            BiQuote::STATUS_SENT => $quote->setSentAt($now),
            BiQuote::STATUS_ACCEPTED => $quote->setAcceptedAt($now),
            BiQuote::STATUS_DECLINED => $quote->setDeclinedAt($now),
            default => null,
        };

        $this->em->flush();
    }

    public function isValidTransition(string $from, string $to): bool
    {
        $allowedTransitions = [
            BiQuote::STATUS_DRAFT => [BiQuote::STATUS_SENT],
            BiQuote::STATUS_SENT => [BiQuote::STATUS_ACCEPTED, BiQuote::STATUS_DECLINED, BiQuote::STATUS_DRAFT],
            BiQuote::STATUS_ACCEPTED => [BiQuote::STATUS_INVOICED, BiQuote::STATUS_DECLINED],
            BiQuote::STATUS_DECLINED => [BiQuote::STATUS_DRAFT],
            BiQuote::STATUS_INVOICED => [],
        ];

        return in_array($to, $allowedTransitions[$from] ?? []);
    }

    public function send(BiQuote $quote): void
    {
        if (!$quote->canBeSent()) {
            throw new \LogicException('This quote cannot be sent');
        }

        // Send email
        $email = (new TemplatedEmail())
            ->from(new Address($this->senderEmail, $this->senderName))
            ->to($quote->getClientEmail())
            ->subject(sprintf('Devis %s - %s', $quote->getReference(), $this->senderName))
            ->htmlTemplate('emails/quote.html.twig')
            ->context([
                'quote' => $quote,
            ]);

        if ($this->pdfService) {
            $pdfContent = $this->pdfService->generate($quote);
            $filename = $this->pdfService->getFilename($quote);
            $email->attach($pdfContent, $filename, 'application/pdf');
        }

        $this->mailer->send($email);

        $this->updateStatus($quote, BiQuote::STATUS_SENT);
    }

    public function duplicate(BiQuote $original): BiQuote
    {
        $quote = new BiQuote();
        $quote->setReference($this->generateReference());
        $quote->setValidUntil(new \DateTime('+30 days'));

        // Copy client info
        $quote->setClientFirstName($original->getClientFirstName());
        $quote->setClientLastName($original->getClientLastName());
        $quote->setClientEmail($original->getClientEmail());
        $quote->setClientPhone($original->getClientPhone());
        $quote->setClientAddress($original->getClientAddress());

        // Copy event info
        $quote->setEventDate($original->getEventDate());
        $quote->setEventLocation($original->getEventLocation());
        $quote->setEventType($original->getEventType());

        // Copy package info
        $quote->setPackageTemplate($original->getPackageTemplate());
        $quote->setPackageName($original->getPackageName());
        $quote->setCustomContent($original->getCustomContent());
        $quote->setTotalAmount($original->getTotalAmount());
        $quote->setDepositPercentage($original->getDepositPercentage());
        $quote->calculateDeposit();

        // Copy notes (not internal notes)
        $quote->setNotes($original->getNotes());

        return $quote;
    }

    public function save(BiQuote $quote): void
    {
        $this->em->persist($quote);
        $this->em->flush();
    }

    public function delete(BiQuote $quote): void
    {
        if (!$quote->isDraft()) {
            throw new \LogicException('Only draft quotes can be deleted');
        }

        $this->em->remove($quote);
        $this->em->flush();
    }

    public function getAvailableTransitions(BiQuote $quote): array
    {
        $transitions = [];

        if ($quote->canBeSent()) {
            $transitions[] = BiQuote::STATUS_SENT;
        }
        if ($quote->canBeAccepted()) {
            $transitions[] = BiQuote::STATUS_ACCEPTED;
        }
        if ($quote->canBeDeclined()) {
            $transitions[] = BiQuote::STATUS_DECLINED;
        }
        if ($quote->canBeInvoiced()) {
            $transitions[] = BiQuote::STATUS_INVOICED;
        }
        if ($quote->isSent() || $quote->isDeclined()) {
            $transitions[] = BiQuote::STATUS_DRAFT; // Allow reverting to draft
        }

        return $transitions;
    }
}
