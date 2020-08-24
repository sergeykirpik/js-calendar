# Events Calendar with Symfony 5

Well hi there! This is my Symfony 5 project *Events Calendar* without using any js or css frameworks!

## Setup

If you've just downloaded the code, congratulations!!

To get it working, follow these steps:

**Download Composer dependencies**

Make sure you have [Composer installed](https://getcomposer.org/download/)
and then run:

```
composer install
```

You may alternatively need to run `php composer.phar install`, depending
on how you installed Composer.

**Configure the the .env File**

First, make sure you have an `.env` file (you should).

Next, look at the configuration and make any adjustments you
need - specifically `DATABASE_URL`.

**Setup the Database**

Again, make sure `.env` is setup for your computer. Then, create
the database & tables!

```
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load
```

If you get an error that the database exists, that should
be ok. But if you have problems, completely drop the
database (`doctrine:database:drop --force`) and try again.

**Frontend setup**

This project uses Symfony Webpack Encore so make sure you have node.js and npm installed then run:

```
npm install
npm run build
```

**Start the built-in web server**

You can use Nginx or Apache, but the built-in web server works
great:

```
php bin/console server:run
```

Now check out the site at `http://localhost:8000`

User fixtures load two users:

    `test-user@example.com`  with password `user_password`
    `admin-user@example.com` with password `admin_user`

Have fun!

