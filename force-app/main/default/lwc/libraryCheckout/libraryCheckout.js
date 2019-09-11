import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import getHighestAvailableBarcode from '@salesforce/apex/controller.getHighestAvailableBarcode';
import checkout from '@salesforce/apex/controller.checkout';

export default class LibraryCheckout extends LightningElement {
    @track barcodeUpdate;  // variable to allow refreshApex(this.barcodeUpdate) to work
    @track updateResult;  // the result of a checkout submission for debugging. 
    @track userSearch = "";  // the username of the employee checking out
    @track barcodeSearch = "";  // the barcode of the library item to check out

    @wire(getHighestAvailableBarcode)
    wiredBarcode(barcodeUpdate) {
        // variable to allow refreshApex(this.barcodeUpdate) to work
        this.barcodeUpdate = barcodeUpdate;

        // get the data or the error returned by the wire
        const { error, data } = barcodeUpdate;
        if (data) {
            this.barcodeSearch = data;
            this.error = undefined;
        } else if (error) {
            console.log(error)
            this.error = error;
            this.barcodeSearch = 'undefined';
        }
    }

    // handles changes from the client
    changeHandler(event) {
        // the barcode input field, to update it to the next highest available 
        // barcode after a library item is checked out
        var inputField;

        // filters Salesforce's auto-id system ('elementId-##') using regular
        // expression matching to get the element id ('elementId')
        var re = new RegExp('([A-Za-z]+)-?\\d*');
        var source = event.target.id.match(re);

        switch (source[1]) {
            case 'user':
                // updates this.userSearch with the input in the Username field
                this.userSearch = event.target.value;
                break;
            case 'bar':
                // updates the barcode input field with the highest available barcode. 
                refreshApex(this.barcodeUpdate);
                event.target.value = this.barcodeSearch;
                break;
            case 'submit':
                // checks out a book if the input is valid 
                checkout({ employeeId: this.userSearch, 
                           barcode: this.barcodeSearch })
                    .then(result => {
                        this.updateResult = result;
                        // updates the barcode input field with the highest available barcode
                        refreshApex(this.barcodeUpdate);
                        inputField = this.template.querySelector('.bar');
                        inputField.value = this.barcodeSearch;
                        console.log(this.updateResult);
                    })
                    .catch(error => {
                        this.error = error;
                    });
                break;
            default:
                // updates the username input field with the source name for debugging, 
                // to be removed and replaced with just a break statement
                this.userSearch = source[1];
                break;
        }
    }
}