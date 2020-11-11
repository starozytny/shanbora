import React, { Component } from 'react';
import toastr               from 'toastr';
import Loader               from '../functions/loader';
import Dropzone             from 'react-dropzone-uploader';

export class Drop extends Component {
    constructor (props) {
        super(props)

        this.handleChangeStatus = this.handleChangeStatus.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.getUploadParams = this.getUploadParams.bind(this)
    }

    getUploadParams = (e) => {
        Loader.loaderWithoutAjax(true)
        this.props.onGetFile(e)
        return { url: 'https://httpbin.org/post' }
    }

    handleChangeStatus = ({meta, remove}, status) => {
        
        if (status === 'headers_received') {
            toastr.info(`${meta.name} téléchargé !`)
            if(this.props.remove){
                remove()
            }else{
                Loader.loaderWithoutAjax(false)
            }
        } else if (status === 'aborted') {
            toastr.error(`${meta.name}, n'a pas pu être téléchargé..`)
            Loader.loaderWithoutAjax(false)
        }
    }

    handleSubmit = (files, allFiles) => {
        allFiles.forEach(f => f.remove())
    }

    render () {

        return <>
            <Dropzone
                getUploadParams={this.getUploadParams}
                onChangeStatus={this.handleChangeStatus}
                accept={this.props.accept}
                maxFiles={this.props.maxFiles}
                multiple={this.props.maxFiles > 1 ? true : false}
                canCancel={false}
                inputContent={(files, extra) => (extra.reject ? this.props.labelError : this.props.label)}
            />
        </>
    }
}