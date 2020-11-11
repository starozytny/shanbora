<?php

namespace App\Entity\Agenda;

use App\Entity\User;
use App\Repository\Agenda\AgendaEventRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=AgendaEventRepository::class)
 */
class AgendaEvent
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="datetime")
     */
    private $startAt;

    /**
     * @ORM\Column(type="datetime")
     */
    private $endAt;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $content;

    /**
     * @ORM\ManyToMany(targetEntity=User::class, inversedBy="agendaEvents")
     */
    private $users;

    public function __construct()
    {
        $this->users = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStartAt(): ?\DateTimeInterface
    {
        return $this->startAt;
    }

    public function setStartAt(\DateTimeInterface $startAt): self
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt(): ?\DateTimeInterface
    {
        return $this->endAt;
    }

    public function setEndAt(\DateTimeInterface $endAt): self
    {
        $this->endAt = $endAt;

        return $this;
    }

    public function getDayFr($datetime){
        $d = date_format($datetime, 'l');
        switch ($d){
            case 'Monday':
                return 'Lundi';
            case 'Tuesday':
                return 'Mardi';
            case 'Wednesday':
                return 'Mercredi';
            case 'Thursday':
                return 'Jeudi';
            case 'Friday':
                return 'Vendredi';
            case 'Saturday':
                return 'Samedi';
            case 'Sunday':
                return 'Dimanche';
        }
    }

    public function getMonthFr($datetime){
        $m = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        $d = date_format($datetime, 'n');

        return $m[intval($d)];
    }

    public function getStartAtString()
    {
        return date_format($this->getStartAt(), 'd-m-Y');
    }

    public function getEndAtString()
    {
        return date_format($this->getEndAt(), 'd-m-Y');
    }

    public function getStartAtTimeString()
    {
        return date_format($this->getStartAt(), 'H:i');
    }

    public function getEndAtTimeString()
    {
        return date_format($this->getEndAt(), 'H:i');
    }

    public function getStartAtYear()
    {
        return intval(date_format($this->getStartAt(), 'Y'));
    }

    public function getStartAtNumberYear()
    {
        return intval(date_format($this->getStartAt(), 'z'));
    }

    public function getStartAtDayNumberWeek()
    {
        return intval(date_format($this->getStartAt(), 'N'));
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(?string $content): self
    {
        $this->content = $content;

        return $this;
    }

    /**
     * @return Collection|User[]
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): self
    {
        if (!$this->users->contains($user)) {
            $this->users[] = $user;
        }

        return $this;
    }

    public function removeUser(User $user): self
    {
        if ($this->users->contains($user)) {
            $this->users->removeElement($user);
        }

        return $this;
    }
}
