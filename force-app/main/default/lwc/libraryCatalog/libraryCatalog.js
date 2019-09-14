import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import { registerListener, unregisterAllListeners } from 'c/pubsub';
import getLibraryItems from '@salesforce/apex/CatalogController.getLibraryItems';
import getTotalPages from '@salesforce/apex/CatalogController.getTotalPages';

export default class LibraryCatalog extends LightningElement {
    @wire(CurrentPageReference) pageRef;

    @track libraryUpdate;
    @track libraryItems;
    @track totalPagesWire;
    @track barcodeSearch = "";
    @track typeSearch = "";
    @track nameSearch = "";
    @track statusSearch = "";
    @track currPage = 1;
    @track totalPages = '';

    connectedCallback() {
        // subscribe to checkout event
        registerListener('checkout', this.checkoutHandler, this);
        registerListener('return', this.checkoutHandler, this);
    }

    disconnectedCallback() {
        // unsubscribe from checkout event
        unregisterAllListeners(this);
    }

    checkoutHandler() {
        console.log('test');
        refreshApex(this.libraryUpdate)
    }

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
        statusSearch: '$statusSearch',
        pageNumber: '$currPage'
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
                this.resetPageNumber();
                break;
            case 'type':
                this.typeSearch = event.detail.value;
                this.resetPageNumber();
                break;
            case 'name':
                this.nameSearch = event.target.value;
                this.resetPageNumber();
                break;
            case 'status':
                this.statusSearch = event.detail.value;
                this.resetPageNumber();
                break;
            case 'pnum':
                if (event.target.value) {
                    digitMatcher = new RegExp('^\\d+$');
                    if (event.target.value.match(digitMatcher)) { 
                        const num = parseInt(event.target.value, 10);
                        if (num === 0) {
                            event.target.value = '1';
                            this.currPage = 1;
                        }
                        else if (num < this.totalPages) {
                            this.currPage = parseInt(event.target.value, 10);
                        } else {
                            event.target.value = this.totalPages;
                            this.currPage = parseInt(this.totalPages, 10);
                        }
                    } else {
                        event.target.value = this.currPage.toString();
                    }
                }
                break;
            default:
                this.nameSearch = source[1];
                break;
        }
        return refreshApex(this.libraryUpdate);
    }

    // Resets page number when search terms are updated.
    resetPageNumber() {
        var inputField = this.template.querySelector('.pnum');
        inputField.value = '1';
        this.currPage = 1;
    }
}