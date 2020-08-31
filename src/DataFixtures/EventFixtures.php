<?php

namespace App\DataFixtures;

use App\Entity\Event;
use App\Repository\UserRepository;
use DateInterval;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class EventFixtures extends Fixture implements DependentFixtureInterface
{
    private $faker;
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->faker = \Faker\Factory::create();
        $this->userRepository = $userRepository;
    }

    /**
     * @see DependentFixtureInterface
     */
    public function getDependencies()
    {
        return [UserFixtures::class];
    }

    public function randomEvent()
    {
        $users = $this->userRepository->findAll();

        $faker = $this->faker;
        $statuses = ['in-progress', 'done', 'canceled'];

        $start = $faker->dateTimeBetween('-50 days', '+50 days');
        $finish = $start->getTimestamp() + random_int(3600, 100000);
        $finish = new DateTime('@'. $finish);

        $event = new Event();
        $event->setTitle($faker->text(20));
        $event->setDescription($faker->text(100));
        $event->setAuthor($faker->randomElement($users)->getEmail());
        $event->setColor($faker->hexColor);
        $event->setStatus($faker->randomElement($statuses));
        $event->setStartDate($start);
        $event->setEndDate($finish);

        return $event;
    }

    public function load(ObjectManager $manager)
    {
        for ($i = 0; $i < 150; $i++) {
            $manager->persist($this->randomEvent());
        }
        $manager->flush();
    }
}
