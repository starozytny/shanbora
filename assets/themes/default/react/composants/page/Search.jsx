import React, {Component} from 'react';
import {Input}            from '../Fields';

export class Search extends Component {
    constructor (props){
        super(props)

        this.state = {
            search: {value: '', error: ''}
        }

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (e) => {
        let value = e.currentTarget.value
        this.setState({[e.currentTarget.name]: {value: value}})
        this.props.onSearch(value);
    }

    render () {
        const {search} = this.state;
        return <>
            <Input type="search" identifiant="search" valeur={search} onChange={this.handleChange} placeholder="Recherche" />
        </>
    }
}