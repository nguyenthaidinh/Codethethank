<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();
        config(['admin.session_driver' => 'array']);
        $connection = config('database.default');
        $database = config("database.connections.$connection.database");
        if (! $app->environment('testing') || ($database !== ':memory:' && $database !== 'gratitude_test')) {
            throw new \RuntimeException('Refusing database tests outside :memory: or gratitude_test.');
        }

        return $app;
    }
}
