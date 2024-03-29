public with sharing class CatalogController {
    public CatalogController() {

    }

    // gets the total number of pages with the current search. 
    @AuraEnabled(cacheable=true)
    public static Integer getTotalPages(String barcodeSearch, String typeSearch, String nameSearch, String statusSearch) {
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
        Integer results = Database.countQuery('SELECT COUNT() FROM Library_Item__c ' + whereClause);
        if (results == 0) return 1;
        else return (results / 15 + 1);
    }

    // gets the list of library items for the catalog, using optional search terms. 
    @AuraEnabled(cacheable=true)
    public static Library_Item__c[] getLibraryItems(String barcodeSearch, String typeSearch, String nameSearch, String statusSearch, Integer pageNumber) {
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

        Integer offset = (pageNumber - 1) * 15;

        // queries the database using the search terms
        return Database.query('SELECT Name, Type__c, Title__c, Available__c FROM Library_Item__c ' + 
            whereClause + ' ORDER BY Available__c DESC, Name DESC LIMIT 15 OFFSET :offset');
    }
}
