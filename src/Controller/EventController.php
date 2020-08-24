<?php

namespace App\Controller;

use App\Repository\EventRepository;
use DateTime;
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
        return $this->json(['data' => $eventRepository->find($id)]);
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

        if (array_key_exists('title', $data)) {
            $event->setTitle($data['title']);
        }
        if (array_key_exists('description', $data)) {
            $event->setDescription($data['description']);
        }
        if (array_key_exists('color', $data)) {
            $event->setColor($data['color']);
        }
        if (array_key_exists('startDate', $data)) {
            $event->setStartDate(new DateTime($data['startDate']));
        }
        if (array_key_exists('endDate', $data)) {
            $event->setEndDate(new DateTime($data['endDate']));
        }

        $this->getDoctrine()->getManager()->flush();

        return $this->json(['data' => $eventRepository->find($id)]);
    }
}
