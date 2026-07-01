<?php

namespace App\Controller\InternApi\Billing;

use App\Entity\Billing\BiQuote;
use App\Entity\Billing\BiQuotePackageTemplate;
use App\Repository\Billing\BiQuotePackageTemplateRepository;
use App\Repository\Billing\BiQuoteRepository;
use App\Service\Billing\QuotePdfService;
use App\Service\Billing\QuoteService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/intern/api/quotes', name: 'api_quotes_')]
class QuoteController extends AbstractController
{
    public function __construct(
        private BiQuoteRepository $quoteRepository,
        private BiQuotePackageTemplateRepository $templateRepository,
        private QuoteService $quoteService,
        private QuotePdfService $pdfService,
        private ValidatorInterface $validator,
    ) {}

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $status = $request->query->get('status');
        $search = $request->query->get('search');

        if ($search) {
            $quotes = $this->quoteRepository->search($search);
        } elseif ($status) {
            $quotes = $this->quoteRepository->findByStatus($status);
        } else {
            $quotes = $this->quoteRepository->findAllOrderedByDate();
        }

        return $this->json([
            'data' => array_map([$this, 'serializeQuote'], $quotes),
        ]);
    }

    #[Route('/stats', name: 'stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $stats = $this->quoteRepository->getStatsByStatus();

        return $this->json([
            'data' => $stats,
        ]);
    }

    #[Route('/templates', name: 'templates', methods: ['GET'])]
    public function templates(): JsonResponse
    {
        $templates = $this->templateRepository->findAllActive();

        return $this->json([
            'data' => array_map([$this, 'serializeTemplate'], $templates),
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Create from template or blank
        if (!empty($data['templateId'])) {
            $template = $this->templateRepository->find($data['templateId']);
            if (!$template) {
                return $this->json(['error' => 'Template not found'], Response::HTTP_NOT_FOUND);
            }
            $quote = $this->quoteService->createFromTemplate($template);
        } else {
            $quote = $this->quoteService->createQuote();
        }

        $this->hydrateQuote($quote, $data);

        $errors = $this->validator->validate($quote);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Validation failed',
                'violations' => $this->formatViolations($errors),
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->quoteService->save($quote);

        return $this->json([
            'data' => $this->serializeQuote($quote),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $quote = $this->quoteRepository->find($id);

        if (!$quote) {
            return $this->json(['error' => 'Quote not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'data' => $this->serializeQuote($quote, true),
        ]);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $quote = $this->quoteRepository->find($id);

        if (!$quote) {
            return $this->json(['error' => 'Quote not found'], Response::HTTP_NOT_FOUND);
        }

        if (!$quote->canBeEdited()) {
            return $this->json(['error' => 'Quote cannot be edited'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $this->hydrateQuote($quote, $data);

        $errors = $this->validator->validate($quote);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Validation failed',
                'violations' => $this->formatViolations($errors),
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->quoteService->save($quote);

        return $this->json([
            'data' => $this->serializeQuote($quote),
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $quote = $this->quoteRepository->find($id);

        if (!$quote) {
            return $this->json(['error' => 'Quote not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->quoteService->delete($quote);
        } catch (\LogicException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_FORBIDDEN);
        }

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/send', name: 'send', methods: ['POST'])]
    public function send(int $id): JsonResponse
    {
        $quote = $this->quoteRepository->find($id);

        if (!$quote) {
            return $this->json(['error' => 'Quote not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->quoteService->send($quote);
        } catch (\LogicException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'data' => $this->serializeQuote($quote),
            'message' => 'Quote sent successfully',
        ]);
    }

    #[Route('/{id}/status', name: 'update_status', methods: ['PATCH'])]
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $quote = $this->quoteRepository->find($id);

        if (!$quote) {
            return $this->json(['error' => 'Quote not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $newStatus = $data['status'] ?? null;

        if (!$newStatus) {
            return $this->json(['error' => 'Status is required'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->quoteService->updateStatus($quote, $newStatus);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'data' => $this->serializeQuote($quote),
        ]);
    }

    #[Route('/{id}/duplicate', name: 'duplicate', methods: ['POST'])]
    public function duplicate(int $id): JsonResponse
    {
        $quote = $this->quoteRepository->find($id);

        if (!$quote) {
            return $this->json(['error' => 'Quote not found'], Response::HTTP_NOT_FOUND);
        }

        $newQuote = $this->quoteService->duplicate($quote);
        $this->quoteService->save($newQuote);

        return $this->json([
            'data' => $this->serializeQuote($newQuote),
            'message' => 'Quote duplicated successfully',
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}/pdf', name: 'pdf', methods: ['GET'])]
    public function downloadPdf(int $id): Response
    {
        $quote = $this->quoteRepository->find($id);

        if (!$quote) {
            return $this->json(['error' => 'Quote not found'], Response::HTTP_NOT_FOUND);
        }

        $pdfContent = $this->pdfService->generate($quote);
        $filename = $this->pdfService->getFilename($quote);

        return new Response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $filename),
            'Content-Length' => strlen($pdfContent),
        ]);
    }

    #[Route('/{id}/pdf/preview', name: 'pdf_preview', methods: ['GET'])]
    public function previewPdf(int $id): Response
    {
        $quote = $this->quoteRepository->find($id);

        if (!$quote) {
            return $this->json(['error' => 'Quote not found'], Response::HTTP_NOT_FOUND);
        }

        $pdfContent = $this->pdfService->generate($quote);

        return new Response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline',
        ]);
    }

    private function hydrateQuote(BiQuote $quote, array $data): void
    {
        // Client info
        if (isset($data['clientFirstName'])) {
            $quote->setClientFirstName($data['clientFirstName']);
        }
        if (isset($data['clientLastName'])) {
            $quote->setClientLastName($data['clientLastName']);
        }
        if (isset($data['clientEmail'])) {
            $quote->setClientEmail($data['clientEmail']);
        }
        if (array_key_exists('clientPhone', $data)) {
            $quote->setClientPhone($data['clientPhone']);
        }
        if (array_key_exists('clientAddress', $data)) {
            $quote->setClientAddress($data['clientAddress']);
        }

        // Event info
        if (array_key_exists('eventDate', $data)) {
            $quote->setEventDate($data['eventDate'] ? new \DateTime($data['eventDate']) : null);
        }
        if (array_key_exists('eventLocation', $data)) {
            $quote->setEventLocation($data['eventLocation']);
        }
        if (array_key_exists('eventType', $data)) {
            $quote->setEventType($data['eventType']);
        }

        // Package info
        if (isset($data['packageName'])) {
            $quote->setPackageName($data['packageName']);
        }
        if (isset($data['customContent'])) {
            $quote->setCustomContent($data['customContent']);
        }
        if (isset($data['totalAmount'])) {
            $quote->setTotalAmount($data['totalAmount']);
        }
        if (isset($data['depositPercentage'])) {
            $quote->setDepositPercentage($data['depositPercentage']);
        }

        // Recalculate deposit
        $quote->calculateDeposit();

        // Notes
        if (array_key_exists('notes', $data)) {
            $quote->setNotes($data['notes']);
        }
        if (array_key_exists('internalNotes', $data)) {
            $quote->setInternalNotes($data['internalNotes']);
        }

        // Valid until
        if (array_key_exists('validUntil', $data)) {
            $quote->setValidUntil($data['validUntil'] ? new \DateTime($data['validUntil']) : null);
        }
    }

    private function serializeQuote(BiQuote $quote, bool $full = false): array
    {
        $data = [
            'id' => $quote->getId(),
            'reference' => $quote->getReference(),
            'status' => $quote->getStatus(),
            'clientFullName' => $quote->getClientFullName(),
            'clientEmail' => $quote->getClientEmail(),
            'eventDate' => $quote->getEventDate()?->format('Y-m-d'),
            'eventLocation' => $quote->getEventLocation(),
            'packageName' => $quote->getPackageName(),
            'totalAmount' => $quote->getTotalAmount(),
            'depositAmount' => $quote->getDepositAmount(),
            'validUntil' => $quote->getValidUntil()?->format('Y-m-d'),
            'isExpired' => $quote->isExpired(),
            'createdAt' => $quote->getCreatedAt()?->format('c'),
            'sentAt' => $quote->getSentAt()?->format('c'),
        ];

        if ($full) {
            $data = array_merge($data, [
                'clientFirstName' => $quote->getClientFirstName(),
                'clientLastName' => $quote->getClientLastName(),
                'clientPhone' => $quote->getClientPhone(),
                'clientAddress' => $quote->getClientAddress(),
                'eventType' => $quote->getEventType(),
                'customContent' => $quote->getCustomContent(),
                'depositPercentage' => $quote->getDepositPercentage(),
                'notes' => $quote->getNotes(),
                'internalNotes' => $quote->getInternalNotes(),
                'updatedAt' => $quote->getUpdatedAt()?->format('c'),
                'acceptedAt' => $quote->getAcceptedAt()?->format('c'),
                'declinedAt' => $quote->getDeclinedAt()?->format('c'),
                'availableTransitions' => $this->quoteService->getAvailableTransitions($quote),
                'canBeEdited' => $quote->canBeEdited(),
                'templateId' => $quote->getPackageTemplate()?->getId(),
            ]);
        }

        return $data;
    }

    private function serializeTemplate(BiQuotePackageTemplate $template): array
    {
        return [
            'id' => $template->getId(),
            'slug' => $template->getSlug(),
            'name' => $template->getName(),
            'description' => $template->getDescription(),
            'basePrice' => $template->getBasePrice(),
            'defaultContent' => $template->getDefaultContent(),
        ];
    }

    private function formatViolations($violations): array
    {
        $errors = [];
        foreach ($violations as $violation) {
            $errors[$violation->getPropertyPath()] = $violation->getMessage();
        }
        return $errors;
    }
}
