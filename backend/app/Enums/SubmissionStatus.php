<?php

namespace App\Enums;

enum SubmissionStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Hidden = 'hidden';
    case Withdrawn = 'withdrawn';
}
