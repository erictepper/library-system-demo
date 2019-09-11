public with sharing class controller {
    public controller() {

    }

    @AuraEnabled(cacheable=true)
    public static Library_Item__c[] getLibraryItems(String barcodeSearch, String typeSearch, String nameSearch, String statusSearch) {
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
        if (criteria.size() > 0) whereClause = 'WHERE ' + String.join(criteria, ' AND ');

        return Database.query('SELECT Name, Type__c, Title__c, Available__c FROM Library_Item__c ' + whereClause + ' ORDER BY Available__c DESC, Name DESC');
    }

    @AuraEnabled
    public static String checkout(String employeeId, String barcode) {
        if (employeeId.equals('')) return 'Please enter a username.';
        if (barcode.equals('')) return 'Please enter a barcode.';

        Library_Item__c[] results = Database.query('SELECT Id, Available__c FROM Library_Item__c WHERE Name = :barcode');
        User[] userResults = Database.query('SELECT Id FROM User WHERE Username = :employeeId');
        if (results.size() == 0) { 
            return 'Library item does not exist.';
        }
        if (!results[0].Available__c) { 
            return 'Library item is unavailable.';
        }
        if (userResults.size() == 0) {
            return 'User does not exist.';
        }

        Library_Item__c curr = results[0];
        User currUser = userResults[0];
        Library_Checkout__c record = new Library_Checkout__c(User__c = currUser.Id, 
                                                             Library_Item__c = curr.Id, 
                                                             Checkout_Date__c = Datetime.now());
        try {
            insert record;

            // Update availability of the item. 
            curr.Available__c = false;
            update curr;
        } catch (DmlException e) {
            return 'An unexpected error has occurred: ' + e.getMessage();
        }

        return 'Success.';
    }

    @AuraEnabled(cacheable=true)
    public static String getHighestAvailableBarcode() {
        AggregateResult[] results = [SELECT MAX(Name) max FROM Library_Item__c WHERE Available__c = true];
        if (String.valueOf(results[0].get('max')) == null) return '';
        else return (String) results[0].get('max');
    }
}
