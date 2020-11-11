import React, {Component} from 'react';
import {Menu}             from './Menu';
import {Header}           from './Header';

export class Default extends Component {
    constructor(props) {
        super(props)

        this.state = {
            menuOpened: ''
        }

        this.handleOpenMenu = this.handleOpenMenu.bind(this);
        this.handleCloseMenu = this.handleCloseMenu.bind(this);
    }

    handleOpenMenu = (e) => this.setState({menuOpened: 'active'});
    handleCloseMenu = (e) => this.setState({menuOpened: ''});

    render () {
        const {title, menu, menuBottom, username, avatar} = this.props;
        const {menuOpened} = this.state;

        return <>
            <Header username={username} avatar={avatar} onOpenMenu={this.handleOpenMenu} />
            <Menu title={title} menu={menu} menuBottom={menuBottom} menuOpened={menuOpened} onCloseMenu={this.handleCloseMenu} />
            <div className={"overlay " + menuOpened} onClick={this.handleCloseMenu} ></div>
        </>
    }
}