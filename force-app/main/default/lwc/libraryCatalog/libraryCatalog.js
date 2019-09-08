import { LightningElement, wire } from 'lwc';

import getLibraryItems from '@salesforce/apex/catalogController.getLibraryItems';

export default class LibraryCatalog extends LightningElement {
    @wire(getLibraryItems, {})
    libraryItems;
}