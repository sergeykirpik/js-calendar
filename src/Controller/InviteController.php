<?php

declare(strict_types = 1);

namespace App\Controller;

use App\Service\InvitationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * @IsGranted("ROLE_ADMIN")
 */
class InviteController extends AbstractController
{
    /**
     * @Route("/invite", name="app_invite")
     */
    public function generateInviteAction(Request $request, InvitationService $invitationService)
    {
        if ($request->isMethod('POST')) {
            $invitationService->sendInvite($request->get('email'));
            return new Response('<body>Success!</body>');
        }
        return $this->render('invite/new.html.twig');
    }

}
