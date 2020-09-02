<?php declare(strict_types = 1);

namespace App\Service;

use App\Entity\Invite;
use App\Entity\User;
use App\Repository\InviteRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class RegistrationService
{
    private $tokenGenerator;
    private $mailer;
    private $urlGenerator;
    private $em;
    private $passwordEncoder;
    private $lastValidationError = '';
    private $registrationLink = '';
    private $userRepository;
    private $inviteRepository;

    public function __construct(
        TokenGeneratorInterface $tokenGenerator,
        MailerInterface $mailer,
        UrlGeneratorInterface $urlGenerator,
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $passwordEncoder,
        UserRepository $userRepository,
        InviteRepository $inviteRepository
    )
    {
        $this->tokenGenerator = $tokenGenerator;
        $this->mailer = $mailer;
        $this->urlGenerator = $urlGenerator;
        $this->em = $em;
        $this->passwordEncoder = $passwordEncoder;
        $this->userRepository = $userRepository;
        $this->inviteRepository = $inviteRepository;
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

        $this->registrationLink = $this->urlGenerator->generate(
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
            ', $this->registrationLink))
        ;

        $this->mailer->send($email);
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

    public function findAndVerifyInvite($email, $code): Invite
    {
        $user = $this->userRepository->findOneBy([ 'email' => $email ]);
        if ($user) {
            throw new AccessDeniedException('Already registered');
        }
        $invite = $this->inviteRepository->findOneBy([
            'email' => $email,
            'registrationCode' => $code,
            'redeemed' => false,
        ]);

        if (!$invite) {
            throw new NotFoundHttpException('Invite not found or already redeemed.');
        }

        return $invite;
    }

    public function getLastValidationError(): string
    {
        return $this->lastValidationError;
    }

    public function getLastRegistrationLink()
    {
        return $this->registrationLink;
    }

    public function validateRegistrationForm(Request $request): bool
    {
        $password = $request->request->get('password');
        $password2 = $request->request->get('password2');

        if (mb_strlen($password) < 6) {
            $this->lastValidationError = 'Password too short. Must be at least 6 chars.';
            return false;
        }
        if ($password !== $password2) {
            $this->lastValidationError = 'Passwords do not match.';
            return false;
        }
        return true;
    }

    public function validateInvitationForm(Request $request): bool
    {
        $email = $request->request->get('email');
        $user = $this->userRepository->findOneBy([ 'email' => $email ]);
        if ($user) {
            $this->lastValidationError = 'User already registered!';
            return false;
        }
        return true;
    }
}
