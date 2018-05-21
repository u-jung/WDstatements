# WDstatements
## What is this? 
A helper tool to prepare data for processing inside QuickStatements (https://tools.wmflabs.org/wikidata-todo/quick_statements.php).
*QuickStatements* can add statements (with optional qualifiers and sources) to Wikidata items.

## Why this?
Even if *QuickStatements* is very helpful however it requires a careful preparation of input data. *WDstatements* helps to create a String which you can copy&paste into the *QuickStatements* interface.

## Language Note
The has been preconfigurated for the use of German labels and descriptions. Please change the line *var LANGUAGE="de";* if you prefer another language

## Does WDstatements has any requirements?
Yes, it has. But it should be much easier to fulfil them.
- Raw data must have csv format. Alternatly you can copy&past some cells from a calc application like Open Office Calc, MS Excel, etc.
- The first column must have the title 'item' (in lower case). The cells in this columns contain *subject* (semantically spoken). This could be a known Wikidata object (like Q42) or a String.
- All other column titles must be named after a valid property with German label (like "ist ein(e)") or the property code (like "P31" in Upper case).
- Column for label information should be named following the QuickStatements rules (e.g. "Lde" for label in German, "Dde" for description in German or "Ade" for alternate label in German)
- There are special rules for column labeling if we have source information or qualifier information stored in this column. For source information use "S" instead of "P" inside the property code (like "S248"). Furthermore we need to add the parent property to which the source information refer. This will be done by adding the parent property code as suffix together with a dot (like "P31.S248"). In this case the parent property must be noted as code.
- The same procedure is needed for qualifier information. In this case the child property code keeps his "P". Here is an example: "P159.P969" means property "address" (P969) as a qualifier to the property "headquarters location" (P159)
- It would be useful if the columns containing the parent properties are lefter than their respective child properties. 
- String values inside the table should not be quoted ("" or ''). But they may have some apostrophes inside (L'école)
- Date values can be written in multiple ways. For entire dates uses dd.mm.yyyy or dd/mm/yyyy. You can also use single digit values for month and day (d.y.yyyy) but the year value must have four digits and the Gregorian calendar is used. If you don't know the day you can use mm/yyyy or mm.yyyy. But you can not use the name of month!
- WDstatements will lockup for WikibaseItem using the label you will give as a string. For this it will be helpful if your search term are nether to broad nor to narrow. 
- Quantity statements and coordinates are not yet implemented. Sorry for that.

## How to use?
- Just store the unzipped folder somewhere you will find it again later. Than open the file *statements.html* in your broser. It has been tested in current versions of Firefox and Chrome.
- Open the input csv file or cope&paste the data from your tab calc application. Than click on "ProcessData"!
- Than just wait and see. The tool tries to lookup for Wikibase items.
- Usually this will end with a message that a number of items still need be specified.
- You will now see cells in different colors. 
-- Green: The cell is ready. No more things to do.
-- Red: The tool has found some Wikibase items which could match the label. Click on the label to select the right one. 
--- If you don't see a list, click on "requery"!
--- If you see your item, click on it. The label will change to the item code.
--- If you can't find your item, click on "create"!. The label color will change to blue.
--- If you believe that the provided label has some errors, click on "Modify this" and change the label. After this click on "Requery"! You can also enter the Wikidata code of the item as a short way solution.
--- If you want to ignore the information click on "Hide". The label color will change to grey. If you hide the item than the entire item will be ignored. Otherwise it's just the claim.
-- Blue: The tool didn't find a matching item label item. The item will be created.
-- Hide: You decided to hide this information.
- You now need to change all cell labels into green, blue or grey color. After this click on "Start output for QuickStatements"!
-- If you have a blue label which in another than the firt column you will be asked to first create these item using QuickStatements. Do so and requery than the blue labels again.
-- If you don't have blue labels or if the blue labels are only in the first column you will now get a result string which you can copy&paste into QuickStatements. 
**Please check the result string carefully before you will paste it into the QuickStatements interface, because nobody is perfect!**
 


