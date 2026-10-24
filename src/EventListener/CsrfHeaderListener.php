<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * Lightweight CSRF defense for the InternApi/Admin JSON endpoints: a plain
 * cross-site <form> submission cannot set custom headers, so requiring one
 * on every authenticated write request blocks classic CSRF without needing
 * a per-form token. Anonymous requests are left alone since there is no
 * authenticated session to hijack (contact form, blog comments, password
 * reset request...).
 */
class CsrfHeaderListener
{
    private const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
    private const PROTECTED_PATH_PREFIXES = ['/intern/api', '/admin'];

    private TokenStorageInterface $tokenStorage;

    public function __construct(TokenStorageInterface $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        if (!in_array($request->getMethod(), self::PROTECTED_METHODS, true)) {
            return;
        }

        $path = $request->getPathInfo();
        $isProtectedPath = false;
        foreach (self::PROTECTED_PATH_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                $isProtectedPath = true;
                break;
            }
        }
        if (!$isProtectedPath) {
            return;
        }

        $token = $this->tokenStorage->getToken();
        if (!$token || !$token->getUser()) {
            return;
        }

        if ($request->headers->get('X-Requested-With') !== 'XMLHttpRequest') {
            $event->setResponse(new JsonResponse(
                ['message' => "Requête refusée : en-tête requis manquant."],
                Response::HTTP_FORBIDDEN
            ));
        }
    }
}
