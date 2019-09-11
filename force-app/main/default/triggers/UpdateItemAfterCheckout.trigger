trigger UpdateItemAfterCheckout on Library_Checkout__c (after insert) {
    Library_Checkout__c[] results = Trigger.new;
    List<Library_Item__c> updateItems = new List<Library_Item__c>();

    for (Integer i = 0; i < results.size(); i++) {
        // Gets the library item associated with this checkout
        ID itemId = results[i].Library_Item__c;
        Library_Item__c[] currItems = Database.query('SELECT Available__c FROM Library_Item__c WHERE Id = :itemId');

        // Updates the item availability to false (since the item has been checked out), 
        // if not already false
        if (currItems[0].Available__c) {
            currItems[0].Available__c = false;
            updateItems.add(currItems[0]);
        }
    }

    update updateItems;
}