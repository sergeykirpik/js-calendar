<?php declare(strict_types = 1);

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class InvitationService
{
    private $tokenGenerator;
    private $mailer;
    private $urlGenerator;

    public function __construct(
        TokenGeneratorInterface $tokenGenerator,
        MailerInterface $mailer,
        UrlGeneratorInterface $urlGenerator,
        LoggerInterface $logger
    )
    {
        $this->tokenGenerator = $tokenGenerator;
        $this->mailer = $mailer;
        $this->urlGenerator = $urlGenerator;
    }

    public function sendInvite(string $email)
    {
        $token = $this->tokenGenerator->generateToken();
        $registrationLink = $this->urlGenerator->generate(
            'app_registration',
            [
                'username' => $email,
                'code' => $token
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
        $email = (new Email())
            ->from('events.calendar@example.com')
            ->to($email)
            ->subject('Your invite to EventsCalendar!')
            ->html(sprintf('
                <h1>Welcome to EventsCalendar!</h1>
                <p>Here is your <a href="%s">invitation</a></p>
            ', $registrationLink))
        ;

        $this->mailer->send($email);
    }
}
