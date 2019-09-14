public with sharing class RecordsController {
    public RecordsController() {

    }

    // gets the total number of pages with the current search. 
    @AuraEnabled(cacheable=true)
    public static Integer getTotalPages(String usernameSearch, String barcodeSearch, 
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
        if (!checkoutSearch.equals('')) {
            checkoutSearch = parseDateString(checkoutSearch);
            Datetime checkoutDate = Datetime.parse(checkoutSearch);
            criteria.add('Checkout_Date__c < :checkoutDate');
        }
        if (!returnSearch.equals('')) {
            returnSearch = parseDateString(returnSearch);
            DateTime returnDate = Datetime.parse(returnSearch);
            criteria.add('Return_Date__c < :returnDate');
        }

        // fills the WHERE clause with the search criteria
        if (criteria.size() > 0) whereClause = 'WHERE ' + String.join(criteria, ' AND ');

        Integer results = Database.countQuery('SELECT COUNT() FROM Library_Checkout__c ' + whereClause);
        if (results == 0) return 1;
        else return (results / 15 + 1);
    }

    // gets the list of checkout records for the borrowing history, using optional search terms. 
    @AuraEnabled(cacheable=true)
    public static Library_Checkout__c[] getCheckoutRecords(String usernameSearch, String barcodeSearch, 
        String typeSearch, String itemNameSearch, String checkoutSearch, String returnSearch, Integer pageNumber) {
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
        if (!checkoutSearch.equals('')) {
            checkoutSearch = parseDateString(checkoutSearch);
            Datetime checkoutDate = Datetime.parse(checkoutSearch);
            criteria.add('Checkout_Date__c < :checkoutDate');
        }
        if (!returnSearch.equals('')) {
            returnSearch = parseDateString(returnSearch);
            DateTime returnDate = Datetime.parse(returnSearch);
            criteria.add('Return_Date__c < :returnDate');
        }

        // fills the WHERE clause with the search criteria
        if (criteria.size() > 0) whereClause = 'WHERE ' + String.join(criteria, ' AND ');

        Integer offset = (pageNumber - 1) * 15;

        return Database.query('SELECT User__r.Username, Library_Item__r.Name, Library_Item__r.Type__c, ' +
                                     'Library_Item__r.Title__c, FORMAT(Checkout_Date__c) Checkout_Date, ' +
                                     'FORMAT(Return_Date__c) Return_Date ' +
                              'FROM Library_Checkout__c ' + whereClause + ' ' + 
                              'ORDER BY Return_Date__c DESC, Checkout_Date__c DESC, Library_Item__r.Name ' + 
                              'LIMIT 15 OFFSET :offset');
    }

    // gets the list of users who currently have items checked out
    @AuraEnabled(cacheable=true)
    public static User[] getBorrowingUsers() {
        return [SELECT Id, FirstName, LastName, Username
                FROM User
                WHERE Id IN (SELECT User__c FROM Library_Checkout__c WHERE Return_Date__c = null)];
    }

    private static String parseDateString(String inputDate) {
        // Date matcher
        Pattern datePattern = Pattern.compile('(\\d{4})(?:-(\\d{1,2}))?(?:-(\\d{1,2}))?(?: (\\d{1,2})(?::(\\d{1,2}))?(?::(\\d{1,2}))?)?');
        Matcher dateMatches = datePattern.matcher(inputDate);

        // if no year
        if (!dateMatches.matches()) return inputDate; 
        // if no month
        else if (dateMatches.group(2) == null) return '01/01/' + dateMatches.group(1) + ' 12:00 AM';
        // if no day
        else if (dateMatches.group(3) == null) {
            return dateMatches.group(2) + '/01/' + dateMatches.group(1) + ' 12:00 AM';
        }
        // if no hour
        else if (dateMatches.group(4) == null) {
            return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                ' 12:00 AM';
        }
        // if no minute
        else if (dateMatches.group(5) == null) {
            if (Integer.valueOf(dateMatches.group(4)) < 1) {
                return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                    ' 12:00 AM';
            } else if (Integer.valueOf(dateMatches.group(4)) < 12) {
                return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                    ' ' + dateMatches.group(4) + ':00 AM';
            } else if (Integer.valueOf(dateMatches.group(4)) < 13) {
                return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                    ' 12:00 PM';
            } else {
                String hour = String.valueOf(Integer.valueOf(dateMatches.group(4)) - 12);
                return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                    ' ' + hour + ':00 PM';
            }
        }
        else {
            if (Integer.valueOf(dateMatches.group(4)) < 1) {
                return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                    ' 12:' + dateMatches.group(5) + ' AM';
            } else if (Integer.valueOf(dateMatches.group(4)) < 12) {
                return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                    ' ' + dateMatches.group(4) + ':' + dateMatches.group(5) + ' AM';
            } else if (Integer.valueOf(dateMatches.group(4)) < 13) {
                return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                    ' 12:' + dateMatches.group(5) + ' PM';
            } else {
                String hour = String.valueOf(Integer.valueOf(dateMatches.group(4)) - 12);
                return dateMatches.group(2) + '/' + dateMatches.group(3) + '/' + dateMatches.group(1) + 
                    ' ' + hour + ':' + dateMatches.group(5) + ' PM';
            }
        }
    }
}
