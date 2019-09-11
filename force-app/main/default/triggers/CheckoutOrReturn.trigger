trigger CheckoutOrReturn on Library_Item__c (after update) {
    Library_Item__c[] results = Trigger.new;
    List<Library_Checkout__c> updateCheckouts = new List<Library_Checkout__c>();
    List<Library_Checkout__c> insertCheckouts = new List<Library_Checkout__c>();

    for (Integer i = 0; i < results.size(); i++) {
        Library_Item__c curr = results[i];

        // if item has been returned
        if (curr.Available__c) {
            ID currId = curr.Id;
            Library_Checkout__c[] currCheckout = Database.query('SELECT Return_Date__c ' + 
                'FROM Library_Checkout__c ' +
                'WHERE Library_Item__c = :currId ' +
                    'AND Return_Date__c = null');
            if (currCheckout.size() != 0) {
                currCheckout[0].Return_Date__c = Datetime.now();
                updateCheckouts.add(currCheckout[0]);
            }
        } 

        // else if item has been checked out
        else {
            // checks to see if a checkout record has already been created
            ID currId = curr.Id;
            Library_Checkout__c[] currCheckout = Database.query('SELECT Library_Item__c ' + 
                'FROM Library_Checkout__c ' +
                'WHERE Library_Item__c = :currId ' + 
                    'AND Return_Date__c = null');
            
            // if no record, create one using whoever modified the Library_Item__c
            if (currCheckout.size() == 0) {
                Library_Checkout__c newCheckout = new Library_Checkout__c(User__c = curr.LastModifiedById, 
                    Library_Item__c = curr.Id, 
                    Checkout_Date__c = Datetime.now());
                insertCheckouts.add(newCheckout);
            }
        }
    }

    update updateCheckouts;
    insert insertCheckouts;
}