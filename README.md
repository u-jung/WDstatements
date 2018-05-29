
Sorry, this is not the nicest piece of code. However it seems to work. Feel free to improve.

---

# WDstatements
## What is this? 
*WDstatements* ia a helper tool for pre-processing data which will later be added to Wikidata using QuickStatements (https://tools.wmflabs.org/wikidata-todo/quick_statements.php).
*QuickStatements* can add statements (with optional qualifiers and sources) to Wikidata items via a batch mode.

## Why should I use this?
Even if *QuickStatements* is a very powerful however it requires a careful preparation of input data. *WDstatements* will create a string which you can later copy&paste into the *QuickStatements* interface.

## Language note	
The tool has been pre-configurated for the use of German labels and descriptions. Please change the line *var LANGUAGE="de";* inside the javascript file if you prefer another language.

## Does WDstatements need to comply with any requirements?
Yes, it needs. But it should be much easier to comply with these requirements than those of QuickStatements.
- Raw data must be stored using csv format. Alternatly you can copy&paste some cells from your calc application like Open Office Calc, MS Excel, Google Calc, Gnumeric, etc.
- The first column must have the title *item* (in lower case). The cells in this column contain the *subject* (semantically spoken). This could be a known Wikidata object id (like *Q42*) or a String (like *Douglas Adams*). If there is no corresponding wikidata object the content of this column will be used for the *LAST Lxx* statement after *CREATE*.
- All other column titles must be named using a valid property with German {or your language} label (like *ist ein(e)*) or the property code (like "P31" in Upper case).
- Columns for label information should be named following the QuickStatements rules (e.g. "Lde" for label in German, "Dde" for description in German or "Ade" for alternate label in German)
- There are special rules for column titles if we have source information stored in the corresponding column. For source information use "S" instead of "P" inside the property code (like "S248"). Furthermore we need to add the parent property to which the source refer. This will be done by adding the parent property code as suffix together with a dot (like "P31.S248"). In this case the parent property must be noted as code.
- The same procedure is needed for qualifier statements. In this case the child property code keeps his "P". Here is an example: "P159.P969" means property "address" (P969) as a qualifier to the property "headquarters location" (P159)
- String values inside the table should not be quoted ("" or ''). But they may have some apostrophes inside (L'école)
- If there are more than one statement for one property just create a new line for each additionaly statement in your csv table. Each new line should contain the item in the first column as well as the statement in the corresponding column.  
- Date values can be written in multiple ways. For full dates use *dd.mm.yyyy* or *dd/mm/yyyy*. You can also use single digit values for month and day (d.y.yyyy) but the year value must have four digits and the Gregorian calendar is used. If you don't know the day you can use mm/yyyy or mm.yyyy. But you can not use the month by his name!
- WDstatements will lockup for WikibaseItems using the label you will give as a string. For this it will be helpful if your search term are nether too broad nor too narrow. If it's too broad the lockup will retrieve too much results. If it's too narrow you may retrieve nothing and create an unwanted duplicate item.
- Location statements can be written with one of the following pattern: *lat,lon* or *lat;lon" or *geo:lat,lon* or *geo:lat,lon?z=zoom* or in the original pattern for QuickStatements *@lat/lon* . Make sure to note the latitude before the longitude. Instead of comma you may also use semicolon or slash for separate them. Do not use quotes! But use a dot for the decimal separators. You can use both minus and plus signs together with the degrees. 
- Quantity statements need to be noted as described in QickStatements: 

  *"Quantity in the form of amount[lower,upper]Uxx, with amount, lower and upper being a rational number and Uxx being the item number of an unit.
  unit is optional.
  lower, upper are optional. lower and upper must be either both present or not present at all. When present, they are enclosed in square brackets and separated by ,
  amount, lower and upper must use . as decimal separator, must not use any thousands separator and may be prefixed by + or -.
  Don't leave any space in the quantity.
  10, 10U11573, -10[-12.5,-7.5], 0[-5,5]U11573 are all valid quantities."*
  For the instance this tool do not check if a quantity statement will be correct.
- QuickStatements MERGE statement is not yet implemented. We are sorry for that.

## How to use?
- Just download the code and store the unzipped folder somewhere where you may find it again later. Then open the file *statements.html* in your broser. It has been tested in current versions of Firefox and Chrome.
- Open the input csv file or cope & paste the data from your tab calc application. Then click on "ProcessData" on the upper left corner!
- Now just wait and see. The tool tries to lookup for WikibaseItems. You will see a count down in the upper left corner.
- Usually this will end with a message that a number of items still need be specified. Ignore that message and go on!
- You will now see cells in different colors. 
	- Green: The cell is ready. There is nothing more to do.
	- Red: The tool has found some WikibaseItems which could match the label. Left click on the label to select the right one. 
		- If you don't see a list, click on "Requery"! (The list will be visible only at the first appearance of the label)
		- If you see your item, click on it. The label will change by the item code and become green.
		- If you can't find your item, click on "create"!. The label color will change to blue.
		- If you believe that the provided label has some errors, click on "Modify this" and change the label. After this, left click on "Requery"! You can also enter the Wikidata code of the item as a short way solution. If you use "Modify all", all labels with the same title will be modified at the same way. Be careful with this option!
		- If you want to ignore the information click on "Hide". The label color will change to grey. If you hide the item at the first column, then the entire item will be ignored. Otherwise it's just one claim who will be ignored.
	- Blue: The tool didn't find a matching item label item. The item will be created.
	- Hide: You decided to hide this information.
- You now need to change all cell labels into green, blue or grey color. After this click on "Start output for QuickStatements"!
	- If you have a blue label in another than the firt column you will be asked to first create these items using QuickStatements. Do so and requery the blue labels once again. You will see the new item amoing the proposed.
	- If you don't have blue labels or if the blue labels are only in the first column you will now get a result string which you can copy&paste into QuickStatements. 


**Please check the result string carefully before you may paste it into the QuickStatements interface, because nobody is perfect!**

## Here comes an example input file
You can download the example (example.csv).
(Let's presume that *var LANGUAGE=de* is set. Otherwise you need to declare the column headers with the property labels in your language or just the correspending property id.)

|item         |P31            |P31.S248                            |P31.S214 |Geburtsdatum|P569.S854                               |Ehepartner |P26.P580  |P69                    |P69.S248                      |P69.S854                                                   |
|-------------|---------------|------------------------------------|---------|------------|----------------------------------------|-----------|----------|-----------------------|------------------------------|-----------------------------------------------------------|
|Douglas Adams|Q5             |Virtual International Authority File|113230702|11.3.1952   |http://data.bnf.fr/ark:/12148/cb1188092r|Jane Belson|25.11.1991|                       |        						 |                                                           |
|Q42          |               |                                    |         |            |                                        |           |          |St. John's College     |Encyclopædia Britannica Online|                                                           | 
|Douglas Adams|               |                                    |         |            |                                        |           |          |University of Cambridge|                              |http://www.screenonline.org.uk/people/id/1233876/index.html|
|Arthur Dent  |fiktiver Mensch|                                    |         |            |                                        |           |          |                       |                              |                                                           |

After clicking the button "Start output for QuickStatements" you will see the result string as follows.:
```
Q42	P31	Q5	S248	Q54919	S214	"113230702"
Q42	P569	+1952-03-11T00:00:00Z/11	S854	"http://data.bnf.fr/ark:/12148/cb1188092r"
Q42	P26	Q14623681	P580	+1991-11-25T00:00:00Z/11
Q42	P69	Q609646	S248	Q5375741
Q42	P69	Q35794	S854	"http://www.screenonline.org.uk/people/id/1233876/index.html"
Q613901	P31	Q15632617
```

Your input file may have lots of lines.
But it would be better for you to not insert more than 200 to 400 lines at one time. Otherwise you my soon be boored of all this items you need to confirm.  This could be the moment where error will come for sure.
 

