import React, {Component} from 'react';

export function Selector({identifiant}){
    return (
        <input type="checkbox" name="item-selector" id={"item-selector-" + identifiant} value={identifiant} />
    )
}

export function getSelector(){
    let items = document.querySelectorAll("input[name=item-selector]:checked")

    let selectors = [];
    if(items.length != 0){
        items.forEach(elem => {
            selectors.push(elem.value)
        })
    }

    return selectors;
}