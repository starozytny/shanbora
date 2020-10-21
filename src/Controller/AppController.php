<?php

namespace App\Controller;

use App\Entity\Contact;
use App\Entity\Newsletter;
use App\Entity\Rgpd;
use App\Service\Mailer;
use App\Service\SettingsService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class AppController extends AbstractController
{
    /**
     * @Route("/", options={"expose"=true}, name="app_homepage")
     */
    public function index()
    {
        return $this->render('root/app/index.html.twig');
    }
    /**
     * @Route("/legales/mentions-legales", options={"expose"=true}, name="app_mentions")
     */
    public function mentions()
    {
        return $this->render('root/app/pages/legales/mentions.html.twig');
    }
    /**
     * @Route("/legales/politique-confidentialite", options={"expose"=true}, name="app_politique")
     */
    public function politique()
    {
        return $this->render('root/app/pages/legales/politique.html.twig');
    }
    /**
     * @Route("/legales/gestion-cookies", options={"expose"=true}, name="app_cookies")
     */
    public function cookies()
    {
        return $this->render('root/app/pages/legales/cookies.html.twig');
    }
    /**
     * @Route("/legales/demande-rgpd", options={"expose"=true}, name="app_rgpd")
     */
    public function rgpd(Request $request, Mailer $mailer, SettingsService $settingsService)
    {
        $em = $this->getDoctrine()->getManager();

        if($request->isMethod("POST")){
            $data = json_decode($request->getContent());
            $firstname = $data->firstname->value;
            $email = $data->email->value;
            $subject = $data->subject->value;
            $message = $data->message->value;

            $demande = (new Rgpd())
                ->setFirstname($firstname)
                ->setEmail($email)
                ->setSubject($subject)
                ->setMessage($message)
            ;

            // Send mail       
            if($mailer->sendMail(
                'Demande RGPD via le site ' . $settingsService->getWebsiteName(),
                'Demande RGPD',
                'root/app/email/legales/rgpd.html.twig',
                ['demande' => $demande, 'settings' => $settingsService->getSettings()],
                $settingsService->getEmailRgpd()
            ) != true){
                return new JsonResponse([
                    'code' => 2,
                    'errors' => [ 'error' => 'Le service est indisponible', 'success' => '' ]
                ]);
            }

            $em->persist($demande); $em->flush();

            return new JsonResponse(['code' => 1, 'message' => 'La demande a été envoyé.']);
        }

        return $this->render('root/app/pages/legales/rgpd.html.twig');
    }
    /**
     * @Route("/nous-contacter", options={"expose"=true}, name="app_contact")
     */
    public function contact(Request $request, Mailer $mailer, SettingsService $settingsService)
    {
        $em = $this->getDoctrine()->getManager();

        if($request->isMethod("POST")){
            $data = json_decode($request->getContent());
            $firstname = $data->firstname->value;
            $email = $data->email->value;
            $message = $data->message->value;

            $demande = (new Contact())
                ->setFirstname($firstname)
                ->setEmail($email)
                ->setMessage($message)
            ;

            // Send mail       
            if($mailer->sendMail(
                'Demande de contact via le site ' . $settingsService->getWebsiteName(),
                'Demande contact',
                'root/app/email/contact/index.html.twig',
                ['contact' => $demande, 'settings' => $settingsService->getSettings()],
                $settingsService->getEmailContact()
            ) != true){
                return new JsonResponse([
                    'code' => 2,
                    'errors' => [ 'error' => 'Le service est indisponible', 'success' => '' ]
                ]);
            }

            $em->persist($demande); $em->flush();

            return new JsonResponse(['code' => 1, 'message' => 'La demande a été envoyé.']);
        }

        return $this->render('root/app/pages/contact/index.html.twig');
    }

    /**
     * @Route("/newsletter", options={"expose"=true}, name="app_newsletter")
     */
    public function newsletter(Request $request)
    {
        $em = $this->getDoctrine()->getManager();

        $data = json_decode($request->getContent());
        $email = $data->email->value;

        $existe = $em->getRepository(Newsletter::class)->findOneBy(['email' => $email]);
        if($existe){
            return new JsonResponse(['code' => 0, 'message' => 'Merci, mais j\'ai déjà ton adresse-email ! A bientôt !']);
        }

        $demande = (new Newsletter())
            ->setEmail($email)
        ;

        $em->persist($demande); $em->flush();

        return new JsonResponse(['code' => 1, 'message' => 'Super ! A bientôt pour les mises à jours !']);
    }
}
