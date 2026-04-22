<?php

return [
    'secret' => env('JWT_SECRET', 'default-secret-change-in-production'),
    'algorithm' => 'HS256',
    'access_token_expiry' => 28800,
    'refresh_token_expiry' => 2592000,
];
