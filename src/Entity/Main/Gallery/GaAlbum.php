<?php

namespace App\Entity\Main\Gallery;

use App\Entity\DataEntity;
use App\Entity\Main\User;
use App\Repository\Main\Gallery\GaAlbumRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: GaAlbumRepository::class)]
class GaAlbum extends DataEntity
{
    const FORM = ['gallery_form'];

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['gallery_form'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['gallery_form'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['gallery_form'])]
    private ?\DateTimeInterface $dateAt = null;

    #[ORM\Column]
    private ?int $nbDownload = 0;

    #[ORM\ManyToOne(inversedBy: 'gaAlbums')]
    private ?User $user = null;

    /**
     * @var Collection<int, GaImage>
     */
    #[ORM\OneToMany(mappedBy: 'album', targetEntity: GaImage::class)]
    private Collection $images;

    #[ORM\Column(length: 255)]
    private ?string $slug = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $cover = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $archive = null;

    public function __construct()
    {
        $this->images = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

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

    /**
     * @return Collection<int, GaImage>
     */
    public function getImages(): Collection
    {
        return $this->images;
    }

    public function addImage(GaImage $image): static
    {
        if (!$this->images->contains($image)) {
            $this->images->add($image);
            $image->setAlbum($this);
        }

        return $this;
    }

    public function removeImage(GaImage $image): static
    {
        if ($this->images->removeElement($image)) {
            // set the owning side to null (unless already changed)
            if ($image->getAlbum() === $this) {
                $image->setAlbum(null);
            }
        }

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getCover(): ?string
    {
        return $this->cover;
    }

    public function setCover(?string $cover): static
    {
        $this->cover = $cover;

        return $this;
    }

    public function getArchive(): ?string
    {
        return $this->archive;
    }

    public function setArchive(?string $archive): static
    {
        $this->archive = $archive;

        return $this;
    }
}
