import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import getLibraryItems from '@salesforce/apex/catalogController.getLibraryItems';

export default class LibraryCatalog extends LightningElement {
    @track libraryItems;
    @track nameSearch = "";
    @track typeSearch = "";

    @wire(getLibraryItems, { 
        nameSearch: '$nameSearch',
        typeSearch: '$typeSearch' 
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
        this.nameSearch = event.target.value;
        refreshApex(this.wiredLibraryItems);
    }
}