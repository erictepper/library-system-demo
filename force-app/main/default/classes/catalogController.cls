public with sharing class catalogController {
    public catalogController() {

    }

    @AuraEnabled(Cacheable=True)
    public static Library_Item__c[] getLibraryItems(String barcodeSearch, String typeSearch, String nameSearch, String statusSearch) {
        String whereClause = '';
        String[] criteria = new String[]{};

        if (!barcodeSearch.equals('')) {
            String searchKey = '%' + barcodeSearch + '%';
            criteria.add('Name LIKE :searchKey');
        }
        if (!typeSearch.equals('')) criteria.add('Type__c LIKE :typeSearch');
        if (!nameSearch.equals('')) {
            String searchKey = '%' + nameSearch + '%';
            criteria.add('Title__c LIKE :searchKey');
        }
        if (!statusSearch.equals('')) criteria.add('Available__c LIKE :statusSearch');
        if (criteria.size() > 0) whereClause = 'WHERE ' + String.join(criteria, ' AND ');

        return Database.query('SELECT Name, Type__c, Title__c, Available__c FROM Library_Item__c ' + whereClause + ' ORDER BY Name DESC');
    }
}
