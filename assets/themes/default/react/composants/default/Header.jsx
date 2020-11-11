import React, {Component} from 'react';
import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

export class Header extends Component {
    render () {
        const {username, avatar, onOpenMenu} = this.props;

        return <header>
            <div className="header-user">
                <div className="header-user-avatar">
                    <img src={window.location.origin + "/uploads/" + avatar} alt={"avatar de " + username} />
                </div>
                <div className="header-user-username">{username}</div>
                <a href={Routing.generate('app_logout')} className="btn-icon" title="Se déconnecter"><span className="icon-logout"></span><span className="tooltip tooltip-bot-right">Se déconnecter</span></a>
            </div>
            <span className="icon-menu" onClick={onOpenMenu}></span>
        </header>
    }
}