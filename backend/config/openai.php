<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OpenAI API Key
    |--------------------------------------------------------------------------
    |
    | Ky API key merret nga .env (OPENAI_API_KEY).
    | Sigurohu që e ke vendosur saktë në .env.
    |
    */

    'api_key' => env('OPENAI_API_KEY'),

    // Opsionale – vetëm nëse përdor organization ose project IDs
    'organization' => env('OPENAI_ORGANIZATION', null),
    'project' => env('OPENAI_PROJECT', null),
];
