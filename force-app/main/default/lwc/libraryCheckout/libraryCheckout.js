import { LightningElement, track, wire } from 'lwc';

import getHighestAvailableBarcode from '@salesforce/apex/controller.getHighestAvailableBarcode';

export default class LibraryCheckout extends LightningElement {
    @track barcodeUpdate;
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
}