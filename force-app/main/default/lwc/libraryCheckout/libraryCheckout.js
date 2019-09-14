import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import { fireEvent } from 'c/pubsub';
import getHighestAvailableBarcode from '@salesforce/apex/CheckoutController.getHighestAvailableBarcode';
import checkout from '@salesforce/apex/CheckoutController.checkout';

export default class LibraryCheckout extends LightningElement {
    @wire(CurrentPageReference) pageRef; // page reference for event handling
    @track barcodeUpdate;  // variable to allow refreshApex(this.barcodeUpdate) to work
    @track updateResult;  // the result of a checkout submission for debugging. 
    @track userSearch = "";  // the username of the employee checking out
    @track barcodeSearch = "";  // the barcode of the library item to check out

    // gets the highest available barcode and sets it to the barcode input
    // field to allow for rapid checkout
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
            this.error = error;
            this.barcodeSearch = '';
        } else {
            // We need this case since data might === '', which JavaScript considers to be false,
            // so the above 'if (data)' statement will not run. 
            this.barcodeSearch = '';
        }
    }

    // handles changes from the lwc
    changeHandler(event) {
        // filters Salesforce's auto-id system ('elementId-##') using regular
        // expression matching to get the element id ('elementId')
        var re = new RegExp('([A-Za-z]+)-?\\d*');
        var source = event.target.id.match(re);

        // matches the source by element id
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
                fireEvent(this.pageRef, 'checkout', event.target.value);
                this.checkoutHelper();
                break;
            default:
                // updates the username input field with the source name for debugging, 
                // to be removed and replaced with just a break statement
                this.userSearch = source[1];
                break;
        }
    }

    // handles enter key input from checkout input fields
    submitHandler(event) {
        if (event.keyCode === 13) {
            // checks out a book if the input is valid 
            fireEvent(this.pageRef, 'checkout', event.target.value);
            this.checkoutHelper();
        }
    }

    // checks out a book if the input is valid 
    checkoutHelper() {
        // the barcode input field, to update it to the next highest available 
        // barcode after a library item is checked out
        var inputField;

        checkout({ employeeId: this.userSearch, 
                barcode: this.barcodeSearch })
            .then(result => {
                this.updateResult = result;
                if (result !== 'Success.') {
                    const evt = new ShowToastEvent({
                        message: result,
                        variant: 'error'
                    });
                    this.dispatchEvent(evt);
                }

                // updates the barcode input field with the highest available barcode
                refreshApex(this.barcodeUpdate);
                inputField = this.template.querySelector('.bar');
                inputField.value = this.barcodeSearch;
            })
            .catch(error => {
                this.error = error;
            });
    }
}