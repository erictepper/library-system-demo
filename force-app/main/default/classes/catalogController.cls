public with sharing class catalogController {
    public catalogController() {

    }

    public static Library_Item__c[] getLibraryItems() {
        return [SELECT Name, Type__c, Title__c, Available__c FROM Library_Item__c];
    }
}
