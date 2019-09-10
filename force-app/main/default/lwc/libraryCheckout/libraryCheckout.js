import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

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

    changeHandler(event) {
        var re = new RegExp('([A-Za-z]+)-?\\d*');
        var source = event.target.id.match(re);
        switch (source[1]) {
            case 'bar':
                break;
            default:
                this.nameSearch = source[1];
                break;
        }
        return refreshApex(this.barcodeUpdate);
    }
}