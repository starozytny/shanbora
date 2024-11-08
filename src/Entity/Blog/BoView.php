<?php

namespace App\Entity\Blog;

use App\Repository\Blog\BoViewRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BoViewRepository::class)]
class BoView
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $nbUnique = 0;

    #[ORM\Column]
    private ?int $nbTotal = 0;

    #[ORM\Column]
    private ?int $adventureId = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNbUnique(): ?int
    {
        return $this->nbUnique;
    }

    public function setNbUnique(int $nbUnique): static
    {
        $this->nbUnique = $nbUnique;

        return $this;
    }

    public function getNbTotal(): ?int
    {
        return $this->nbTotal;
    }

    public function setNbTotal(int $nbTotal): static
    {
        $this->nbTotal = $nbTotal;

        return $this;
    }

    public function getAdventureId(): ?int
    {
        return $this->adventureId;
    }

    public function setAdventureId(int $adventureId): static
    {
        $this->adventureId = $adventureId;

        return $this;
    }
}
