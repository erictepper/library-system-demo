// Checks that user exists, item exists and is available, checkout date is not null, and return date is null. 
trigger IsValidCheckout on Library_Checkout__c (before insert)  {
    Library_Checkout__c[] results = Trigger.new;

    for (Integer i = 0; i < results.size(); i++) {
        Library_Checkout__c curr = results[i];

        // Gets the current update item/user and checks if they exist. 
        ID userId = curr.User__c;
        ID itemId = curr.Library_Item__c;
        User[] userResults = Database.query('SELECT Id FROM User WHERE Id = :userId');
        if (userResults.size() == 0) curr.addError('User does not exist!');
        Library_Item__c[] itemResults = Database.query('SELECT Available__c FROM Library_Item__c WHERE Id = :itemId');
        if (itemResults.size() == 0) curr.addError('Library item does not exist!');
        else if (!itemResults[0].Available__c) curr.addError('Library item is unavailable for checkout.');

        // Checks dates
        if (String.valueOf(curr.Checkout_Date__c) == null) curr.addError('Must add a checkout date!');
        if (String.valueOf(curr.Return_Date__c) != null) curr.addError('Cannot check out and return an item at the same time!');
    }
}