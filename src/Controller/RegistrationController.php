<?php

namespace App\Controller;

use App\Service\RegistrationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\InvalidCsrfTokenException;

class RegistrationController extends AbstractController
{
    /**
     * @Route("/registration", name="app_registration", methods={"GET","POST"})
     */
    public function registerAction(
        Request $request,
        RegistrationService $registrationService
    )
    {
        $invite = $registrationService->findAndVerifyInvite(
            $request->query->get('username'),
            $request->query->get('code')
        );

        if ($request->isMethod('POST') && $registrationService->validateRegistrationForm($request)) {
            if (!$this->isCsrfTokenValid('register', $request->request->get('_csrf_token'))) {
                throw new InvalidCsrfTokenException('Invalid token.');
            }
            $plainPassword = $request->request->get('password');
            $registrationService->register($invite, $plainPassword);

            return $this->redirectToRoute('app_homepage');
        }

        return $this->render('registration/register.html.twig', [
            'email' => $invite->getEmail(),
            'error' => [ 'message' => $registrationService->getLastValidationError() ],
        ]);
    }
}
