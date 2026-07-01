<?php

namespace App\Entity\Billing;

use App\Repository\Billing\BiQuoteRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BiQuoteRepository::class)]
class BiQuote
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SENT = 'sent';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_DECLINED = 'declined';
    public const STATUS_INVOICED = 'invoiced';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_SENT,
        self::STATUS_ACCEPTED,
        self::STATUS_DECLINED,
        self::STATUS_INVOICED,
    ];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20, unique: true)]
    private ?string $reference = null;

    #[ORM\Column(length: 20)]
    private ?string $status = self::STATUS_DRAFT;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le prénom est obligatoire')]
    #[Assert\Length(max: 100)]
    private ?string $clientFirstname = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire')]
    #[Assert\Length(max: 100)]
    private ?string $clientLastname = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\NotBlank(message: "L'email est obligatoire")]
    #[Assert\Email(message: "L'email n'est pas valide")]
    private ?string $clientEmail = null;

    #[ORM\Column(length: 40, nullable: true)]
    private ?string $clientPhone = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $clientAddress = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $eventDate = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $eventLocation = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $eventType = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $packageName = null;

    #[ORM\Column]
    private array $customContent = [];

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Assert\NotBlank(message: 'Le montant total est obligatoire')]
    #[Assert\Positive(message: 'Le montant doit être positif')]
    private ?string $totalAmount = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $depositAmount = null;

    #[ORM\Column(type: Types::SMALLINT, nullable: true)]
    private ?int $depositPercentage = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $internalNotes = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $validUntil = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $sentAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $acceptedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $declinedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?BiQuotePackageTemplate $packageTemplate = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->depositPercentage = 30;
    }

    public function getClientFullName(): string
    {
        return trim($this->clientFirstname . ' ' . $this->clientLastname);
    }

    public function calculateDeposit(): void
    {
        if ($this->totalAmount && $this->depositPercentage) {
            $this->depositAmount = bcmul($this->totalAmount, bcdiv((string)$this->depositPercentage, '100', 4), 2);
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getReference(): ?string
    {
        return $this->reference;
    }

    public function setReference(string $reference): static
    {
        $this->reference = $reference;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        if (!in_array($status, self::STATUSES)) {
            throw new \InvalidArgumentException('Invalid status');
        }

        $this->status = $status;

        return $this;
    }

    public function getClientFirstname(): ?string
    {
        return $this->clientFirstname;
    }

    public function setClientFirstname(string $clientFirstname): static
    {
        $this->clientFirstname = $clientFirstname;

        return $this;
    }

    public function getClientLastname(): ?string
    {
        return $this->clientLastname;
    }

    public function setClientLastname(string $clientLastname): static
    {
        $this->clientLastname = $clientLastname;

        return $this;
    }

    public function getClientEmail(): ?string
    {
        return $this->clientEmail;
    }

    public function setClientEmail(?string $clientEmail): static
    {
        $this->clientEmail = $clientEmail;

        return $this;
    }

    public function getClientPhone(): ?string
    {
        return $this->clientPhone;
    }

    public function setClientPhone(?string $clientPhone): static
    {
        $this->clientPhone = $clientPhone;

        return $this;
    }

    public function getClientAddress(): ?string
    {
        return $this->clientAddress;
    }

    public function setClientAddress(?string $clientAddress): static
    {
        $this->clientAddress = $clientAddress;

        return $this;
    }

    public function getEventDate(): ?\DateTime
    {
        return $this->eventDate;
    }

    public function setEventDate(?\DateTime $eventDate): static
    {
        $this->eventDate = $eventDate;

        return $this;
    }

    public function getEventLocation(): ?string
    {
        return $this->eventLocation;
    }

    public function setEventLocation(?string $eventLocation): static
    {
        $this->eventLocation = $eventLocation;

        return $this;
    }

    public function getEventType(): ?string
    {
        return $this->eventType;
    }

    public function setEventType(?string $eventType): static
    {
        $this->eventType = $eventType;

        return $this;
    }

    public function getPackageName(): ?string
    {
        return $this->packageName;
    }

    public function setPackageName(?string $packageName): static
    {
        $this->packageName = $packageName;

        return $this;
    }

    public function getCustomContent(): array
    {
        return $this->customContent;
    }

    public function setCustomContent(array $customContent): static
    {
        $this->customContent = $customContent;

        return $this;
    }

    public function getTotalAmount(): ?string
    {
        return $this->totalAmount;
    }

    public function setTotalAmount(string $totalAmount): static
    {
        $this->totalAmount = $totalAmount;

        return $this;
    }

    public function getDepositAmount(): ?string
    {
        return $this->depositAmount;
    }

    public function setDepositAmount(?string $depositAmount): static
    {
        $this->depositAmount = $depositAmount;

        return $this;
    }

    public function getDepositPercentage(): ?int
    {
        return $this->depositPercentage;
    }

    public function setDepositPercentage(?int $depositPercentage): static
    {
        $this->depositPercentage = $depositPercentage;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;

        return $this;
    }

    public function getInternalNotes(): ?string
    {
        return $this->internalNotes;
    }

    public function setInternalNotes(?string $internalNotes): static
    {
        $this->internalNotes = $internalNotes;

        return $this;
    }

    public function getValidUntil(): ?\DateTime
    {
        return $this->validUntil;
    }

    public function setValidUntil(?\DateTime $validUntil): static
    {
        $this->validUntil = $validUntil;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getSentAt(): ?\DateTimeImmutable
    {
        return $this->sentAt;
    }

    public function setSentAt(?\DateTimeImmutable $sentAt): static
    {
        $this->sentAt = $sentAt;

        return $this;
    }

    public function getAcceptedAt(): ?\DateTimeImmutable
    {
        return $this->acceptedAt;
    }

    public function setAcceptedAt(?\DateTimeImmutable $acceptedAt): static
    {
        $this->acceptedAt = $acceptedAt;

        return $this;
    }

    public function getDeclinedAt(): ?\DateTimeImmutable
    {
        return $this->declinedAt;
    }

    public function setDeclinedAt(?\DateTimeImmutable $declinedAt): static
    {
        $this->declinedAt = $declinedAt;

        return $this;
    }

    public function getPackageTemplate(): ?BiQuotePackageTemplate
    {
        return $this->packageTemplate;
    }

    public function setPackageTemplate(?BiQuotePackageTemplate $packageTemplate): static
    {
        $this->packageTemplate = $packageTemplate;

        return $this;
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function isSent(): bool
    {
        return $this->status === self::STATUS_SENT;
    }

    public function isAccepted(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }

    public function isDeclined(): bool
    {
        return $this->status === self::STATUS_DECLINED;
    }

    public function isInvoiced(): bool
    {
        return $this->status === self::STATUS_INVOICED;
    }

    public function isExpired(): bool
    {
        if (!$this->validUntil) {
            return false;
        }
        return $this->validUntil < new \DateTime('today');
    }

    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function canBeSent(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function canBeAccepted(): bool
    {
        return $this->status === self::STATUS_SENT && !$this->isExpired();
    }

    public function canBeDeclined(): bool
    {
        return $this->status === self::STATUS_SENT;
    }

    public function canBeInvoiced(): bool
    {
        return $this->status === self::STATUS_ACCEPTED;
    }
}
