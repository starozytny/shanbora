import React, {Component} from 'react';
import toastr             from 'toastr';
import axios              from 'axios/dist/axios';

import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import Loader             from '@reactFolder/functions/loader';
import Validateur         from '@reactFolder/functions/validateur';
import ActionsArray       from '@reactFolder/functions/actions_array';
import {Input, Checkbox}  from '@reactFolder/composants/Fields';
import {Alert}            from '@reactFolder/composants/Alert';
import {Drop}             from '@reactFolder/composants/Drop';

export class AsideUser extends Component {
    constructor (props) {
        super()

        this.state = {
            type: 'edit',
            error: '',
            user: undefined,
            users: props.users,
            username: {value: '', error: ''},
            email: {value: '', error: ''},
            roles: {value: [], error:''},
            file: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        
        this.handleGetFile = this.handleGetFile.bind(this)

        this.handleOpen = this.handleOpen.bind(this)
    }

    handleOpen = (type, user) => {
        if(type == "edit"){
            this.setState({
                type: type,
                user: user,
                username: {value: user.username, error:''},
                email: {value: user.email, error:''},
                roles: {value: user.roles, error:''}
            })
        }else{
            this.setState({
                type: type,
                user: undefined,
                username: {value: "", error:''},
                email: {value: "", error:''},
                roles: {value: [], error:''}
            }) 
        }
        document.getElementById("username").focus();
    }

    handleChange = (e) => { 
        let name = e.currentTarget.name;
        let value = e.currentTarget.value;

        const {roles} = this.state
        if(name === "roles"){
            value = (e.currentTarget.checked) ? [...roles.value, ...[value]] :  roles.value.filter(v => v != value)
        }        

        this.setState({[name]: {value: value}}) 
    }

    handleGetFile = (e) => { this.setState({file: e.file}) }

    handleSubmit = (e) => {
        e.preventDefault()

        const {type, user, users, username, email, roles} = this.state

        let validate = Validateur.validateur([
            {type: "text", id: 'username', value: username.value},
            {type: "email", id: 'email', value: email.value},
            {type: "array", id: 'roles', value: roles.value}
        ]);

        let id = (user != undefined) ? user.id : null
        if(users.filter(v => v.username.toLowerCase() == username.value.toLowerCase() && v.id != id).length != 0){
            validate.code = false;
            validate.errors = {...validate.errors, ...{username: {value: username.value, error: 'Ce nom d\'utilisateur est déjà pris.'}}};
        }

        if(users.filter(v => v.email.toLowerCase() == email.value.toLowerCase() && v.id != id).length != 0){
            validate.code = false;
            validate.errors = {...validate.errors, ...{email: {value: email.value, error: 'Cette adresse email est déjà pris.'}}};
        }

        if(!validate.code){
            this.setState(validate.errors);
        }else{
            Loader.loader(true)

            let fd = new FormData();
            fd.append('data', JSON.stringify(this.state));
            fd.append('file', this.state.file);
            
            let url = (type === 'edit') ? Routing.generate('super_users_user_update', {'user': user.id}) : Routing.generate('super_users_user_add');

            let self = this
            axios({ method: 'post', url: url, data: fd, headers: {'Content-Type': 'multipart/form-data'} }).then(function (response) {
                let data = response.data; let code = data.code; Loader.loader(false)

                if(code === 1){
                    if(type === "edit"){
                        user.username = username.value;
                        user.email = email.value;
                        user.roles = roles.value;
                        user.highRoleCode = data.highRoleCode;
                        user.highRole = data.highRole;
                        user.avatar = data.avatar;
    
                        self.setState({users: ActionsArray.updateInArray(self.state.users, user)})
                        self.props.onUpdate(user)
    
                        toastr.info('Mise à jour effectuée.')
                    }else{
                        location.reload()
                    }
                }else{
                    self.setState({error: data.message})
                }
            });
        }
    }

    render () {
        const {type, user, error, username, email, roles} = this.state

        let rolesItems = [
            { 'id': 1, 'value': 'ROLE_SUPER_ADMIN', 'label': 'Super admin', 'identifiant': 'superamdin', 'checked': false },
            { 'id': 2, 'value': 'ROLE_ADMIN', 'label': 'Admin', 'identifiant': 'admin', 'checked': false },
            { 'id': 0, 'value': 'ROLE_USER',  'label': 'Utilisateur', 'identifiant': 'utilisateur', 'checked': false },
        ]

        if(roles.length != 0){
            rolesItems.map(el => {
                roles.value.map(elem => {
                    if (elem == el.value){ el.checked = true }
                })
            })
        }

        let infos = null, title = null, btnText = "Ajouter";

        if(type === 'edit'){
            btnText = "Mettre à jour"
            title = "Modification"
            infos = user === undefined ? null : <div className="aside-user-informations">
                {user.lastLoginString != null ? <div>Dernière connexion le {user.lastLoginString}</div> : null}
                <div>Créé le {user.createAtString}</div>
                <div>Renouvellement du mot de passe le {user.renouvTimeString}</div>
            </div>
        }

        return <>
            {infos}
            <form className={"aside-user-form aside-user-form-" + type} onSubmit={this.handleSubmit}>
                {title ? <span className="form-title">{title}</span> : null}
                {error != '' ? <Alert type="danger" message={error} active="true" /> : null}
                <div className="line line-2">
                    <Input identifiant="username" valeur={username} onChange={this.handleChange}>Nom d'utilisateur</Input>
                    <Input type="email" identifiant="email" valeur={email} onChange={this.handleChange}>Adresse e-mail</Input>
                </div>
                <div className="line">
                    <Checkbox items={rolesItems} name="roles" valeur={roles} onChange={this.handleChange}>Roles</Checkbox>
                </div>
                <div className="line">
                    <label>Avatar</label>
                    <div className="form-files">
                        {user === undefined ? null : <div className="form-avatar"><img src={'../../uploads/' + user.avatar} alt="Avatar actuel de l'utilisateur"/></div>}
                        <Drop label="Téléverser un avatar" labelError="Seules les images sont acceptées."
                              accept={"image/*"} maxFiles={1} onGetFile={this.handleGetFile}/>
                    </div>
                </div>
                <div className="form-button">
                    <button type="submit" className="btn btn-primary"><span>{btnText}</span></button>
                </div>
            </form>
        </>
    }
}