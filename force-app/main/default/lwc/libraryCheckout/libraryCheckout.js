import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import getHighestAvailableBarcode from '@salesforce/apex/controller.getHighestAvailableBarcode';
import checkout from '@salesforce/apex/controller.checkout';

export default class LibraryCheckout extends LightningElement {
    barcodeUpdate;
    @track updateResult;
    @track userSearch = "";
    @track barcodeSearch = "";

    @wire(getHighestAvailableBarcode)
    wiredBarcode(barcodeUpdate) {
        this.barcodeUpdate = barcodeUpdate;
        const { error, data } = barcodeUpdate;
        if (data) {
            this.barcodeSearch = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
        }
    }

    changeHandler(event) {
        // var searchField;
        var re = new RegExp('([A-Za-z]+)-?\\d*');
        var source = event.target.id.match(re);
        switch (source[1]) {
            case 'user':
                this.userSearch = event.target.value;
                break;
            case 'bar':
                refreshApex(this.barcodeUpdate);
                event.target.value = this.barcodeSearch;
                break;
            case 'submit':
                checkout({ employeeId: this.userSearch, 
                           barcode: this.barcodeSearch })
                    .then(result => {
                        this.updateResult = result;
                    })
                    .catch(error => {
                        this.error = error;
                    });
                refreshApex(this.barcodeUpdate);
                break;
            default:
                this.userSearch = source[1];
                break;
        }
    }
}