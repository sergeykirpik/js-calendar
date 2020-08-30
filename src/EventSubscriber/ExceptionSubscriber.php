<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class ExceptionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::EXCEPTION => [
                ['processException', 0],
            ],
        ];
    }

    public function processException(ExceptionEvent $event)
    {
        $error = [
            'message' => $event->getThrowable()->getMessage(),
        ];

        $event->setResponse(new JsonResponse($error));
    }
}
