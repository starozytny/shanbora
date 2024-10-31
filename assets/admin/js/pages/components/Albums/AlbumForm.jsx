import React, { Component } from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Inputs from "@commonFunctions/inputs";
import Formulaire from "@commonFunctions/formulaire";
import Validateur from "@commonFunctions/validateur";

import { Input} from "@tailwindComponents/Elements/Fields";
import { Button } from "@tailwindComponents/Elements/Button";

const URL_INDEX_ELEMENTS = "admin_galleries_index";
const URL_UPDATE_ELEMENT = "intern_api_user_gallery_albums_update";

export function AlbumFormulaire ({ element }) {
	let url = Routing.generate(URL_UPDATE_ELEMENT, { id: element.id });

	return  <Form
        url={url}
        title={Formulaire.setValue(element.title)}
        dateAt={Formulaire.setValueDate(element.dateAt)}
    />
}

AlbumFormulaire.propTypes = {
	element: PropTypes.object,
}

class Form extends Component {
	constructor (props) {
		super(props);

		this.state = {
			title: props.title,
			dateAt: props.dateAt,
			errors: [],
		}
	}

	componentDidMount = () => {
		Inputs.initDateInput(this.handleChangeDate, this.handleChange, null)
	}

	handleChange = (e, picker) => {
		let name = e.currentTarget.name;
		let value = e.currentTarget.value;

		if (name === "dateAt") {
			value = Inputs.dateInput(e, picker, this.state[name]);
		}

		this.setState({ [name]: value })
	}

	handleChangeDate = (name, value) => {
		this.setState({ [name]: value })
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const { url } = this.props;
		const { title, dateAt } = this.state;

		this.setState({ errors: [] });

		let paramsToValidate = [
			{ type: "text", id: 'title', value: title },
			{ type: "text", id: 'dateAt', value: dateAt },
		];

		let validate = Validateur.validateur(paramsToValidate)
		if (!validate.code) {
			Formulaire.showErrors(this, validate);
		} else {
			Formulaire.loader(true);
			let self = this;

			axios({ method: "POST", url: url, data: this.state })
				.then(function (response) {
					location.href = Routing.generate(URL_INDEX_ELEMENTS);
				})
				.catch(function (error) {
					Formulaire.displayErrors(self, error);
					Formulaire.loader(false);
				})
			;
		}
	}

	render () {
		const { context } = this.props;
		const { errors, title, dateAt } = this.state;

		let params0 = { errors: errors, onChange: this.handleChange }

		return <form onSubmit={this.handleSubmit}>
			<div className="flex flex-col gap-4 xl:gap-6">
				<div className="grid gap-2 xl:grid-cols-3 xl:gap-6">
					<div>
						<div className="font-medium text-lg">Album</div>
						<div className="text-gray-600 text-sm">
							Personnalisation du titre et date de la galerie de photos.
						</div>
					</div>
					<div className="flex flex-col gap-4 bg-white p-4 rounded-md ring-1 ring-inset ring-gray-200 xl:col-span-2">
						<div className="flex gap-4">
							<div className="w-full">
								<Input identifiant="title" valeur={title} {...params0}>Titre</Input>
							</div>
							<div className="w-full">
								<Input type="js-date" identifiant="dateAt" valeur={dateAt} {...params0}>Date</Input>
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