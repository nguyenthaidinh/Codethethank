<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class BcryptPasswordLength implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Bcrypt silently truncates beyond 72 bytes; count bytes, not Unicode code points.
        if (is_string($value) && strlen($value) > 72) {
            $fail('The password must not exceed 72 UTF-8 bytes.');
        }
    }
}
