public with sharing class ReturnController {
    public ReturnController() {

    }

    // returns a Library_Item__c for the libraryReturn lwc
    @AuraEnabled
    public static String returnItem(String barcode) {
        // basic checks
        if (barcode.equals('')) return 'Please enter a barcode.';

        // gets the library item and checks that it exists
        Library_Item__c[] results = Database.query('SELECT Available__c FROM Library_Item__c WHERE Name = :barcode');
        if (results.size() == 0) { 
            return 'Library item does not exist.';
        }
        // checks that the library item is available for return
        if (results[0].Available__c) { 
            return 'Library item cannot be returned because it has already been made available.';
        }

        results[0].Available__c = true;
        try {
            update results;
        } catch (DmlException e) {
            return 'An unexpected error has occurred: ' + e.getMessage();
        }

        return 'Success.';
    }

    // gets the highest un-available barcode number to demonstrate rapid return for libraryReturn lwc
    @AuraEnabled(cacheable=true)
    public static String getHighestUnavailableBarcode() {
        AggregateResult[] results = [SELECT MAX(Name) max FROM Library_Item__c WHERE Available__c = false];
        if (String.valueOf(results[0].get('max')) == null) return '';
        else return (String) results[0].get('max');
    }
}
