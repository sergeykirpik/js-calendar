<?php

declare(strict_types = 1);

namespace App\Controller;

use App\Service\RegistrationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;

/**
 * @IsGranted("ROLE_ADMIN")
 */
class InvitationController extends AbstractController
{
    /**
     * @Route("/invite", name="app_invite", methods={"GET","POST"})
     */
    public function generateInviteAction(Request $request, RegistrationService $registrationService)
    {
        if ($request->isMethod('POST') && $registrationService->validateInvitationForm($request)) {
            $registrationService->sendInvite($request->get('email'));

            return $this->render('invite/success.html.twig', [
                'registration_link' => $registrationService->getLastRegistrationLink(),
            ]);
        }
        return $this->render('invite/new.html.twig', [
            'error' => [ 'message' => $registrationService->getLastValidationError() ],
        ]);
    }


}
