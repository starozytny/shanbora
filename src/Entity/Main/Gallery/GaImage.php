<?php

namespace App\Entity\Main\Gallery;

use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaImageRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GaImageRepository::class)]
class GaImage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $file = null;

    #[ORM\Column(length: 255)]
    private ?string $thumbs = null;

    #[ORM\Column]
    private ?int $nbDownload = null;

    #[ORM\ManyToOne(inversedBy: 'gaImages')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

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
}
