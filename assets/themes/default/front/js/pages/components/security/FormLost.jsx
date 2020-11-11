import React, {Component} from 'react';

import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import {Input}            from '@reactFolder/composants/Fields';
import {Formulaire}       from '@reactFolder/composants/Formulaire';
import Validateur         from '@reactFolder/functions/validateur';
import AjaxSend           from '@reactFolder/functions/ajax_classique';


export class FormLost extends Component {
    constructor(props) {
        super();

        this.state = {
            success: '',
            error: '',
            email: { value: '', error: '' }
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

        //Validation
        let validate = Validateur.validateur([
            {type: "email", id: 'email', value: this.state.email.value}
        ]);

        //Display error if validate != true else call Ajax password lost
        if(!validate.code){
            this.setState(validate.errors);
        }else{
            AjaxSend.sendAjax(this, Routing.generate('app_password_lost', {'user': null}), this.state, {
                email: { value: '', error: '' }
            });
        }
    }

    render() {
        const {active, onClose} = this.props
        const {success, error, email} = this.state;
        return (
            <>
                {active ? <div className="form-lost">
                    <Formulaire 
                        onSubmit={this.handleSubmit}
                        success={success}
                        error={error}
                        inputs={
                            <div className="line">
                                <Input type="email" valeur={email} identifiant="email" onChange={this.handleChange}>Email</Input>
                            </div>
                        }
                        btn="Envoyer"
                    />
                    <div className="overlay" onClick={onClose}></div>
                </div> : null}
                
            </>
        );
    }
}

export class ButtonLost extends Component {
    constructor (props){
        super ()

        this.state = {
            active: false
        }

        this.handleClick = this.handleClick.bind(this);   
        this.handleClose = this.handleClose.bind(this);   
    }

    handleClick = (e) => {
        this.setState({active: true})
    }

    handleClose = (e) => {
        this.setState({active: false})
    }

    render () {
        const {active} = this.state

        return <>
            <a onClick={this.handleClick}>Mot de passe oublié ?</a>
            <FormLost ref="formlost" active={active} onClose={this.handleClose}/>
        </>
    }
}