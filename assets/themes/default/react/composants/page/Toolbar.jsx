import React, {Component} from 'react';
import {Search}           from './Search';

export class Toolbar extends Component {
    render () {
        const {haveBack, hrefBack, txtBack, haveSearch, onSearch, haveAdd, onAdd} = this.props

        return <>
            <div className="toolbar">
                <div className="toolbar-left">
                    {haveBack ? <div className="toolbar-item"> <a className="btn" href={hrefBack}><span>{txtBack ? txtBack : "Retour"}</span></a> </div> : null}
                    {haveAdd ? <div className="toolbar-item"> <button className="btn btn-primary" onClick={onAdd}><span>Ajouter</span></button> </div> : null}
                </div>
                <div className="toolbar-right">
                    {haveSearch ? <div className="toolbar-item"> <Search onSearch={onSearch} /> </div> : null}
                </div>
            </div>
        </>
    }
}