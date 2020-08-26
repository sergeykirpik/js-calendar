<?php

namespace App\Controller;

use App\Repository\InviteRepository;
use App\Service\RegistrationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class RegistrationController extends AbstractController
{
    /**
     * @Route("/registration", name="app_registration")
     */
    public function registerAction(Request $request, RegistrationService $registrationService, InviteRepository $inviteRepository)
    {
        $invite = $inviteRepository->findOneBy([
            'email' => $request->query->get('username'),
            'registrationCode' => $request->get('code'),
            'redeemed' => false,
        ]);

        if (!$invite) {
            throw $this->createNotFoundException('Invite not found.');
        }
        //$registrationService->verifyInvite($invite);

        if ($request->isMethod('POST')) {
            $plainPassword = $request->request->get('password');
            $registrationService->register($invite, $plainPassword);

            return $this->redirectToRoute('app_homepage');
        }

        return $this->render('registration/register.html.twig', [
            'email' => $invite->getEmail(),
        ]);
    }
}
