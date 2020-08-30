<?php

namespace App\Controller;

use App\Entity\Event;
use App\Repository\EventRepository;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
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
     * @Route("/", methods={"POST"})
     */
    public function newAction(Request $request, EntityManagerInterface $em)
    {
        $data = json_decode($request->getContent(), true);

        $event = new Event();
        $event->setAuthor($this->getUser()->getEmail());
        $event->setTitle($data['title']);
        $event->setDescription($data['description']);
        $event->setStartDate(new DateTime($data['startDate']));
        $event->setEndDate(new DateTime($data['endDate']));
        $event->setColor($data['color']);
        $event->setStatus('new');

        $em->persist($event);
        $em->flush();

        return $this->json([ 'data' => $event ]);
    }

    /**
     * @Route("/{id}", methods={"GET"})
     */
    public function showAction($id, EventRepository $eventRepository) {
        return $this->json(['data' => $eventRepository->find($id)]);
    }

    /**
     * @Route("/{id}", methods={"PATCH"})
     */
    public function editAction($id, Request $request, EventRepository $eventRepository)
    {
        $event = $eventRepository->find($id);
        if (!$event) {
            throw $this->createNotFoundException('Event not found: id = ' . $id);
        }

        if ($event->getAuthor() !== $this->getUser()->getEmail()
                && !$this->isGranted('ROLE_ADMIN'))
        {
            throw $this->createAccessDeniedException('Not enough permissions to complete this operation.');
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

    /**
     * @Route("/{id}", methods={"DELETE"})
     */
    public function deleteAction($id, EventRepository $repo)
    {
        $event = $repo->find($id);
        if (!$event) {
            throw $this->createNotFoundException('Event not found: id = ' . $id);
        }

        if ($event->getAuthor() !== $this->getUser()->getEmail()
            && !$this->isGranted('ROLE_ADMIN'))
        {
            throw $this->createAccessDeniedException('You have not enough permissions to complete this operation.');
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($event);
        $em->flush();

        return $this->json([
            'id' => $id,
        ]);
    }
}
