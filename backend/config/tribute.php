<?php

return [
    'teachers' => json_decode(
        file_get_contents(__DIR__.'/../resources/tribute-teachers.json'),
        true,
        flags: JSON_THROW_ON_ERROR,
    ),
];
