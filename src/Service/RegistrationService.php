<?php declare(strict_types = 1);

namespace App\Service;

use App\Entity\Invite;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class RegistrationService
{
    private $tokenGenerator;
    private $mailer;
    private $urlGenerator;
    private $em;
    private $passwordEncoder;

    public function __construct(
        TokenGeneratorInterface $tokenGenerator,
        MailerInterface $mailer,
        UrlGeneratorInterface $urlGenerator,
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $passwordEncoder,
        UserRepository $userRepository
    )
    {
        $this->tokenGenerator = $tokenGenerator;
        $this->mailer = $mailer;
        $this->urlGenerator = $urlGenerator;
        $this->em = $em;
        $this->passwordEncoder = $passwordEncoder;
        $this->userRepo = $userRepository;
    }

    public function sendInvite(string $email)
    {
        $invite = new Invite();
        $invite->setEmail($email);
        $invite->setRegistrationCode($this->tokenGenerator->generateToken());
        $invite->setExpires(new \DateTime());
        $invite->setRedeemed(false);

        $this->em->persist($invite);
        $this->em->flush();


        $registrationLink = $this->urlGenerator->generate(
            'app_registration',
            [
                'username' => $invite->getEmail(),
                'code' => $invite->getRegistrationCode(),
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

    public function verifyInvite(Invite $invite)
    {
        if (!$invite) {
            throw new NotFoundHttpException('Sorry, but this page is does not exists');
        }

    }

    public function register(Invite $invite, string $plainPassword)
    {
        $user = new User();
        $user->setEmail($invite->getEmail());
        $user->setPassword($this->passwordEncoder->encodePassword($user, $plainPassword));
        $this->em->persist($user);

        $invite->setRedeemed(true);
        $this->em->persist($invite);

        $this->em->flush();
    }
}
