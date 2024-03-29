import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import { fireEvent } from 'c/pubsub';
import getHighestUnavailableBarcode from '@salesforce/apex/ReturnController.getHighestUnavailableBarcode';
import returnItem from '@salesforce/apex/ReturnController.returnItem';

export default class LibraryReturn extends LightningElement {
    // pageref for inter-component event handling
    @wire(CurrentPageReference) pageRef;

    // Variables for refreshApex(this.{variable})
    @track barcodeUpdate;

    // the result of a return submission for toast notifications. 
    @track updateResult;

    // return submission input variables
    @track barcodeSearch = "";

    // gets the highest available barcode and sets it to the barcode input
    // field to allow for rapid returns
    @wire(getHighestUnavailableBarcode)
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
            case 'bar':
                // updates the barcode input field with the highest available barcode. 
                refreshApex(this.barcodeUpdate);
                event.target.value = this.barcodeSearch;
                break;
            case 'submit':
                // returns a book if the input is valid 
                fireEvent(this.pageRef, 'return', event.target.value);
                this.returnHelper();
                break;
            default:
                break;
        }
    }

    // handles enter key input from return input field
    submitHandler(event) {
        if (event.keyCode === 13) {
            // returns a book if the input is valid 
            fireEvent(this.pageRef, 'return', event.target.value);
            this.returnHelper();
        }
    }

    // returns a book if the input is valid 
    returnHelper() {
        // the barcode input field, to update it to the next highest available 
        // barcode after a library item is returned
        var inputField;

        returnItem({ barcode: this.barcodeSearch })
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