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

    @wire(checkout, { 
        employeeId: '$userSearch',
        barcode: '$barcodeSearch'
    })
    wiredCheckout(checkoutUpdate) {
        this.checkoutUpdate = checkoutUpdate;
        const { error, data } = checkoutUpdate;
        if (data) {
            this.updateResult = data;
            this.error = undefined;
        } else if (error) {
            this.updateResult = undefined;
            this.error = error;
        }
    }

    changeHandler(event) {
        var re = new RegExp('([A-Za-z]+)-?\\d*');
        var source = event.target.id.match(re);
        switch (source[1]) {
            case 'user':
                this.userSearch = event.target.value;
                break;
            case 'bar':
                event.target.value = this.barcodeSearch;
                break;
            default:
                this.nameSearch = source[1];
                break;
        }
        return refreshApex(this.barcodeUpdate);
    }
}