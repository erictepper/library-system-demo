import { LightningElement, track, wire } from 'lwc';

import getBorrowingUsers from '@salesforce/apex/controller.getBorrowingUsers';

export default class BorrowingHistory extends LightningElement {
    @track checkoutUpdate
    @track borrowingUsers;

    @wire(getBorrowingUsers, {})
    wiredLibraryItems(checkoutUpdate) {
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
}