<?php

namespace App\Controller;

use App\Repository\EventRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/events")
 */
class EventController extends AbstractController
{
    /**
     * @Route("/")
     */
    public function index(EventRepository $eventRepository)
    {
        return $this->json([ 'data' => $eventRepository->findAll() ]);
    }
}
