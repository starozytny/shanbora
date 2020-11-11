import React, {Component} from 'react';
import {Menu}             from './Menu';

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
        const {menu} = this.props;
        const {menuOpened} = this.state;

        return <>
            <div className="navigation">
                <Menu menu={menu} menuOpened={menuOpened} onCloseMenu={this.handleCloseMenu} onOpenMenu={this.handleOpenMenu}/>
                <div className={"overlay " + menuOpened} onClick={this.handleCloseMenu} ></div>
            </div>
        </>
    }
}