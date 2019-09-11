trigger IsValidCheckout on Library_Checkout__c (before insert)  {
    Library_Checkout__c[] results = Trigger.new;
    List<Library_Item__c> updateItems = new List<Library_Item__c>();

    for (Integer i = 0; i < results.size(); i++) {
        // Gets the current update item/user and checks if they exist. 
    }
}