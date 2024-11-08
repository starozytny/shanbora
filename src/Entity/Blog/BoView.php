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
    private ?int $nbUnique = null;

    #[ORM\Column]
    private ?int $nbTotal = null;

    #[ORM\Column]
    private ?int $blogId = null;

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

    public function getBlogId(): ?int
    {
        return $this->blogId;
    }

    public function setBlogId(int $blogId): static
    {
        $this->blogId = $blogId;

        return $this;
    }
}
