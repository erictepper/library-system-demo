public with sharing class catalogController {
    public catalogController() {

    }

    @AuraEnabled(Cacheable=True)
    public static Library_Item__c[] getLibraryItems(String nameSearch, String typeSearch) {
        String whereClause = '';
        String[] criteria = new String[]{};
        if (!nameSearch.equals('')) {
            String searchKey = '%' + nameSearch + '%';
            criteria.add('Title__c LIKE :searchKey');
        }
        if (!typeSearch.equals('')) {
            criteria.add('Type__c LIKE :typeSearch');
        }
        if (criteria.size() > 0) {
            whereClause = 'WHERE ' + String.join(criteria, ' AND ');
        }
        
        return Database.query('SELECT Name, Type__c, Title__c, Available__c FROM Library_Item__c ' + whereClause + ' ORDER BY Name DESC');
    }
}
