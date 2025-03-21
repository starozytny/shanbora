<?php

namespace App\Controller\InternApi\Pokemon;

use App\Service\Api\ApiPokemon;
use App\Service\ApiResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/intern/api/pokemons', name: 'intern_api_pokemons_')]
class PokemonController extends AbstractController
{
    #[Route('/search', name: 'search', options: ['expose' => true], methods: 'POST')]
    public function search(Request $request, ApiResponse $apiResponse, ApiPokemon $apiPokemon): Response
    {
        $data = json_decode($request->getContent());

        $pokemon = $apiPokemon->getPokemon($data->name);

        dump($pokemon);

        return $apiResponse->apiJsonResponseCustom($pokemon);
    }
}
