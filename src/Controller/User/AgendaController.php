<?php

namespace App\Controller\User;

use App\Entity\User;
use App\Service\CalendarService;
use App\Service\SerializeData;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/espace-utilisateur/agenda", name="user_agenda_")
 */
class AgendaController extends AbstractController
{
    const ATTRIBUTES_DATE = [];
    const ATTRIBUTES_EVENT = ['id', 'startAtString', 'endAtString', 'startAtDayNumberWeek', 'startAtTimeString', 'endAtTimeString', 'name', 'content',
                              'users' => ['id', 'username', 'avatar']];

    /**
     * @Route("/", name="index")
     */
    public function index(CalendarService $calendarService, SerializeData $serializer)
    {
        $week = $calendarService->getThisWeek();
        $today = $calendarService->getToday();
        /** @var User $user */
        $user = $this->getUser();
        $userEvents = $user->getAgendaEvents();

        //get only events for this week
        $numbersWeek = $calendarService->getNumbersWeek($week);
        $yearsWeek = $calendarService->getYearsWeek($week);
        $events = [];

        foreach($userEvents as $event){
            $start = $event->getStartAtNumberYear();
            $startYear = $event->getStartAtYear();

            //if event start date is between numberStart et numberEnd week + start date year is yearStart or yearEnd
            //OR event end date is between numberStart et numberEnd week + end date year is yearStart or yearEnd
            if( ($start >= $numbersWeek[0] && $start <= $numbersWeek[1]) && ($startYear == $yearsWeek[0] || $startYear == $yearsWeek[1]) ){
                array_push($events, $event);
            }
        }

        $week = $serializer->getSerializeData($week, self::ATTRIBUTES_DATE);
        $today = $serializer->getSerializeData($today, self::ATTRIBUTES_DATE);
        $events = $serializer->getSerializeData($events, self::ATTRIBUTES_EVENT);

        dump($events);

        return $this->render('root/user/pages/agenda/index.html.twig', [
            'week' => $week,
            'today' => $today,
            'events' => $events
        ]);
    }
}
