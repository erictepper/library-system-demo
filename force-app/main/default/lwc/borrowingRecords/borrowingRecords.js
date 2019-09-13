import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import getBorrowingUsers from '@salesforce/apex/RecordsController.getBorrowingUsers';
import getCheckoutRecords from '@salesforce/apex/RecordsController.getCheckoutRecords';

export default class BorrowingHistory extends LightningElement {
    // apex refresh fields
    @track checkoutUpdate;
    @track recordsUpdate;

    // wire result lists
    @track borrowingUsers;
    @track checkoutRecords;

    // record search fields
    @track usernameSearch = "";
    @track barcodeSearch = "";
    @track typeSearch = "";
    @track itemNameSearch = "";
    @track checkoutSearch = "";
    @track returnSearch = "";

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

    @wire(getCheckoutRecords, { 
        usernameSearch: '$usernameSearch',
        barcodeSearch: '$barcodeSearch',
        typeSearch: '$typeSearch',
        itemNameSearch: '$itemNameSearch',
        checkoutSearch: '$checkoutSearch',
        returnSearch: '$returnSearch'
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

    get typeOptions() {
        return [
            { label: 'All', value: '' },
            { label: 'AV', value: 'AV Equipment' },
            { label: 'Book', value: 'Book' }
        ]
    }

    changeHandler(event) {
        var re = new RegExp('([A-Za-z]+)-?\\d*');
        var source = event.target.id.match(re);
        switch (source[1]) {
            case 'username':
                this.usernameSearch = event.target.value;
                break;
            case 'bar':
                this.barcodeSearch = event.target.value;
                break;
            case 'type':
                this.typeSearch = event.detail.value;
                break;
            case 'itemname':
                this.itemNameSearch = event.target.value;
                break;
            case 'checkout':
                this.checkoutSearch = event.target.value;
                break;
            case 'return':
                this.returnSearch = event.target.value;
                break;
            default:
                this.nameSearch = source[1];
                break;
        }
        return refreshApex(this.recordsUpdate);
    }
}