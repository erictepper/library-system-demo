public with sharing class RecordsController {
    public RecordsController() {

    }

    // gets the list of checkout records for the borrowing history, using optional search terms. 
    @AuraEnabled(cacheable=true)
    public static Library_Checkout__c[] getCheckoutRecords(String usernameSearch, String barcodeSearch, 
        String typeSearch, String itemNameSearch, String checkoutSearch, String returnSearch) {
        // adds each search term as an element in the search criteria array
        String whereClause = '';
        String[] criteria = new String[]{};
        if (!usernameSearch.equals('')) {
            usernameSearch = '%' + usernameSearch + '%';
            criteria.add('User__r.Username LIKE :usernameSearch');
        }
        if (!barcodeSearch.equals('')) {
            barcodeSearch = '%' + barcodeSearch + '%';
            criteria.add('Library_Item__r.Name LIKE :barcodeSearch');
        }
        if (!typeSearch.equals('')) criteria.add('Library_Item__r.Type__c LIKE :typeSearch');
        if (!itemNameSearch.equals('')) {
            itemNameSearch = '%' + itemNameSearch + '%';
            criteria.add('Library_Item__r.Title__c LIKE :itemNameSearch');
        }

        // fills the WHERE clause with the search criteria
        if (criteria.size() > 0) whereClause = 'WHERE ' + String.join(criteria, ' AND ');

        return Database.query('SELECT User__r.Username, Library_Item__r.Name, Library_Item__r.Type__c, ' +
                                      'Library_Item__r.Title__c, FORMAT(Checkout_Date__c) Checkout_Date, ' +
                                      'FORMAT(Return_Date__c) Return_Date ' +
                              'FROM Library_Checkout__c ' + whereClause + ' ' + 
                              'ORDER BY Return_Date__c, Checkout_Date__c, Library_Item__r.Name');
    }

    // gets the list of users who currently have items checked out
    @AuraEnabled(cacheable=true)
    public static User[] getBorrowingUsers() {
        return [SELECT Id, FirstName, LastName, Username
                FROM User
                WHERE Id IN (SELECT User__c FROM Library_Checkout__c WHERE Return_Date__c = null)];
    }
}
