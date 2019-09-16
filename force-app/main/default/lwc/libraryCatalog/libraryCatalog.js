import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import { registerListener, unregisterAllListeners } from 'c/pubsub';
import getLibraryItems from '@salesforce/apex/CatalogController.getLibraryItems';
import getTotalPages from '@salesforce/apex/CatalogController.getTotalPages';

export default class LibraryCatalog extends LightningElement {
    // pageref for inter-component event handling
    @wire(CurrentPageReference) pageRef;

    // Variables for refreshApex(this.{variable})
    @track libraryUpdate;
    @track totalPagesWire;

    // Wire result list
    @track libraryItems;

    // Search field variables
    @track barcodeSearch = "";
    @track typeSearch = "";
    @track nameSearch = "";
    @track statusSearch = "";

    // paginator variables
    @track currPage = 1;
    @track totalPages = '';

    // methods for inter-component event handling
    connectedCallback() {
        registerListener('checkout', this.checkoutHandler, this);  // subscribe to checkout event
        registerListener('return', this.checkoutHandler, this);  // subscribe to a return event
    }

    disconnectedCallback() {
        // unsubscribe from checkout/return events
        unregisterAllListeners(this);
    }

    checkoutHandler() {
        refreshApex(this.libraryUpdate)
    }

    // gets options for the picklists in the search field
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

    // wire to get library items for display in the catalog
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
            this.libraryItems = undefined;
        }
    }

    // handles changes from search fields/page number input
    changeHandler(event) {
        var digitMatcher;
        var re = new RegExp('([A-Za-z]+)-?\\d*');  // matches "someid-####"
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
                break;
        }
        return refreshApex(this.libraryUpdate);
    }

    // wires the total number of pages for page display
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

    // Resets page number to 1 when search terms are updated.
    resetPageNumber() {
        var inputField = this.template.querySelector('.pnum');
        inputField.value = '1';
        this.currPage = 1;
    }
}