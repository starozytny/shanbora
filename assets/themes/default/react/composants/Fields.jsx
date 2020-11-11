import React from 'react';

import Trumbowyg from 'react-trumbowyg';
import 'react-trumbowyg/dist/trumbowyg.min.css';
import '@nodeModulesFolder/trumbowyg/dist/plugins/base64/trumbowyg.base64';
import '@nodeModulesFolder/trumbowyg/dist/plugins/cleanpaste/trumbowyg.cleanpaste';
import '@nodeModulesFolder/trumbowyg/dist/plugins/colors/trumbowyg.colors';
import '@nodeModulesFolder/trumbowyg/dist/plugins/colors/ui/sass/trumbowyg.colors.scss';
import '@nodeModulesFolder/trumbowyg/dist/plugins/fontsize/trumbowyg.fontsize';
import '@nodeModulesFolder/trumbowyg/dist/plugins/pasteimage/trumbowyg.pasteimage';
import '@nodeModulesFolder/trumbowyg/dist/plugins/history/trumbowyg.history';
import '@nodeModulesFolder/trumbowyg/dist/plugins/upload/trumbowyg.upload';
import '@reactFolder/functions/textarea/plugins/trumbowyg.alert';

import DatePicker from "react-datepicker";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import fr from 'date-fns/locale/fr';
registerLocale('fr', fr)
import "react-datepicker/dist/react-datepicker.css";

import {Drop} from './Drop';

export function Input({type="text", identifiant, valeur, onChange, children, placeholder}) {
    let content = <input type={type} name={identifiant} id={identifiant} placeholder={placeholder} value={valeur.value} onChange={onChange}/>

    return (<ClassiqueStructure valeur={valeur} identifiant={identifiant} content={content} label={children} />)
}

export function Checkbox({items, name, valeur, onChange, children}) {
    let itemsInputs = items.map(elem => {
        return <div className={"checkbox-item " + (elem.checked ? 'checked' : '')} key={elem.id}>
            <label htmlFor={elem.identifiant}>
                {elem.label}
                <input type="checkbox" name={name} id={elem.identifiant} value={elem.value} checked={elem.checked ? 'checked' : ''} onChange={onChange}/>
            </label>
        </div>
    })

    let content = <div className="checkbox-items">{itemsInputs}</div>

    return (<ClassiqueStructure valeur={valeur} identifiant="" content={content} label={children} classForm="form-group-checkbox " />)
}

export function Radiobox({items, name, valeur, onChange, children}) {
    let itemsInputs = items.map(elem => {
        return <div className={"radiobox-item " + (elem.checked ? 'checked' : '')} key={elem.id}>
            <label htmlFor={elem.identifiant}>
                <span>{elem.label}</span>
                <input type="radio" name={name} id={elem.identifiant} value={elem.value} checked={elem.checked ? 'checked' : ''} onChange={onChange}/>
            </label>
        </div>
    })

    let content = <div className="radiobox-items">{itemsInputs}</div>

    return (<ClassiqueStructure valeur={valeur} identifiant="" content={content} label={children} classForm="form-group-radiobox " />)
}

export function TextArea({identifiant, valeur, onChange, rows="8", children}) {
    let content = <textarea name={identifiant} id={identifiant} value={valeur.value} rows={rows} onChange={onChange}/>

    return (<ClassiqueStructure valeur={valeur} identifiant={identifiant} content={content} label={children} />)
}

export function TextAreaWys({identifiant, valeur, onChange, reference, url="", children}){
    let content = <Trumbowyg id='react-trumbowyg'
                            buttons={
                                [
                                    ['viewHTML'],
                                    ['historyUndo', 'historyRedo'],
                                    ['formatting'],
                                    ['fontsize'],
                                    'btnGrp-semantic',
                                    ['link'],
                                    ['insertImage'],
                                    ['upload'],
                                    ['base64'],
                                    ['foreColor', 'backColor'],
                                    'btnGrp-justify',
                                    'btnGrp-lists',
                                    ['horizontalRule'],
                                    ['alert'],
                                    ['fullscreen']
                                ]
                            }
                            data={valeur.value}
                            placeholder=''
                            onChange={onChange}
                            ref={reference}
                            plugins= {{
                                upload: {
                                    serverPath: url,
                                    fileFieldName: 'image',
                                    urlPropertyName: 'data.link'
                                }
                            }}
    />

    return (<ClassiqueStructure valeur={valeur} identifiant={identifiant} content={content} label={children} />)
}

export function Select({identifiant, valeur, onChange, children, items}) {
    let choices = items.map((item) => 
        <option key={item.value} value={item.value}>{item.libelle}</option>
    )

    let content = <select value={valeur.value} id={identifiant} name={identifiant} onChange={onChange}> {choices} </select>

    return (<ClassiqueStructure valeur={valeur} identifiant={identifiant} content={content} label={children} />)
}

export function DatePick({identifiant, valeur, onChange, children, minDate="", maxDate="", format="dd/MM/yyyy", placeholder="DD/MM/YYYY"}){
    let content = <DatePicker
        locale="fr"
        id={identifiant}
        selected={valeur.inputVal}
        onChange={onChange}
        dateFormat={format}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
    />

    return (<ClassiqueStructure valeur={valeur} identifiant={identifiant} content={content} label={children} classForm="form-group-date " />)
}

export function DateTimePick({identifiant, valeur, onChange, children, minDate="", maxDate="", format="dd/MM/yyyy HH:mm", placeholder="DD/MM/YYYY HH:MM", timeFormat="HH:mm", timeIntervals=15}){
    let content = <DatePicker
        locale="fr"
        id={identifiant}
        selected={valeur.inputVal}
        onChange={onChange}
        dateFormat={format}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        showTimeSelect
        dropdownMode="select"
        placeholderText={placeholder}
        minDate={minDate}
        maxDate={maxDate}
    />

    return (<ClassiqueStructure valeur={valeur} identifiant={identifiant} content={content} label={children} classForm="form-group-date " />)
}

export function Switcher({identifiant, valeur, children, isChecked, onChange}){
    let content = <div className="toggle-wrapper">
        <div className="toggle checkcross">
            <input id={identifiant} name={identifiant} checked={isChecked ? 'checked' : ''} className="input-checkcross" onChange={onChange} type="checkbox"/>
            <label className="toggle-item" htmlFor={identifiant}>
                <div className="check"></div>
            </label>
        </div>
    </div>

    return (<ClassiqueStructure valeur={valeur} identifiant={identifiant} content={content} label={children} />)
}

export function InputFile({valeur, identifiant, onGetFile, children, accept, dropLabel, dropError}) {
    let content = <div className="form-files">
        <Drop label={dropLabel} labelError={dropError}
            accept={accept} maxFiles={1} onGetFile={onGetFile}/>
    </div>

    return (<ClassiqueStructure valeur={valeur} identifiant={identifiant} content={content} label={children} />)
}

export function Error({valeur}){
    return (
        <div className="error">{valeur.error ? <><span className='icon-warning'></span>{valeur.error}</> : null}</div>
    )
}

export function ClassiqueStructure({valeur, identifiant, content, label, classForm=""}){
    return (
        <div className={classForm + 'form-group' + (valeur.error ? " form-group-error" : "")}>
            <label htmlFor={identifiant}>{label}</label>
            {content}
            <Error valeur={valeur}/>
        </div>
    )
}