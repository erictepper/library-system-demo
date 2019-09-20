# library-system-demo
## General Info
Version 0.6.0

System that can track books and AV equipment that employees borrow from a library. Implemented on the Salesforce platform. 

## Version Info
**Version 0.1:** A scratch org with two custom objects (Library_Item__c and Library_Checkout__c), with a searchable, browsable LWC to display the Library_Item__c records. 

**Version 0.2:** Added functionality for checking out Library_Item__cs and creating corresponding records in Library_Checkout__c. 

**Version 0.3:** Added triggers to 
* validate checkouts
* automatically update item availabilities upon checkout/return
* mark checkouts as returned when an item is marked as available

**Version 0.4:** Added functionality for checking out using the enter key, in addition to checking out using the 'Check Out' button. 

**Version 0.5:** Added functionality for tracking checkout information, including which users currently have items checked out as well as the borrowing history for each item. 
* **0.5.1:** Added paginator to catalog and checkout records. 
* **0.5.2:** Bug fix: records will now be searchable by date.
* **0.5.3:** Added inter-component event handling using pubsub.

**Version 0.6:** Added functionality to return library items. 

## To-do
* Update item trigger to only run if Available__c field has changed, rather than always running. (optional - not necessary)
* Add links to username field in borrowing history.