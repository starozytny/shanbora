import React, {Component} from 'react';

import Routing            from '@publicFolder/bundles/fosjsrouting/js/router.min.js';
import {Page}             from '@reactFolder/composants/page/Page';
import ActionsClassique   from '@reactFolder/functions/actions_classique';

export class RgpdList extends Component {
    constructor (props){
        super()

        this.state = {
            cardOpened: null
        }

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick = (id, seen) => {
        this.setState({ cardOpened: (id == this.state.cardOpened) ? null : id })

        if(seen == false){
            this.props.onUpdateSeen(id)
        }
    }

    render () {
        const {demandes, onDelete} = this.props
        const {cardOpened} = this.state

        let items = <div className="alert alert-primary">Aucun enregistrement.</div>;

        if(demandes.length != 0){
            items = demandes.map(elem => {

                let bodyOpened = (cardOpened != null && cardOpened == elem.id) ? true : false;

                return <div className={"card-2 card-2-opened-" + bodyOpened + " card-2-isSeen-" + elem.isSeen} key={elem.id}>
                    <div className="card-2-header" onClick={e => this.handleClick(elem.id, elem.isSeen)}>
                        <div className="title">{elem.firstname}</div>
                        <div className="subtitle">{elem.email}</div>
                    </div>
                    <div className="card-2-body" onClick={e => this.handleClick(elem.id, elem.isSeen)}>
                        <span className="subject"><span className={"rgpd-subject rgpd-subject-" + elem.subject}></span>{elem.subjectToStringShort}</span>
                        <p className="content">{elem.message}</p>
                    </div>
                    <div className="card-2-footer">
                        <div className="date">
                            {elem.isSeen ? <span className="icon-vision"></span> : <span className="icon-vision-not"></span>}
                            <span>{elem.createAtString}</span>
                        </div>
                        <div className="actions">
                            <div className="item">
                                <div className="btn-icon" onClick={e => onDelete(elem.id)}>
                                    <span className="icon-trash"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            })
        }

        return <div className="cards-container">
            <div className="cards-items"> {items} </div>
        </div>
    }
}

export class Rgpd extends Component {
    constructor (props){
        super();

        let data = JSON.parse(JSON.parse(props.demandes));
        let dataList = data.slice(0, 12);

        this.state = {
            dataImmuable: data,
            data: data,
            dataList: dataList,
            tailleList: data.length
        }

        this.handleUpdateList = this.handleUpdateList.bind(this);
        this.handleUpdateSeen = this.handleUpdateSeen.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleUpdateList = (dataList) => { this.setState({ dataList: dataList }) }

    handleUpdateSeen = (id) => {
        ActionsClassique.classiqueUpdateSeen(this, Routing.generate('super_rgpd_update_seen', {'rgpd': id}), id);
    }

    handleDelete = (id) => {
        ActionsClassique.classiqueDelete(this, Routing.generate('super_rgpd_delete', {'rgpd': id}), id);
    }

    render (){
        const {data, dataImmuable, dataList, tailleList} = this.state;

        let content = <div className="liste liste-rgpd">
            <RgpdList demandes={dataList} onDelete={this.handleDelete} onUpdateSeen={this.handleUpdateSeen} />
        </div>

        return <>
            <Page content={content} 
                havePagination="true" taille={tailleList} itemsPagination={data} perPage="12" onUpdate={this.handleUpdateList}
            />
        </>
    }
}