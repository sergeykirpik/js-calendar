<?php

namespace App\DataFixtures;

use App\Entity\Event;
use App\Repository\UserRepository;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class EventFixtures extends Fixture implements DependentFixtureInterface
{
    const NUMBER_OF_EVENTS = 0;

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

        $start = $faker->dateTimeBetween('-50 days', '+50 days');
        $finish = $start->getTimestamp() + random_int(3600, 100000);
        $finish = new DateTime('@'. $finish);

        $event = new Event();
        $event->setTitle($faker->text(20));
        $event->setDescription($faker->text(100));
        $event->setAuthor($faker->randomElement($users)->getEmail());
        $event->setColor($faker->hexColor);
        $event->setIsCanceled($faker->boolean);
        $event->setStartDate($start);
        $event->setEndDate($finish);

        return $event;
    }

    public function load(ObjectManager $manager)
    {
        for ($i = 0; $i < EventFixtures::NUMBER_OF_EVENTS; $i++) {
            $manager->persist($this->randomEvent());
        }
        $manager->flush();
    }
}
