import React, { useState } from "react";

import axios from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Formulaire from "@commonFunctions/formulaire";

import { Button } from "@tailwindComponents/Elements/Button";
import { Input } from "@tailwindComponents/Elements/Fields";
import { LoaderElements } from "@tailwindComponents/Elements/Loader";
import { Alert } from "@tailwindComponents/Elements/Alert";

const URL_SEARCH_POKEMON = "intern_api_pokemons_search";

export function Pokemon () {
	const [name, setName] = useState("");
	const [pokemon, setPokemon] = useState(null);
	const [type, setType] = useState("fire");
	const [errors, setErrors] = useState([]);
	const [load, setLoad] = useState(false);

	const handleSearch = () => {
		if(name === ""){
			setErrors([{
				name: "name",
				message: "Tape sur le clavier moldu"
			}])
		}else{
			if(specials.includes(name)){
				setPokemon(name);
				setType(types[getRandomInt(17)])
			}else{
				if(!load){
					setLoad(true);

					axios({ method: "POST", url: Routing.generate(URL_SEARCH_POKEMON), data: {name: name} })
						.then(function (response) {
							setPokemon(response.data);
						})
						.catch(function (error) {
							Formulaire.displayErrors(null, error);
						})
						.then(function () {
							setLoad(false)
						})
					;
				}
			}
		}
	}

	console.log(pokemon)

	return <div className="bg-white p-4 border rounded-md">
		<h2 className="font-semibold text-lg mb-4">Recherche un pokémon <span className="text-xs text-gray-600">ça n'a rien à voir avec la magie et alors ?</span></h2>
		<div className="w-full flex gap-1">
			<div className="w-full">
				<Input identifiant="name" valeur={name} errors={errors} onChange={(e) => setName(e.currentTarget.value)}
					   placeholder="Rechercher un nom de pokemon en anglais.." />
			</div>
			<div className="min-w-20">
				<Button type="blue" onClick={handleSearch}>Lancer</Button>
			</div>
		</div>

		<div className="mt-4 pb-4">
			{specials.includes(pokemon)
				? <div className="flex justify-center items-center">
					<PokemonCardSpecial pokemon={pokemon} type={type} key={pokemon} />
				</div>
				: load
					? <LoaderElements />
					: pokemon
						? <div className="flex justify-center items-center">
							<PokemonCardV2 pokemon={pokemon} />
						</div>
						: pokemon === false ? <Alert type="red" icon="warning">Introuvable gros.</Alert> : null

			}
		</div>
	</div>
}

const PokemonCardV1 = ({ pokemon }) => {
	return (
		<div className="bg-white shadow-lg rounded-2xl p-4 text-center w-64 transform transition duration-300 hover:scale-105">
			<img src={pokemon.sprites.front_default} alt={pokemon.name.toUpperCase()} className="w-32 h-32 mx-auto" />
			<h2 className="text-2xl font-bold capitalize mt-2">{pokemon.name.toUpperCase()}</h2>
			<div className="flex justify-center gap-2 mt-3">
				{pokemon.types.map((el, index) => {
					return <span key={index} className={`text-white text-sm font-semibold px-3 py-1 rounded-full ${typeColors[el.type.name] || "bg-gray-500"}`}>
						{el.type.name}
					</span>
				})}
			</div>
		</div>
	);
};

const PokemonCardV2 = ({ pokemon }) => {
	let weakness="Sol"
	let resistance="Acier"

	let type = "normal";
	if(pokemon.types[0]){
		type = pokemon.types[0].type.name;
	}

	let hp = 50;
	let defense = 50;
	if(pokemon.stats){
		pokemon.stats.forEach(st => {
			if(st.stat.name === "hp"){
				hp = st.base_stat;
			}
			if(st.stat.name === "defense"){
				defense = st.base_stat;
			}
		})
	}

	let attacks = [];
	if(pokemon.abilities){
		pokemon.abilities.forEach(ab => {
			attacks.push({ name: ab.ability.name })
		})
	}

	return (
		<div className={`relative border-4 ${borderColors[type] || ""} rounded-md w-72 shadow-lg text-center font-sans`}>
			<div className={`${bgColors[type] || "bg-gray-100"} p-4`}>

				<div className="flex justify-between items-center text-lg font-bold">
					<span className="capitalize">{pokemon.name.toUpperCase()}</span>
					<span className="text-red-600">{hp} HP</span>
				</div>

				<div className={`bg-gray-200 p-2 mt-2 border-4 shadow-md ${borderColors[type] || ""}`}>
					<img src={pokemon.sprites.front_default} alt={pokemon.name.toUpperCase()} className="w-40 h-40 mx-auto" />
				</div>

				<div className="flex gap-2 text-xs text-gray-600 items-center justify-center mt-1 border bg-gray-200 py-0.5 px-2">
					<div>N° : {pokemon.id}</div>
					<div>Taille : {pokemon.height} m</div>
					<div>Poids : {pokemon.weight / 10} kg</div>
				</div>

				<div className="flex justify-center gap-2 mt-4">
					{pokemon.types.map((el, index) => {
						return <span key={index} className={`text-white text-sm font-semibold px-3 py-1 rounded-full ${bgColors2[el.type.name] || "bg-gray-500"}`}>
						{el.type.name}
					</span>
					})}
				</div>

				<div className="mt-4 text-left bg-white p-3 rounded-lg shadow-inner">
					<h3 className="text-md font-bold">Attaques :</h3>
					{attacks.map((attack, index) => (
						<div key={index} className="mt-1 border-b pb-1">
							<span className="font-semibold">{attack.name}</span>
						</div>
					))}
				</div>

				<div className="mt-4 flex justify-between text-sm">
					<div>
						<strong>Faiblesse :</strong> {weakness || "None"}
					</div>
					<div>
						<strong>Résistance :</strong> {resistance || "None"}
					</div>
					<div>
						<strong>Défense :</strong> {defense || "None"}
					</div>
				</div>
			</div>
		</div>
	);
};

const PokemonCardSpecial = ({ pokemon, type }) => {
	let weakness="Aucun"
	let resistance="Tout"

	let hp = pokemon !== specials[0] ? getRandomInt(99) : 99999;
	let defense = pokemon !== specials[0] ? getRandomInt(99) : 99999;

	let attacks = [
		{ name: "Éclair", description: "Inflige 9999 dégâts." },
		{ name: "Tonnerre", description: "Inflige 9999 dégâts et peut paralyser." }
	];

	return (
		<div className={`relative border-4 ${borderColors[type] || ""} rounded-md w-72 shadow-lg text-center font-sans`}>
			<div className={`${bgColors[type] || "bg-gray-100"} p-4`}>
				<div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-purple-300 to-yellow-300 opacity-30 mix-blend-multiply animate-holo"></div>

				<div className="flex justify-between items-center text-lg font-bold">
					<span className="capitalize">{pokemon}</span>
					<span className="text-red-600">{hp} HP</span>
				</div>

				<div className={`bg-gray-200 mt-2 border-4 shadow-md ${borderColors[type] || ""}`}>
					<img src={'/build/app/images/ppt/pokemon/' + pokemon + '.jpg'} alt={pokemon} className="w-[245px] h-[245px] object-cover" />
				</div>

				<div className="flex gap-2 text-xs text-gray-600 items-center justify-center mt-1 border bg-gray-200 py-0.5 px-2">
					<div>N° : 999</div>
					<div>Taille : ? m</div>
					<div>Poids : ? kg</div>
				</div>

				<div className="flex justify-center gap-2 mt-4">
					<span className={`text-white text-sm font-semibold px-3 py-1 rounded-full ${bgColors2[type] || "bg-gray-500"}`}>
						{type}
					</span>
				</div>

				<div className="mt-4 text-left bg-white p-3 rounded-lg shadow-inner">
					{attacks.map((attack, index) => (
						<div key={index} className="mt-1 border-b pb-1 text-sm">
							<span className="font-semibold">{attack.name}</span>
							{attack.description
								? <p className="text-xs text-gray-600">{attack.description}</p>
								: null
							}
						</div>
					))}
				</div>

				<div className="mt-4 flex justify-between text-sm">
					<div>
						<strong>Faiblesse</strong> {weakness || "None"}
					</div>
					<div>
						<strong>Résistance</strong> {resistance || "None"}
					</div>
					<div>
						<strong>Défense</strong> {defense || "None"}
					</div>
				</div>
			</div>
		</div>
	);
};

const bgColors = {
	fire: "bg-red-100",
	water: "bg-blue-100",
	grass: "bg-green-100",
	electric: "bg-yellow-100",
	psychic: "bg-pink-100",
	ice: "bg-cyan-100",
	dragon: "bg-indigo-300",
	dark: "bg-gray-300",
	fairy: "bg-pink-100",
	normal: "bg-gray-100",
	fighting: "bg-orange-300",
	flying: "bg-indigo-100",
	poison: "bg-purple-100",
	ground: "bg-yellow-300",
	rock: "bg-gray-200",
	bug: "bg-lime-200",
	ghost: "bg-indigo-500",
	steel: "bg-gray-100",
};

const bgColors2 = {
	fire: "bg-red-500",
	water: "bg-blue-300",
	grass: "bg-green-500",
	electric: "bg-yellow-500",
	psychic: "bg-pink-500",
	ice: "bg-cyan-500",
	dragon: "bg-indigo-700",
	dark: "bg-gray-700",
	fairy: "bg-pink-300",
	normal: "bg-gray-400",
	fighting: "bg-orange-700",
	flying: "bg-indigo-300",
	poison: "bg-purple-500",
	ground: "bg-yellow-700",
	rock: "bg-gray-600",
	bug: "bg-lime-600",
	ghost: "bg-indigo-900",
	steel: "bg-gray-500",
};

const borderColors = {
	fire: "border-red-500",
	water: "border-blue-300",
	grass: "border-green-500",
	electric: "border-yellow-500",
	psychic: "border-pink-500",
	ice: "border-cyan-500",
	dragon: "border-indigo-700",
	dark: "border-gray-700",
	fairy: "border-pink-300",
	normal: "border-gray-400",
	fighting: "border-orange-700",
	flying: "border-indigo-300",
	poison: "border-purple-500",
	ground: "border-yellow-700",
	rock: "border-gray-600",
	bug: "border-lime-600",
	ghost: "border-indigo-900",
	steel: "border-gray-500",
};

const types = ["fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy", "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel"]

const specials = ["chhaydarong", "chanda", "chloe", "marie", "riddthy", "sophia", "oceane", "mike"]

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}
