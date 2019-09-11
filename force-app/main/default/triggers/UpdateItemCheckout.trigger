trigger UpdateItemCheckout on Library_Checkout__c (after insert) {
    Library_Checkout__c[] results = Trigger.new;
    List<Library_Item__c> updateItems = new List<Library_Checkout__c>();
}