<?php

namespace App\Service\Api;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class ApiPokemon
{
    public function __construct(private readonly HttpClientInterface $client)
    {}

    public function getPokemon(string $name)
    {
        $response = $this->client->request('GET', 'https://pokeapi.co/api/v2/pokemon/' . $name);

        if ($response->getStatusCode() !== 200) {
            return false;
        }

        return json_decode($response->getContent());
    }
}
