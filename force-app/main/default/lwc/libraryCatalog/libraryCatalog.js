import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import getLibraryItems from '@salesforce/apex/CatalogController.getLibraryItems';
import getTotalPages from '@salesforce/apex/CatalogController.getTotalPages';

export default class LibraryCatalog extends LightningElement {
    @track libraryUpdate;
    @track libraryItems;
    @track totalPagesWire;
    @track barcodeSearch = "";
    @track typeSearch = "";
    @track nameSearch = "";
    @track statusSearch = "";
    @track currPage = '';
    @track totalPages;

    @wire(getTotalPages, { 
        barcodeSearch: '$barcodeSearch',
        typeSearch: '$typeSearch',
        nameSearch: '$nameSearch',
        statusSearch: '$statusSearch'
    })
    wiredTotalPages(totalPagesWire) {
        this.totalPagesWire = totalPagesWire;
        const { error, data } = totalPagesWire;
        if (data) {
            this.totalPages = data.toString();
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.totalPages = '1';
        } else {
            this.totalPages = '1';
        }
    }

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
        var digitMatcher;
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
            case 'pnum':
                if (event.target.value) {
                    digitMatcher = new RegExp('^\\d+$');
                    if (event.target.value.match(digitMatcher)) { 
                        const num = parseInt(event.target.value, 10);
                        if (num === 0) {
                            event.target.value = 1;
                            this.currPage = 1;
                        }
                        else if (num < this.totalPages) {
                            this.currPage = event.target.value;
                        } else {
                            event.target.value = this.totalPages;
                            this.currPage = this.totalPages;
                        }
                    } else {
                        event.target.value = this.currPage;
                    }
                }
                break;
            default:
                this.nameSearch = source[1];
                break;
        }
        return refreshApex(this.libraryUpdate);
    }
}