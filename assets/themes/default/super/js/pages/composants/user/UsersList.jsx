import React, {Component} from 'react';

import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import {Selector}         from '@reactFolder/composants/page/Selector';

export class UsersList extends Component {
    render () {
        const {users, onOpenAside, onConvertIsNew, onDelete} = this.props

        let items = users.map(elem => {
            let impersonate = Routing.generate('app_homepage', {'_switch_user': elem.username})
            if(elem.highRoleCode == 2){
                impersonate = Routing.generate('admin_dashboard', {'_switch_user': elem.username})
            }else if(elem.highRoleCode == 1){
                impersonate = Routing.generate('super_users_index', {'_switch_user': elem.username})
            }

            return <div className="item-user" key={elem.id}>
                <div className="item-user-actions">
                    <div className="user-selector">
                        {elem.highRoleCode != 1 ? <Selector identifiant={elem.id}/> : null}
                        {elem.highRoleCode != 0 ? <div className="item-user-roles"><div className={"user-badge user-badge-" + elem.highRoleCode}>{elem.highRole}</div></div> : null}
                    </div>
                    <div className="user-actions">
                        <span className="icon-more"></span>
                        <div className="user-actions-drop">
                            <div className="drop-items">
                                <span className="drop-item" onClick={() => onOpenAside("edit", elem.id)}>Modifier</span>
                                {elem.highRoleCode != 1 ? <span className="drop-item" onClick={() => onDelete(elem.id)}>Supprimer</span> : null}
                                <a className="drop-item" href={impersonate}>Impersonate</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="item-user-avatar" onClick={() => onOpenAside("edit", elem.id)}>
                    <img src={"../../uploads/" + elem.avatar} alt={"avatar de " + elem.username} />
                </div>
                <div className="item-user-username">
                    {elem.isNew ? <><div className="user-new btn-icon" onClick={() => onConvertIsNew(elem.id)}><span className="icon-unlock"></span><span className="icon-padlock"></span><span className="tooltip">Débloquer</span></div></> : null}          
                    <span onClick={() => onOpenAside("edit", elem.id)}>{elem.username}</span>
                </div>
                <div className="item-user-email">{elem.email}</div>   
            </div>
        })

        return <> {items} </>
    }
}