<?php

namespace App\Controller;

use App\Repository\EventRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api/events")
 */
class EventController extends AbstractController
{
    /**
     * @Route("/", methods={"GET"})
     */
    public function index(EventRepository $eventRepository)
    {
        return $this->json([ 'data' => $eventRepository->findBy([], ['startDate' => 'ASC']) ]);
    }

    /**
     * @Route("/{id}", methods={"GET"})
     */
    public function show($id, EventRepository $eventRepository) {
        return $this->json(['data' => $eventRepository->find($id) ]);
    }

    /**
     * @Route("/{id}", methods={"PATCH"})
     */
    public function edit($id, Request $request, EventRepository $eventRepository)
    {
        $event = $eventRepository->find($id);
        if (!$event) {
            throw $this->createNotFoundException('Not found.');
        }

        $data = json_decode($request->getContent(), true);

        if ($data['title']) {
            $event->setTitle($data['title']);
        }
        if ($data['description']) {
            $event->setDescription($data['description']);
        }
        if ($data['color']) {
            $event->setColor($data['color']);
        }

        $this->getDoctrine()->getManager()->flush();

        return $this->json(['data' => $eventRepository->find($id)]);
    }
}
