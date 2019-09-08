public with sharing class catalogController {
    public catalogController() {

    }

    @AuraEnabled(Cacheable=True)
    public static Library_Item__c[] getLibraryItems(String nameSearch, String typeSearch) {
        String whereClause = '';
        if (!nameSearch.equals('') && !typeSearch.equals('')) {
            whereClause = 'WHERE Title__c LIKE \'%' + nameSearch + '%\' AND Type__c LIKE \'' + typeSearch + '\'';
        }
        else if (!nameSearch.equals('')) {
            whereClause = 'WHERE Title__c LIKE \'%' + nameSearch + '%\'';
        }
        else if (!typeSearch.equals('')) {
            whereClause = 'WHERE Type__c LIKE \'' + typeSearch + '\'';
        }
        return Database.query('SELECT Name, Type__c, Title__c, Available__c FROM Library_Item__c ' + whereClause + ' ORDER BY Name DESC');
    }
}
