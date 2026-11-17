<?php

namespace App\Enums;

enum StaffRole: string
{
    case Admin = 'admin';
    case Moderator = 'moderator';
    case Operator = 'operator';
}
