import React, {Component} from 'react';
import {Input} from '../../../../../react/composants/Fields';
import {Formulaire} from '../../../../../react/composants/Formulaire';
import Validateur from '../../../../../react/functions/validateur';
import AjaxSend from '../../../../../react/functions/ajax_classique';

export class FormReinit extends Component {
    constructor(props) {
        super();

        this.state = {
            success: '',
            error: '',
            password: { value: '', error: '' },
            password2: { value: '', error: '' }
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e){
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            success: '',
            [name]: {value: value}
        });
    } 

    handleSubmit(e){
        e.preventDefault();
        
        const {password, password2} = this.state

        //Validation
        let validate = Validateur.validateur([
            {type: "password", id: 'password', value: password.value},
            {type: "password", id: 'password2', value: password2.value}
        ]);

        if(password.value != password2.value){
            validate.code = false;
            validate.errors = {...validate.errors, ...{password: {value: password.value, error: 'Les mots de passe ne sont pas identiques.'}}};
        }

        //Display error if validate != true else call Ajax password lost
        if(!validate.code){
            this.setState(validate.errors);
        }else{
            AjaxSend.sendAjax(this, this.props.url, this.state, {
                password: { value: '', error: '' },
                password2: { value: '', error: '' }
            });
        }
    }

    render() {
        const {password, password2, success, error} = this.state;

        return (
            <>
                <div className="password-rules">
                    <span>Règles de création de mot de passe</span>
                    <ul>
                        <li>12 caractères minimum</li>
                        <li>au moins 1 majuscule</li>
                        <li>au moins 1 minuscule</li>
                        <li>au moins 1 chiffre</li>
                        <li>au moins 1 caractère spécial</li>
                    </ul>
                </div>
                <Formulaire 
                    onSubmit={this.handleSubmit}
                    success={success} error={error}
                    inputs={
                        <>
                            <div className="line">
                                <Input valeur={password} type="password" identifiant="password" onChange={this.handleChange}>Mot de passe</Input>
                            </div>
                            <div className="line">
                                <Input valeur={password2} type="password" identifiant="password2" onChange={this.handleChange}>Confirmer le mot de passe</Input>
                            </div>
                        </>
                    }
                    btn="Réinitialiser"
                />
            </>
        );
    }
}