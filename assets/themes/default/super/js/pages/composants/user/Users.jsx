import React, {Component} from 'react';
import toastr             from 'toastr';
import axios              from 'axios/dist/axios';
import Swal               from 'sweetalert2';

import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import Loader             from '@reactFolder/functions/loader';
import ActionsArray       from '@reactFolder/functions/actions_array';
import {Page}             from '@reactFolder/composants/page/Page';
import {Aside}            from '@reactFolder/composants/page/Aside';
import {getSelector}      from '@reactFolder/composants/page/Selector';

import {AsideUser}        from './AsideUser';
import {AsideImport}      from './AsideImport';
import {UsersList}        from './UsersList';

export class Users extends Component {
    constructor (props) {
        super()

        let users = JSON.parse(JSON.parse(props.users));
        let usersList = users.slice(0, 12);

        this.state = {
            usersImmuable: users,
            users: users,
            usersList: usersList,
            tailleList: users.length,
        }

        this.asideuser = React.createRef()
        this.aside = React.createRef()

        this.handleUpdateList = this.handleUpdateList.bind(this)
        this.handleUpdateUser = this.handleUpdateUser.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        this.handleOpenAside = this.handleOpenAside.bind(this)
        this.handleConvertIsNew = this.handleConvertIsNew.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
        this.handleAllDelete = this.handleAllDelete.bind(this)
    }

    handleUpdateList = (usersList) => { this.setState({ usersList: usersList })  }

    handleSearch = (value) => { 
        let newItems = this.state.usersImmuable.filter(function(v) {
            if(v.username.toLowerCase().includes(value) || v.email.toLowerCase().includes(value)){ return v; }
        })
        let newList = newItems.slice(0, 12)
        this.setState({ usersList: newList, users: newItems, tailleList: newItems.length })  
    }

    handleOpenAside = (type, id) => { 
        if(type == "edit"){
            let user = this.state.usersImmuable.filter(v => v.id == id)
            if(user.length != 0){
                this.asideuser.current.handleOpen(type, user[0])
                this.aside.current.handleUpdate("Modifier " + user[0].username) 
            }else{
                toastr.error('Cet utilisateur n\'existe pas.')
            }
        }else{
            this.asideuser.current.handleOpen(type, null)
            this.aside.current.handleUpdate("Ajouter un utilisateur") 
        }
    }

    handleUpdateUser = (user) => { 
        this.asideuser.current.handleOpen("edit", user)
        this.aside.current.handleUpdate("Modifier " + user.username) 
        
        this.setState({
            usersList: ActionsArray.updateInArray(this.state.usersList, user), 
            users: ActionsArray.updateInArray(this.state.users, user),
            usersImmuable: ActionsArray.updateInArray(this.state.usersImmuable, user)
        })
    }

    handleConvertIsNew = (id) => {
        Swal.fire({
            title: 'Débloquer cet utilisateur ?',
            text: "Un mail pour la création du mot de passe sera envoyé.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, je confirme',
            cancelButtonText: 'Annuler'
          }).then((result) => {
            if (result.value) {
                let self = this
                axios({ method: 'post', url: Routing.generate('super_users_user_convert_is_new', {'user': id}) }).then(function (response) {
                    let data = response.data; let code = data.code; Loader.loader(false)

                    if(code === 1){
                        let user = self.state.usersImmuable.filter(v => v.id == id)
                        user[0].isNew = false;
        
                        self.setState({users: ActionsArray.updateInArray(self.state.users, user[0])})
                        toastr.info('Mise à jour effectuée.')
                    }else{
                        toastr.error(data.message)
                    }
                });
            }
          })
    }

    handleDelete = (id) => {
        Swal.fire({
            title: 'Etes-vous sûr ?',
            text: "La suppression est définitive.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, je confirme',
            cancelButtonText: 'Annuler'
          }).then((result) => {
            if (result.value) {
                Loader.loader(true)
                let self = this
                axios({ method: 'post', url: Routing.generate('super_users_user_delete', {'user': id}) }).then(function (response) {
                    let data = response.data; let code = data.code; Loader.loader(false)

                    if(code === 1){
                        let user = self.state.usersImmuable.filter(v => v.id == id)
                        self.setState({
                            usersList: ActionsArray.deleteInArray(self.state.usersList, user[0]), 
                            users: ActionsArray.deleteInArray(self.state.users, user[0]),
                            usersImmuable: ActionsArray.deleteInArray(self.state.usersImmuable, user[0]),
                            tailleList: parseInt(self.state.tailleList) - 1,
                        })
                        toastr.info('Suppression réussie.')
                    }else{
                        toastr.error(data.message)
                    }
                });
            }
          })
    }

    handleAllDelete = (e) => {
        let selectors = getSelector();

        if(selectors.length != 0){
            Swal.fire({
                title: 'Etes-vous sûr ?',
                text: "La suppression de tous les éléments sélectionnés sera définitive.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui, je confirme',
                cancelButtonText: 'Annuler'
              }).then((result) => {
                if (result.value) {
                    Loader.loader(true)
                    let fd = new FormData();
                    fd.append('selectors', selectors);
                    let self = this
                    axios({ method: 'post', url: Routing.generate('super_users_user_delete_all'), data: fd }).then(function (response) {
                        let data = response.data; let code = data.code;
    
                        if(code === 1){
                            location.reload();
                            toastr.info('Suppression réussie.')
                        }else{
                            Loader.loader(false)
                            toastr.error(data.message)
                        }
                    });
                }
              })
        }else{
            toastr.warning('Aucun élément séléctionné.')
        }
    }

    render () {
        const {users, usersImmuable, usersList, tailleList} = this.state;

        let content = <div className="liste liste-user">
            <UsersList users={usersList} onOpenAside={this.handleOpenAside} onConvertIsNew={this.handleConvertIsNew} onDelete={this.handleDelete} />
        </div>

        let asideContent = <AsideUser users={usersImmuable} onUpdate={this.handleUpdateUser} ref={this.asideuser} />
        let asideImport = <AsideImport urlForm={Routing.generate('super_users_import')}/>
        
        return <>
            <Page content={content} 
                  havePagination="true" taille={tailleList} itemsPagination={users} perPage="12" onUpdate={this.handleUpdateList}
                  haveSearch="true" onSearch={this.handleSearch}
                  haveAdd="true" onAdd={() => this.handleOpenAside("add", null)}
                  haveExport="true" nameExport="utilisateurs" urlExportExcel={Routing.generate('super_users_export', {'format': 'excel'})} urlExportCsv={Routing.generate('super_users_export', {'format': 'csv'})}
                  haveImport="true" asideImport={asideImport}
                  haveAllDelete="true" onAllDelete={this.handleAllDelete}
                  />
            <Aside content={asideContent} ref={this.aside}/>
            
        </>
    }
}