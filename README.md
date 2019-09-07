# library-system-demo
System that can track books and AV equipment that employees borrow from a library. Implemented on the Salesforce platform. 

## Demo Information
### 1. Library System
ConForceSo Corporation wants to create a system to track books and AV equipment that employees can borrow from a library. Design and implement a system on the Salesforce platform to meet the requirements detailed below.

##### REQUIREMENTS:
* **Firm Requirements:** 
	* All library items, their type, and their current status should be searchable/browsable in the system
	* The system should track who currently has items checked out, as well as the borrowing history for each item
	* The system should prevent things like borrowing an item that has already been checked out
	* The system should have an interface suitable for rapidly checking out multiple items using a barcode scanner or similar device*

* **Nice to Haves:** 
	* The system should provide reporting and dashboards on the current and historical status of items, and things like most-frequent borrowers, most popular items, etc.
	* There should be borrowing limits for different types of items, and the system should determine whether items are overdue
	* The system should send a reminder to users with overdue items

##### Items expected in this solution: 
* One or more Custom Objects and associated Custom Fields and Page Layouts
* One or more Apex Triggers and Classes
* Custom UI using one or more Lightning Components
* Validation rules and Workflows as required
* Reports and Dashboards as required