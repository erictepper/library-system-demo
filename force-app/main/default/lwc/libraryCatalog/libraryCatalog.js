import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import getLibraryItems from '@salesforce/apex/catalogController.getLibraryItems';

export default class LibraryCatalog extends LightningElement {
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
    wiredLibraryItems({ error, data }) {
        if (data) {
            this.libraryItems = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
        }
    }

    changeHandler(event) {
        var re = new RegExp('([A-Za-z]+)-?\\d*');
        var source = event.target.id.match(re);
        switch (source[1]) {
            case 'bar':
                this.barcodeSearch = event.target.value;
                break;
            case 'type':
                this.typeSearch = event.target.value;
                break;
            case 'name':
                this.nameSearch = event.target.value;
                break;
            case 'status':
                this.statusSearch = event.target.value;
                break;
            default:
                this.nameSearch = source[1];
                break;
        }
        refreshApex(this.wiredLibraryItems);
    }
}