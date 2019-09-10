import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import getLibraryItems from '@salesforce/apex/controller.getLibraryItems';

export default class LibraryCatalog extends LightningElement {
    @track libraryUpdate;
    @track libraryItems;
    @track barcodeSearch = "";
    @track typeSearch = "";
    @track nameSearch = "";
    @track statusSearch = "";

    @wire(getLibraryItems, { 
        barcodeSearch: '$barcodeSearch',
        typeSearch: '$typeSearch',
        nameSearch: '$nameSearch',
        statusSearch: '$statusSearch'
    })
    wiredLibraryItems(libraryUpdate) {
        this.libraryUpdate = libraryUpdate;
        const { error, data } = libraryUpdate;
        if (data) {
            this.libraryItems = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
        }
    }

    get typeOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'AV', value: 'AV Equipment' },
            { label: 'Book', value: 'Book' }
        ]
    }

    get availabilityOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' }
        ]
    }

    changeHandler(event) {
        var re = new RegExp('([A-Za-z]+)-?\\d*');
        var source = event.target.id.match(re);
        switch (source[1]) {
            case 'bar':
                this.barcodeSearch = event.target.value;
                break;
            case 'type':
                this.typeSearch = event.detail.value;
                break;
            case 'name':
                this.nameSearch = event.target.value;
                break;
            case 'status':
                this.statusSearch = event.detail.value;
                break;
            default:
                this.nameSearch = source[1];
                break;
        }
        return refreshApex(this.libraryUpdate);
    }
}