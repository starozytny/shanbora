import React, { Component } from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import { Checkbox, Input, InputFile, SelectCustom } from "@tailwindComponents/Elements/Fields";
import { Button } from "@tailwindComponents/Elements/Button";
import { LoaderElements } from "@tailwindComponents/Elements/Loader";
import { Password } from "@tailwindComponents/Modules/User/Password";

import Formulaire from "@commonFunctions/formulaire";
import Validateur from "@commonFunctions/validateur";
import Sort from "@commonFunctions/sort";
import Inputs from "@commonFunctions/inputs";

const URL_SELECT_SOCIETIES = "intern_api_selection_societies";
const URL_INDEX_ELEMENTS = "admin_users_index";
const URL_CREATE_ELEMENT = "intern_api_users_create";
const URL_UPDATE_ELEMENT = "intern_api_users_update";

let societies = [];

export function UserFormulaire ({ context, element }) {
	let url = Routing.generate(URL_CREATE_ELEMENT);

	if (context === "update") {
		url = Routing.generate(URL_UPDATE_ELEMENT, { 'id': element.id });
	}

	return  <Form
        context={context}
        url={url}
        society={element ? Formulaire.setValue(element.society.id) : ""}
        username={element ? Formulaire.setValue(element.username) : ""}
        firstname={element ? Formulaire.setValue(element.firstname) : ""}
        lastname={element ? Formulaire.setValue(element.lastname) : ""}
        email={element ? Formulaire.setValue(element.email) : ""}
        galleryTitle={element ? Formulaire.setValue(element.galleryTitle) : ""}
        galleryDate={element ? Formulaire.setValueDate(element.galleryDate) : ""}
        avatarFile={element ? Formulaire.setValue(element.avatarFile) : null}
        roles={element ? Formulaire.setValue(element.roles, []) : []}
    />
}

UserFormulaire.propTypes = {
	context: PropTypes.string.isRequired,
	element: PropTypes.object,
}

class Form extends Component {
	constructor (props) {
		super(props);

		this.state = {
			society: props.society,
			username: props.username,
			firstname: props.firstname,
			lastname: props.lastname,
			email: props.email,
			roles: props.roles,
			galleryTitle: props.galleryTitle,
			galleryDate: props.galleryDate,
			password: '',
			password2: '',
			errors: [],
			loadData: true,
		}

		this.select = React.createRef();
		this.file = React.createRef();
	}

	componentDidMount = () => {
		const { society } = this.props;

		Inputs.initDateInput(this.handleChangeDate, this.handleChange, null)

		let self = this;
		axios({ method: "GET", url: Routing.generate(URL_SELECT_SOCIETIES), data: {} })
			.then(function (response) {
				let data = response.data;

				data.sort(Sort.compareCode)
				let societyName = "";
				data.forEach(elem => {
					let label = elem.code + " - " + elem.name;
					societyName = elem.id === society ? label : societyName;
					societies.push({ value: elem.id, label: label, inputName: label, identifiant: "so-" + elem.id })
				})

				self.setState({ societyName: societyName, loadData: false })
			})
			.catch(function (error) {
				Formulaire.displayErrors(self, error);
			})
		;
	}

	handleChange = (e, picker) => {
		const { roles } = this.state

		let name = e.currentTarget.name;
		let value = e.currentTarget.value;

		if (name === "roles") {
			value = Formulaire.updateValueCheckbox(e, roles, value);
		}

		if (name === "galleryDate") {
			value = Inputs.dateInput(e, picker, this.state[name]);
		}

		this.setState({ [name]: value })
	}

	handleChangeDate = (name, value) => {
		this.setState({ [name]: value })
	}

	handleSelect = (name, value, displayValue) => {
		this.setState({ [name]: value });
		this.select.current.handleClose(null, displayValue);
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const { context, url } = this.props;
		const { username, firstname, lastname, password, password2, email, roles, society, } = this.state;

		this.setState({ errors: [] });

		let paramsToValidate = [
			{ type: "text", id: 'username', value: username },
			{ type: "text", id: 'firstname', value: firstname },
			{ type: "text", id: 'lastname', value: lastname },
			{ type: "email", id: 'email', value: email },
			{ type: "array", id: 'roles', value: roles },
			{ type: "text", id: 'society', value: society }
		];
		if (context === "create") {
			if (password !== "") {
				paramsToValidate = [...paramsToValidate,
					...[{ type: "password", id: 'password', value: password, idCheck: 'password2', valueCheck: password2 }]
				];
			}
		}

		let validate = Validateur.validateur(paramsToValidate)
		if (!validate.code) {
			Formulaire.showErrors(this, validate);
		} else {
			Formulaire.loader(true);
			let self = this;

			let formData = new FormData();
			formData.append("data", JSON.stringify(this.state));

			let file = this.file.current;
			if (file.state.files.length > 0) {
				formData.append("avatar", file.state.files[0]);
			}

			axios({ method: "POST", url: url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
				.then(function (response) {
					location.href = Routing.generate(URL_INDEX_ELEMENTS, { 'h': response.data.id });
				})
				.catch(function (error) {
					Formulaire.displayErrors(self, error);
					Formulaire.loader(false);
				})
			;
		}
	}

	render () {
		const { context, avatarFile } = this.props;
		const { errors, loadData, username, firstname, lastname, email, password, password2, roles, societyName, galleryTitle, galleryDate } = this.state;

		let rolesItems = [
			{ value: 'ROLE_ADMIN', identifiant: 'admin', label: 'Admin' },
			{ value: 'ROLE_USER', identifiant: 'user', label: 'Utilisateur' },
		]

		let params = { errors: errors }
		let params0 = { ...params, ...{ onChange: this.handleChange } }
		let params1 = { ...params, ...{ onClick: this.handleSelect } }

		return <form onSubmit={this.handleSubmit}>
			<div className="flex flex-col gap-4 xl:gap-6">
				<div className="grid gap-2 xl:grid-cols-3 xl:gap-6">
					<div>
						<div className="font-medium text-lg">Identification</div>
						<div className="text-gray-600 text-sm">
							Le nom d'utilisateur est automatiquement formaté, les espaces et les accents sont supprimés ou remplacés.
							{context === "create" ? <span><br /><br />Attention, le nom d'utilisateur ne pourra plus être modifié.</span> : ""}
						</div>
					</div>
					<div className="bg-white p-4 rounded-md ring-1 ring-inset ring-gray-200 xl:col-span-2">
						<div className="flex gap-4">
							<div className="w-full">
								<Input valeur={username} identifiant="username" {...params0}>Nom utilisateur</Input>
							</div>
							<div className="w-full">
								<Input valeur={email} identifiant="email" {...params0} type="email">Adresse e-mail</Input>
							</div>
						</div>
					</div>
				</div>

				<div className="grid gap-2 xl:grid-cols-3 xl:gap-6">
					<div>
						<div className="font-medium text-lg">Profil utilisateur</div>
						<div className="text-gray-600 text-sm">
							Personnalisation du profil.
						</div>
					</div>
					<div className="flex flex-col gap-4 bg-white p-4 rounded-md ring-1 ring-inset ring-gray-200 xl:col-span-2">
						<div className="flex gap-4">
							<div className="w-full">
								<Input identifiant="firstname" valeur={firstname} {...params0}>Prénom</Input>
							</div>
							<div className="w-full">
								<Input identifiant="lastname" valeur={lastname} {...params0}>Nom</Input>
							</div>
						</div>

						<div>
							<Checkbox identifiant="roles" valeur={roles} items={rolesItems} {...params0} classItems="flex gap-4">
								Rôles
							</Checkbox>
						</div>

						<div className="line">
							{loadData
								? <>
									<label>Société</label>
									<LoaderElements text="Récupération des sociétés..." />
								</>
								: <SelectCustom ref={this.select} identifiant="society" inputValue={societyName}
												items={societies} {...params1}>
									Société
								</SelectCustom>
							}
						</div>

						<div>
							<InputFile ref={this.file} type="simple" identifiant="avatar" valeur={avatarFile} {...params0}>
								Avatar <span className="text-sm text-gray-600">(facultatif)</span>
							</InputFile>
						</div>
					</div>
				</div>

				<div className="grid gap-2 xl:grid-cols-3 xl:gap-6">
					<div>
						<div className="font-medium text-lg">Mot de passe</div>
						<div className="text-gray-600 text-sm">
							{context === "create"
								? <div>
									Laisser le champs vide génère un mot de passe aléatoire. L'utilisateur pourra utilise la
									fonction <u>Mot de passe oublié ?</u> pour modifier son mot de passe.
								</div>
								: <div>
									Laisser les champs vides pour ne pas modifier le mot de passe.
								</div>
							}
						</div>
					</div>
					<div className="bg-white p-4 rounded-md ring-1 ring-inset ring-gray-200 xl:col-span-2">
						<Password password={password} password2={password2} params={params0} />
					</div>
				</div>

				<div className="grid gap-2 xl:grid-cols-3 xl:gap-6">
					<div>
						<div className="font-medium text-lg">Galerie</div>
						<div className="text-gray-600 text-sm">
							Personnalisation du titre et date de la galerie de photos.
						</div>
					</div>
					<div className="flex flex-col gap-4 bg-white p-4 rounded-md ring-1 ring-inset ring-gray-200 xl:col-span-2">
						<div className="flex gap-4">
							<div className="w-full">
								<Input identifiant="galleryTitle" valeur={galleryTitle} {...params0}>Titre</Input>
							</div>
							<div className="w-full">
								<Input type="js-date" identifiant="galleryDate" valeur={galleryDate} {...params}>Date</Input>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-4 flex justify-end gap-2">
				<Button type="blue" isSubmit={true}>
					{context === "create" ? "Enregistrer" : "Enregistrer les modifications"}
				</Button>
			</div>
		</form>
	}
}

Form.propTypes = {
	context: PropTypes.string.isRequired,
	url: PropTypes.node.isRequired,
	username: PropTypes.string.isRequired,
	firstname: PropTypes.string.isRequired,
	email: PropTypes.string.isRequired,
	avatarFile: PropTypes.node,
	roles: PropTypes.array.isRequired,
}
