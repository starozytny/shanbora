<?php

namespace App\Entity\Main\Gallery;

use App\Entity\DataEntity;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaImageRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: GaImageRepository::class)]
class GaImage extends DataEntity
{
    const LIST = ['ga_img_list'];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['ga_img_list'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $file = null;

    #[ORM\Column(length: 255)]
    private ?string $thumbs = null;

    #[ORM\Column(length: 255)]
    private ?string $lightbox = null;

    #[ORM\Column]
    #[Groups(['ga_img_list'])]
    private ?int $nbDownload = 0;

    #[ORM\ManyToOne(inversedBy: 'gaImages')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 255)]
    #[Groups(['ga_img_list'])]
    private ?string $originalName = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $dateAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFile(): ?string
    {
        return $this->file;
    }

    public function setFile(string $file): static
    {
        $this->file = $file;

        return $this;
    }

    public function getThumbs(): ?string
    {
        return $this->thumbs;
    }

    public function setThumbs(string $thumbs): static
    {
        $this->thumbs = $thumbs;

        return $this;
    }

    public function getLightbox(): ?string
    {
        return $this->lightbox;
    }

    public function setLightbox(string $lightbox): static
    {
        $this->lightbox = $lightbox;

        return $this;
    }

    public function getNbDownload(): ?int
    {
        return $this->nbDownload;
    }

    public function setNbDownload(int $nbDownload): static
    {
        $this->nbDownload = $nbDownload;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getOriginalName(): ?string
    {
        return $this->originalName;
    }

    public function setOriginalName(string $originalName): static
    {
        $this->originalName = $originalName;

        return $this;
    }

    public function getDateAt(): ?\DateTimeInterface
    {
        return $this->dateAt;
    }

    public function setDateAt(\DateTimeInterface $dateAt): static
    {
        $this->dateAt = $dateAt;

        return $this;
    }

    public function getFileFile(): ?string
    {
        return $this->getFileOrDefault($this->file, $this->user->getUsername() . '/original', null);
    }

    public function getThumbsFile(): ?string
    {
        return $this->getFileOrDefault($this->thumbs, $this->user->getUsername() . '/thumbs', null);
    }

    public function getLightboxFile(): ?string
    {
        return $this->getFileOrDefault($this->lightbox, $this->user->getUsername() . '/lightbox', null);
    }
}
