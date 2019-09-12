public with sharing class controller {
    public controller() {

    }

    // gets the list of library items for the catalog, using optional search terms. 
    @AuraEnabled(cacheable=true)
    public static Library_Item__c[] getLibraryItems(String barcodeSearch, String typeSearch, String nameSearch, String statusSearch) {
        // adds each search term as an element in the search criteria array
        String whereClause = '';
        String[] criteria = new String[]{};
        if (!barcodeSearch.equals('')) {
            barcodeSearch = '%' + barcodeSearch + '%';
            criteria.add('Name LIKE :barcodeSearch');
        }
        if (!typeSearch.equals('')) criteria.add('Type__c LIKE :typeSearch');
        if (!nameSearch.equals('')) {
            nameSearch = '%' + nameSearch + '%';
            criteria.add('Title__c LIKE :nameSearch');
        }
        if (!statusSearch.equals('')) {
            boolean b = statusSearch.equals('true');
            criteria.add('Available__c = :b');
        }

        // fills the WHERE clause with the search criteria
        if (criteria.size() > 0) whereClause = 'WHERE ' + String.join(criteria, ' AND ');

        // queries the database using the search terms
        return Database.query('SELECT Name, Type__c, Title__c, Available__c FROM Library_Item__c ' + whereClause + ' ORDER BY Available__c DESC, Name DESC');
    }

    // checks out a Library_Item__c for the libraryCheckout lwc
    @AuraEnabled
    public static String checkout(String employeeId, String barcode) {
        // basic checks
        if (employeeId.equals('')) return 'Please enter a username.'; // TODO: optionally move error message` to lwc interface
        if (barcode.equals('')) return 'Please enter a barcode.';

        // gets the library item and the user to add to Library_Checkout__c fields,
        // and checks that the input library item and user exist
        Library_Item__c[] results = Database.query('SELECT Id, Available__c FROM Library_Item__c WHERE Name = :barcode');
        User[] userResults = Database.query('SELECT Id FROM User WHERE Username = :employeeId');
        if (results.size() == 0) { 
            return 'Library item does not exist.';
        }
        // checks that the library item is available for checkout
        if (!results[0].Available__c) { 
            return 'Library item is unavailable.';
        }
        if (userResults.size() == 0) {
            return 'User does not exist.';
        }

        Library_Item__c currItem = results[0];
        User currUser = userResults[0];
        Library_Checkout__c record = new Library_Checkout__c(User__c = currUser.Id, 
                                                             Library_Item__c = currItem.Id, 
                                                             Checkout_Date__c = Datetime.now());
        try {
            insert record;
        } catch (DmlException e) {
            return 'An unexpected error has occurred: ' + e.getMessage();
        }

        return 'Success.';
    }

    // gets the highest available barcode number to demonstrate rapid checkout for libraryCheckout lwc
    @AuraEnabled(cacheable=true)
    public static String getHighestAvailableBarcode() {
        AggregateResult[] results = [SELECT MAX(Name) max FROM Library_Item__c WHERE Available__c = true];
        if (String.valueOf(results[0].get('max')) == null) return '';
        else return (String) results[0].get('max');
    }
}
