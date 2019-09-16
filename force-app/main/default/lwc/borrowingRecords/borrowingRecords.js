import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import { registerListener, unregisterAllListeners } from 'c/pubsub';
import getBorrowingUsers from '@salesforce/apex/RecordsController.getBorrowingUsers';
import getCheckoutRecords from '@salesforce/apex/RecordsController.getCheckoutRecords';
import getTotalPages from '@salesforce/apex/RecordsController.getTotalPages';

export default class BorrowingHistory extends LightningElement {
    // pageref for inter-component event handling
    @wire(CurrentPageReference) pageRef;

    // Variables for refreshApex(this.{variable})
    @track checkoutUpdate;
    @track recordsUpdate;
    @track totalPagesWire;

    // Wire result lists
    @track borrowingUsers;
    @track checkoutRecords;

    // Search field variables
    @track usernameSearch = "";
    @track barcodeSearch = "";
    @track typeSearch = "";
    @track itemNameSearch = "";
    @track checkoutSearch = "";
    @track returnSearch = "";

    // Paginator variables
    @track currPage = 1;
    @track totalPages = '';

    // Methods for inter-component event handling
    connectedCallback() {
        registerListener('checkout', this.checkoutHandler, this);  // subscribe to checkout event
        registerListener('return', this.checkoutHandler, this);  // subscribe to return event
    }

    disconnectedCallback() {
        // unsubscribe from checkout event
        unregisterAllListeners(this);
    }

    checkoutHandler() {
        refreshApex(this.recordsUpdate);
        refreshApex(this.checkoutUpdate);
        refreshApex(this.totalPagesWire);
    }

    // gets options for the picklists in the search field
    get typeOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'AV', value: 'AV Equipment' },
            { label: 'Book', value: 'Book' }
        ]
    }

    // wire to get users who have items checked out for display in the lwc
    @wire(getBorrowingUsers, {})
    wiredBorrowingUsers(checkoutUpdate) {
        this.checkoutUpdate = checkoutUpdate;
        const { error, data } = checkoutUpdate;
        if (data) {
            // if there is no data, set this.borrowingUsers as undefined so the 
            // html template does not render. 
            if (data.length !== 0) {
                this.borrowingUsers = data;
            } else {
                this.borrowingUsers = undefined;
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.borrowingUsers = undefined;
        }
    }

    // wire to get borrowing records for display
    @wire(getCheckoutRecords, { 
        usernameSearch: '$usernameSearch',
        barcodeSearch: '$barcodeSearch',
        typeSearch: '$typeSearch',
        itemNameSearch: '$itemNameSearch',
        checkoutSearch: '$checkoutSearch',
        returnSearch: '$returnSearch',
        pageNumber: '$currPage'
    })
    wiredCheckoutRecords(recordsUpdate) {
        this.recordsUpdate = recordsUpdate;
        const { error, data } = recordsUpdate;
        if (data) {
            if (data.length !== 0) {
                this.checkoutRecords = data;
            } else {
                this.checkoutRecords = undefined;
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.checkoutRecords = undefined;
        }
    }

    // handles changes from search fields/page number input
    changeHandler(event) {
        var digitMatcher;
        var re = new RegExp('([A-Za-z]+)-?\\d*');  // matches "someid-####"
        var source = event.target.id.match(re);
        switch (source[1]) {
            case 'username':
                this.usernameSearch = event.target.value;
                this.resetPageNumber();
                break;
            case 'bar':
                this.barcodeSearch = event.target.value;
                this.resetPageNumber();
                break;
            case 'type':
                this.typeSearch = event.detail.value;
                this.resetPageNumber();
                break;
            case 'itemname':
                this.itemNameSearch = event.target.value;
                this.resetPageNumber();
                break;
            case 'checkout':
                this.checkoutSearch = event.target.value;
                this.resetPageNumber();
                break;
            case 'return':
                this.returnSearch = event.target.value;
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
        refreshApex(this.recordsUpdate);
        refreshApex(this.checkoutUpdate);
        refreshApex(this.totalPagesWire);
    }

    // wires the total number of pages for page display
    @wire(getTotalPages, { 
        usernameSearch: '$usernameSearch',
        barcodeSearch: '$barcodeSearch',
        typeSearch: '$typeSearch',
        itemNameSearch: '$itemNameSearch',
        checkoutSearch: '$checkoutSearch',
        returnSearch: '$returnSearch'
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

    // Resets page number when search terms are updated.
    resetPageNumber() {
        var inputField = this.template.querySelector('.pnum');
        inputField.value = '1';
        this.currPage = 1;
    }
    
}