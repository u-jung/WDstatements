/*
 * statements.js
 * 
 * Copyright 2018 FH Potsdam FB Informationswissenschaften PR Kolonialismus <kol@fhp-kol-1>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 * 
 * 
 */


var PROPERTIES = [];
var objects = {};
var csvArr = [];

var INIT = true;
var QUERIES=[];
var requery=false;
var LANGUAGE="de";
if (LANGUAGE!="en"){
	var LABELS = ['D'+LANGUAGE, 'A'+LANGUAGE, 'L'+LANGUAGE, 'Den', 'Aen', 'Len'];
}
else{
	var LABELS = [ 'Den', 'Aen', 'Len'];	
}
var CELLS=[];
var numberOfStatements=0;
var fillDivEnded=false;
csvdata=true;
console.log("ok");

jQuery(document).ready(function() {


    jQuery("body").on('change', '#file-input', function() {
        jQuery('#output').html("");
        console.log(document.getElementById("file-input").files);
        readCSV()
    });

	 jQuery("body").on('click', '#quickstatements', function() {
		var win = window.open("https://tools.wmflabs.org/wikidata-todo/quick_statements.php", '_blank');
		win.focus();
	 });

    jQuery("body").on('click', '#clipboard', function() {
        //if (jQuery('#popup').css("display") == "none") {
        if (jQuery('#output2 textarea').length == 0) {
            jQuery('#output').html("");

            inputCSV();
            jQuery('textarea').focus();
            jQuery('#clipboard').val("Process Data");
        } else {
            //jQuery('#popup').css("display", 'none');
            jQuery('#output2 textarea').css("height","0px");
            jQuery('#clipboard').val("Insert from clipboard");
            //if(jQuery('#popup textarea').val().slice(0,1)=="["){
			if(jQuery('#output2 textarea').val().slice(0,1)=="["){
				//text=processJSON(JSON.parse(jQuery('#popup textarea').val()));
				text=processJSON(JSON.parse(jQuery('#output2 textarea').val()));
				fillDIV();
				jQuery('#output2 textarea').remove();
				return;
			}
			//if (jQuery('#popup textarea').val().slice(0,1)=="["){
			if (jQuery('#output2 textarea').val().slice(0,1)=="["){
				//text=processJSON(JSON.parse(jQuery('#popup textarea').val()));
				text=processJSON(JSON.parse(jQuery('#output2 textarea').val()));
				console.log(text);
				text = text.replace(/,/g, ';');
				text = text.replace(/\t/g, ',');
				processData(text);
				jQuery('#output2 textarea').remove();
				return;
			}

			
			
            if (csvdata){
				//text = jQuery('#popup textarea').val();
				text = jQuery('#output2 textarea').val();
				text = text.replace(/,/g, ';');
				text = text.replace(/\t/g, ',');
				processData(text);
				jQuery('#output2 textarea').remove();
			}
			else{
				csvdata=true;
				//jQuery('#output').html(jQuery('#popup textarea').val()); 
				jQuery('#output').html(jQuery('#output2 textarea').val()); 
			}
        }

    });

	jQuery("body").on('click', '#save', function() {
		if(jQuery('#save').val()=="Save State"){
			saveState();
			jQuery('#save').val("Load State");
		}
		else{
			loadState();
			jQuery('#save').val("Save State");
		}
		
		
		});
	

    jQuery("body").on('click', '#start-output', function() {
        startOutput();
    });

});


function startOutput() {
    checkError = [];
    createList = [];
    createStr = "";
    createArr=[]
    for (row = 1; row < csvArr.length; row++) {
        for (column = 0; column < csvArr[0].length; column++) {

            check = checkType(row + '-' + column);

            if (check == true) {
              
            } else {
                checkError.push(row + '-' + column);
            }
            if (jQuery('#' + row + '-' + column).attr('class') == 'td create') {
                if (column != 0) {
                    createList.push(row + '-' + column);
                }
            }

        }
    }
    if (checkError.length > 0) {
        alert("You have " + checkError.length + " non conform cells. Check the log.\nProcess cancelled. \n\nIgnore that massage and got on if you just started with the import of data");
        console.log("Non conform cells");
        for (id = 0; id < checkError.length; id++) {
            console.log(checkError[id], jQuery('#' + checkError[id]).text(), ' in row: ', jQuery('#' + checkError[id].split('-')[0] + '-0').text(), "  property: ", jQuery('#0-' + checkError[id].split('-')[1]).text());
        }
        return;
    }

    if (createList.length > 0) {
		
        alert("You need to create " + createList.length + " secondary items (the blue ones). For this you can copy the content of the next windows and replace the dummies\nProcess cancelled");
        for (id = 0; id < createList.length; id++) {
            createStr += "CREATE\n";
            createStr += 'LAST\tLde\t"' + quote(jQuery('#' + createList[id]).text(),createList[id].split('-')[1]) + '"\n';
            createStr += 'LAST\tDde\t"BESCHREIBUNG"\n';
            createStr += 'LAST\tP31\tQQQQQQQQQQQQ\n';
            createArr.push("CREATE");
            createArr.push('LAST\tLde\t"' + quote(jQuery('#' + createList[id]).text(),createList[id].split('-')[1]) + '"');
            createArr.push('LAST\tDde\t"BESCHREIBUNG"');
            createArr.push('LAST\tP31\tQQQQQQQQQQQQ');
        }
        jQuery("#output2").before().css("content",'This is the result string. Copy and paste into QuickStatements');
        openTextarea(createStr);
        
        return
    }

    createStr = "";
    regex = /^S[0-9]*$/g
    for (row = 1; row < csvArr.length; row++) {
        subject = jQuery('#' + row + '-0').text();
        if (jQuery('#' + row + '-0').attr('class') == 'td hide') {
            break;
        }
        if (jQuery('#' + row + '-0').attr('class') == 'td create') {
            createStr += "CREATE\n";
            createStr += "LAST\tLde\t" + quote(jQuery('#' + row + '-0').text(),-1) + "\n";
            subject = 'LAST';
            //createArr.push("CREATE");
            createArr.push([jQuery('#' + row + '-0').text(),"LAST\tLde\t" + quote(jQuery('#' + row + '-0').text(),-1) ]);

        }
        for (pi = 1; pi < PROPERTIES.length; pi++) {
            console.log(PROPERTIES.length, PROPERTIES[pi]['parent'], regex.test(PROPERTIES[pi]['originalLabel']), pi);
            if ((PROPERTIES[pi]['parent'] == '') && (!(regex.test(PROPERTIES[pi]['originalLabel'])))) {
                objStr= getObject(subject, row, PROPERTIES[pi]['p']);
                createStr+=objStr
                if(objStr!=""){
					createArr.push([jQuery('#' + row + '-0').text(),getObject(subject, row, PROPERTIES[pi]['p'])]);
				}
            }

        }
    }
    //createArr=removeDuplicates(createArr);
	console.log(createArr);
	uStr=sortCreateArr(createArr);
	uStr=uStr.replace(/CREATE\nQ/gm, "Q");
	openTextarea(uStr);
    //openTextarea(createStr);
    return




};

function sortCreateArr(createArr){
	uStr="";
	lastItem=[];
	createArr.sort(function(a, b)
		{
			return a[0] - b[0];
		});
	for (n=0;n<createArr.length;n++){
		if(createArr[n][0]!=lastItem[0]){
			lastItem=createArr[n];
			if(createArr[n][1].slice(0,5)!="LAST"){
				uStr+="CREATE\n";
				uStr+=createArr[n][1]+"\n";
			}
			else{
				uStr+=createArr[n][1]+"\n";
			}
		}
		if(createArr[n][1]!=lastItem[1]){
			uStr+=createArr[n][1]+"\n";
		}
	}

	return uStr;
}



function orderCreateArr(createArr){
	tmpArr=[];
	skip=false;
	lastSubject="";

	for (i=0; i<createArr.length;i++){
		if(createArr[i]=="CREATE" ){
			item=getLde(createArr,i);
			console.log(item);
			pos=isInTmpArr(tmpArr,i,item);
			console.log(pos);
			if(pos>-1){
				for (m=i+1;m<createArr.length;m++){
					if(createArr[m].slice(0,5)!="LAST"){
						tmpArr.splice(pos,0,createArr[m]);
						skip=true;
					}
					else{
						break;
					}
				}
			}
			else{
				tmpArr.push(createArr[i]);
			}
		}
		else{
			console.log(createArr[i].slice(0,5)!="LAST" , skip);
			if(createArr[i].slice(0,5)=="LAST" && skip){}
			else{
				skip=false;
				tmpArr.push(createArr[i]);
			}
		}
	}
	tmpArr=removeDuplicates(tmpArr);
	return tmpArr;
	}
	
function removeDuplicates(tmpArr){
	  var result = [];
	  jQuery.each(tmpArr, function(i, e) {
		if (jQuery.inArray(e, result) == -1 || e=="CREATE") result.push(e);
	  });
	  return result;
}

function isInTmpArr(tmpArr,i,item){
	pos=-1;
	for (k=0;k<tmpArr.length;k++){
		if(item.slice(0,8)=="LAST\tLde"){
			if(item==tmpArr[k]){
				pos=k;
				for(l=pos;l<tmpArr.length;l++){
					if(tmpArr.slice(0,5)!="LAST"){
						pos=l;
						break;
					}
				}
			}
		}
		else{
			if(tmpArr[k].match(/^[^\t]*/g)==item){
				pos=k;
				for(l=pos;l<tmpArr.length;l++){
					if(match(/^[^\t]*/g)!=item){
						pos=l;
						break;
					}
				}
			}
		}
		if(pos>-1){
			return pos
		}
	}
	return -1;
}

function getLde(createArr,i){
	
	for (j=i+1; j<createArr.length;j++){
			if (createArr[j].slice(0,8)=="LAST\tLde"){
				return createArr[j];
			}
		}
		return "";
	}

function getObject(subject, row, p) {
    console.log('getObject', subject, row, p);
    for (i = 1; i < PROPERTIES.length; i++) {
        if (PROPERTIES[i]['p'] == p) {
            if (jQuery('#' + row + '-' + i).attr('class') == 'td ok') {
                if (jQuery('#' + row + '-' + i).text() != "") {
                    return subject + '\t' + p + '\t' + quote(jQuery('#' + row + '-' + i).text(), i) + addChildren(row, i) + addSources(row,i) + '';
                }
            } else {
                return "";
            }
        }
    }
    return "";
}

function addChildren(row, i) {
    console.log('addChildren', row, i);
    returnStr = "";
    source_statement_arr=[];
    if ('children' in PROPERTIES[i]) {
        parent = PROPERTIES[i]['p'];
        for (child = 0; child < PROPERTIES[i]['children'].length; child++) {
            console.log('has children');
            for (j = 1; j < PROPERTIES.length; j++) {
                //if (PROPERTIES[j]['p'] == PROPERTIES[i]['children'][child]) {
                //if (PROPERTIES[j]['p'].slice(1)== PROPERTIES[i]['children'][child].slice(1) && PROPERTIES[i]['children'][child].slice(0,1)=="S") {
                if (PROPERTIES[j]['p'].slice(1)== PROPERTIES[i]['children'][child].slice(1)) {
                    console.log('found the child');
                    if (PROPERTIES[j]['parent'] != "") {

                        if (PROPERTIES[j]['parent'] == parent) {
                            console.log('child has parent');
                            if ((jQuery('#' + row + '-' + i).text() != "") && (jQuery('#' + row + '-' + i).attr('class') == 'td ok')) {
								if (jQuery('#' + row + '-' + j).text()!=""){
									//returnStr += '\t' + PROPERTIES[j]['p'] + '\t' + quote(jQuery('#' + row + '-' + j).text(), j);
									/*source_statement_exist=false;
									source_statement='\t' + PROPERTIES[i]['children'][child] + '\t' + quote(jQuery('#' + row + '-' + j).text(), j)
									for (k=0; k<source_statement_arr.length;k++){
										if (source_statement_arr[k]==source_statement){
											source_statement_exist=false;
										}
									}
									if(source_statement_exist){
										source_statement_arr.push(source_statement);
									}*/
									console.log(returnStr.split('\t'),PROPERTIES[i]['children'][child]);
									if(returnStr.split('\t').indexOf(PROPERTIES[i]['children'][child])==-1){
										returnStr += '\t' + PROPERTIES[i]['children'][child] + '\t' + quote(jQuery('#' + row + '-' + j).text(), j);
									}
								}
                            }
                        }
                    }
                }
            }
        }
    }
	/*for (k=0; k<source_statement_arr.length;k++){
		returnStr += source_statement_arr[k];
	}*/
    return returnStr;
}

function quote(text, i) {

	if(i==-1){
		return '"'+text+'"';
	}
    if (['Monolingualtext','String','Url', 'ExternalId'].indexOf(PROPERTIES[i]['type'])>-1) {
		if (['Monolingualtext'].indexOf(PROPERTIES[i]['type'])>-1) {
			return LANGUAGE+':"' + text + '"';
		}
		else{
			return '"' + text + '"';
		}
    } else {
        return text;
    }
}

function addSources(row,i) {
	return "";
    //console.log('addSources', row);
    returnStr = "";
    regex = /^.*\.S[0-9]*$/g
    for (j = 1; j < PROPERTIES.length; j++) {
		//console.log(PROPERTIES[j]['originalLabel'], regex);
        if (regex.test(PROPERTIES[j]['originalLabel']) == true) {
            if ((jQuery('#' + row + '-' + j).text() != "") && (jQuery('#' + row + '-' + j).attr('class') == 'td ok')) {
				if('parent' in PROPERTIES[j]){
					if(PROPERTIES[j]['parent']==PROPERTIES[i]['p']){
						returnStr += '\t' + PROPERTIES[j]['originalLabel'].split(".")[1] + '\t' + quote(jQuery('#' + row + '-' + j).text(), j);
					}
					
				}
				else{
					returnStr += '\t' + PROPERTIES[j]['originalLabel'].split(".")[1] + '\t' + quote(jQuery('#' + row + '-' + j).text(), j);
				}
            }
        }
    }
    return returnStr;
}


function fillDIV() {
    header = ""
    for (j = 0; j < csvArr.length; j++) {
        row = ""
        for (i = 0; i < csvArr[0].length; i++) {
            if (j == 0) {
                row += '<div class="td header" id="' + j + '-' + i + '">' + csvArr[j][i] + '</div>';
                PROPERTIES.push({
                    "originalLabel": csvArr[j][i]
                });
                if (LABELS.indexOf(csvArr[j][i]) > -1) {
                    PROPERTIES[i]["p"] = csvArr[j][i];
                    PROPERTIES[i]["type"] = "String";
                }
                

            } else {
				console.log(csvArr[j][i]);
				if(csvArr[j][i] == undefined){csvArr[j][i]=="", console.log("changed");};
                row += '<div class="td nogo" id="' + j + '-' + i + '" alt="' + csvArr[j][i] + '" value="">' + csvArr[j][i] + '</div>';
                if (PROPERTIES[i]['type'] == 'Time') {
                    //checkType(j+'-'+i);
                }
            }
        }
        console.log(jQuery('#output').text());
        jQuery('#output').append('<div class="tr">' + row + '</tr>');
    }

    jQuery('.table').on('click', '.td', function(event) {
        confirm(event, jQuery(this).attr("id"))
    });
    checkCells();
    fillDivEnded=true;
}




function checkCells() {

	k=0;
	numberOfStatements=0
    counter = (csvArr.length * csvArr[0].length) -1;
    for (j = 0; j < csvArr.length; j++) {
        for (col = 0; col < csvArr[0].length; col++) {
			if(jQuery('#' + j + '-' + col).text()=='undefined'){
				jQuery('#' + j + '-' + col).text("");
				jQuery('#' + j + '-' + col).attr("alt","");
			}
			else{
				if(j!=0 && col!=0 && jQuery('#' + j + '-' + col).attr("class")!= "td hide"){
					numberOfStatements+=1;
				}
			}
			console.log(k++);
            regex = /^Q[0-9]+$/g
            if (regex.test(jQuery('#' + j + '-' + col).text()) != false) {
                jQuery('#' + j + '-' + col).attr("class", "td ok");
            }
            if (LABELS.indexOf(csvArr[0][col]) > -1) {
                jQuery('#' + j + '-' + col).attr("class", "td ok");
            }
            if (PROPERTIES[col]['type'] == 'Time') {
                //continue;
            } else {
                if (j > 0 && jQuery('#' + j + '-' + col).attr('class').indexOf('ok') > -1) {
                    //continue;
                }
                lookup(j + '-' + col);
            }
            jQuery('#counter').text(counter--);
            
            confirmExec(j + '-' + col);
        }
    }
    INIT = false;
    //jQuery('#popup').css("display", 'none');
    jQuery('#output2 textarea').css("height", '0px');
    startOutput();
    console.log(PROPERTIES);
}


function confirm(event, id) {
    //console.log(id, jQuery('#' + id).text());
    //console.log("X: " + event.pageX + ", Y: " + event.pageY);
    jQuery('#popup').css("top", event.pageY + 'px');
    jQuery('#popup').css("left", event.pageX + 'px');
    confirmExec(id);
}

function confirmExec(id,force=false) {
	if (fillDivEnded){
		jQuery('#popup').css("display", 'block');
		jQuery('#popup').html("");
		jQuery('#popup').prepend(jQuery("<div/>").attr("id", "choice").attr("size", "13"));
		jQuery('#choice').append(jQuery('<li/>').html('<strong title="HIDE" style="color:brown;">HIDE </strong>'));
		jQuery('#choice').append(jQuery('<li/>').html('<strong title="MODIFYTHIS" style="color:brown;">MODIFY THIS</strong>'));
		jQuery('#choice').append(jQuery('<li/>').html('<strong title="MODIFYALL" style="color:brown;">MODIFY ALL</strong>'));
		jQuery('#choice').append(jQuery('<li/>').html('<strong title="REQUERY" style="color:brown;">REQUERY </strong>'));
		jQuery('#choice').append(jQuery('<li/>').html('<strong title="RESTORE" style="color:brown;">RESTORE </strong>'));
		jQuery('#choice').append(jQuery('<li/>').html('<strong title="CREATE" style="color:brown;">CREATE </strong>'));

		//console.log(PROPERTIES[id.split('-')[1]]['type'],jQuery('#' + id).attr('value'));
		if (PROPERTIES[id.split('-')[1]]['type'] == "WikibaseItem") {
			if ((jQuery('#' + id).attr('value') == "") || force){
				lookup(id, jQuery('#' + id).text());
			} else {
				//console.log(jQuery('#' + id).attr('value'));
				jQuery('#popup').html(jQuery('#' + id).attr('value'));

			}
			jQuery('#' + id).attr('value', jQuery('#popup').html());
		}
		jQuery('#choice strong').off;
		jQuery('#choice').on("click", 'strong', function() {
			changeDiv(id, jQuery(this).attr('title'), jQuery(this).parent().text())
		});
	}
}


function processData(icd10Codes) {
    "use strict";
    csvArr = $.csv.toArrays(icd10Codes);
    if (csvArr[0][0] != 'item') {
        csvArr = [];
        return;
    }
    else{
		console.log ("Make sure that the first column is called 'item'");
	}
	if (jQuery('#output2 textarea').length!=0){
		jQuery('#output2 textarea').text="We are now processing the data. Please wait...";
	}
    fillDIV();
}

function processJSON(jsonArr){
	console.log(jsonArr);
	csvArr=[];
	console.log(csvArr);
	csvArr[0]=['item'];
	offset=0;
	nextCsvLine=1;
	item=""
	console.log(jsonArr.length);
	for (i=0;i<jsonArr.length;i++){
		console.log(jsonArr[i]);
		csvArr[nextCsvLine]=[];
		jQuery.each(jsonArr[i],function(k,v){
			if(k=="item"){item=v};
		});
		jQuery.each(jsonArr[i],function(k,v){
			console.log(k,v);
			kArr=k.split("|");
			if(kArr.length==1){
				csvArr[nextCsvLine][getColumn(kArr[0])]=v;
			}
			else{
				if(csvArr[nextCsvLine+parseInt(kArr[1])]== null){
					csvArr[nextCsvLine+parseInt(kArr[1])]=[];
				}
				csvArr[nextCsvLine+parseInt(kArr[1])][getColumn(kArr[0])]=v;
				csvArr[nextCsvLine+parseInt(kArr[1])][0]=item;
				if(parseInt(kArr[1])>offset){
					offset=parseInt(kArr[1]);
					console.log(parseInt(kArr[1]),offset);
				}
			}

		});
		console.log(i,csvArr);
		nextCsvLine=offset+1+nextCsvLine;
		console.log(i, nextCsvLine);
		offset=0;
	}
	console.log(csvArr);
	csvArr = csvArr.filter(function(n){ return n != undefined }); 
		console.log(csvArr);
}

function getColumn(property){
	for (j=0;j<csvArr[0].length;j++){
		if(csvArr[0][j]==property){
			return j;
		}
	}
	csvArr[0].push(property);
	return csvArr[0].length - 1;
}

function readCSV() {
    $.ajax({
        type: "GET",
        url: document.getElementById("file-input").files[0].name,
        dataType: "text",
        success: function(data) {
            processData(data);
        }
    });
}

function inputCSV() {
    openTextarea();
    
}

function OLDopenTextarea(content = "") {
    jQuery('#popup').off;
    jQuery('#popup').html("");
    jQuery('#popup').css("top", '100px');
    jQuery('#popup').css("left", '100px');
    jQuery('#popup').append("<textarea></textarea>");
    jQuery('textarea').text(content);
    jQuery('#popup').css("display", 'block');

};

function openTextarea(content = "") {
    //jQuery('#output2').off;
    jQuery('#output2').html("");
    //jQuery('#output2').css("top", '100px');
    //jQuery('#output2').css("left", '100px');
    //jQuery('#output2').css("height","300px");
    jQuery('#output2').append("<textarea></textarea>");
    jQuery('textarea').text(content);
    //jQuery('#output2 textarea').css("background-color","lightgreen");
    jQuery('#output2 textarea').attr("class","btn");
    jQuery('#output2 textarea').css("height","300px");
    jQuery('#output2 textarea').css("width","100%");
    jQuery('#output2 ').css("display", 'inline');

};

function lookup(id, searchTerm = "", popupContent = "") {
    query = ""
    column = id.split("-")[1];
    row = id.split("-")[0];
    console.log('lookup', id, searchTerm, popupContent);
    if (searchTerm.length > 0) {
        searchTerm = searchTerm.split(" ").join(" ");
        base_url = 'https://www.wikidata.org/w/api.php?format=json&action=wbsearchentities&search=' + encodeURI(searchTerm) + '&limit=50&language='+LANGUAGE+'&uselang='+LANGUAGE+'&origin=*';
        url = base_url;
    } else {
        base_url = 'https://query.wikidata.org/sparql';
        if (row == 0) {
            pArr = csvArr[0][column].split(".");
            console.log(pArr);
            if (pArr.length > 1) {
                PROPERTIES[column]['parent'] = pArr[0];
                for (k = 0; k < PROPERTIES.length; k++) {
                    console.log(PROPERTIES[k]['originalLabel'], pArr[0] );
                    if (PROPERTIES[k]['originalLabel'] == pArr[0] || PROPERTIES[k]['p']==pArr[0]) {
                        if (!('children' in PROPERTIES[k])) {
                            PROPERTIES[k]['children'] = [pArr[1]];
                        } else {
                            PROPERTIES[k]['children'].push(pArr[1]);
                        }
                        break;
                    }
                }
            } else {
                PROPERTIES[column]['parent'] = "";
            }
            p = pArr[pArr.length - 1]
            regex = /^[P|S][0-9]*$/g
            if (regex.test(p) == true) {
                if (p.slice(0, 1) == "S") {
                    PROPERTIES[column]['source'] = true;
                } else {
                    PROPERTIES[column]['source'] = false;
                }
                p = p.replace("S", "P");
                PROPERTIES[column]['pClean'] = p;
                query = 'SELECT DISTINCT ?p ?pLabel ?pDescription ?pType \
						WHERE\
						{\
						  bind(<http://www.wikidata.org/entity/' + p + '> as ?p).\
						?p rdfs:label ?pLabel FILTER (LANG (?pLabel) = "'+LANGUAGE+'").\
						?p rdf:type wikibase:Property .\
						?p wikibase:propertyType ?pType .\
						?p schema:description ?pDescription FILTER (LANG (?pDescription) = "'+LANGUAGE+'").\
						}'
            } else {
                PROPERTIES[column]['source'] = false;
                query = "SELECT DISTINCT ?p ?pLabel ?pDescription ?pType \
						WHERE\
						{\
						?p rdfs:label '" + csvArr[0][column] + "'@"+LANGUAGE+".\
						?p rdf:type wikibase:Property .\
						?p wikibase:propertyType ?pType .\
						SERVICE wikibase:label { bd:serviceParam wikibase:language \""+LANGUAGE+"\" }	\
						}"
            }

        } else {
            //console.log(csvArr[row][column], row, column);		
            regex = /^Q[0-9]*$/g
            test = regex.test(csvArr[row][column]);
            if (test == true) {
                test = csvArr[row][column] in objects;
                //console.log(objects);
                if (test == true) {
                    //console.log("schon in objects");
                    return;
                } else {
                    query = 'SELECT DISTINCT ?item ?itemLabel ?itemDescription \
					WHERE{bind(wd:' + csvArr[row][column] + ' as ?item). \
					SERVICE wikibase:label { bd:serviceParam wikibase:language "'+LANGUAGE+'" } \
					}'
                    objects[csvArr[row][column]] = "";
                }
            } else {
                return;
            }
        }
        //console.log(query);
        url = base_url + "?format=json&query=" + encodeURI(query);
    }
    //console.log(url);
    newQuery=true;
    if (requery){
	}
	else{
		requery=false;
		for (i=0;i<QUERIES.length;i++){
			console.log(QUERIES[i] == url);
			if (QUERIES[i] == url){
				newQuery=false;
			}
		}
		//console.log ("row ", row);
		if (!newQuery && row!=0){
			
			return;
		}
	}
    QUERIES.push(url);
    jQuery.ajax({
        url: url,
        success: function(data) {
            if (searchTerm.length > 0) {
                console.log(data);
                data = data['search'];
            } else {
                data = data['results']['bindings'];
            }
            WdResponse(data, id, searchTerm, "");;
        },
        error: function(data){console.log("error reported for url " + url)},	
        async: false
    });
    return (query);
}


function WdResponse(data, id, searchTerm) {
	console.log(data, id, searchTerm);
    column = id.split("-")[1];
    row = id.split("-")[0];
    console.log(data, searchTerm, row, column);
    sourceText=jQuery('#'+row+'-'+column).text();
    if (searchTerm.length > 0) {
        jQuery('#choice').off;
        for (i = 0; i < data.length; i++) {
            snippet = '<strong title="' + data[i]['title'] + '">' + data[i]['label'] + ' </strong>(<a href="' + data[i]['concepturi'] + '" target="_blank">' + data[i]['title'] + "</a>)<i> -> " + data[i]['description'] + "</i>  ";
            jQuery('#choice').append(jQuery('<li/>').html(snippet)).css('color', 'black');
        };
        console.log(data.length);
        html=jQuery('#popup').html();
        jQuery('#'+id).attr('value',html);
        if (data.length==0){
			 changeDiv(id, "CREATE", "") ;
		}
        //console.log(html);
        jQuery('#choice').on("click", 'strong', function() {
            changeDiv(id, jQuery(this).attr('title'), jQuery(this).parent().text())
        });
        return;
    }
    
    if (row == 0) {
		// Filling the PROPERTIES array with values
        if (column == 0) {
            PROPERTIES[column]['type'] = "WikibaseItem";
        }
        PROPERTIES[column]['pLabel'] = data[0]['pLabel']['value'];
        PROPERTIES[column]['p'] = data[0]['p']['value'].replace("http://www.wikidata.org/entity/", "");
        type = data[0]['pType']['value'];

        PROPERTIES[column]['type'] = type.replace("http://wikiba.se/ontology#", "");
        if (regex.test(csvArr[0][column]) == true) {
            jQuery('#' + id).attr('title', data[0]['pLabel']['value'] + ' (' + data[0]['pDescription']['value'] + ') ' + PROPERTIES[column]['originalLabel']);

        } else {}
        jQuery('#' + id).attr('title', data[0]['pLabel']['value'] + ' (' + data[0]['pDescription']['value'] + ') ' + PROPERTIES[column]['originalLabel']);

        jQuery('#' + id).text(PROPERTIES[column]['p']);
    } else {
        jQuery('#' + id).attr('title', data[0]['itemLabel']['value'] + ' (' + data[0]['itemDescription']['value'] + ') ');
        jQuery('#' + id).attr("class", "td ok");
        checkEquals(id,jQuery('#' + id).text(),sourceText);
        checkType(id);
    }
}

function changeDiv(id, targetText, targetTitle) {
	console.log(id,"|", targetText, "|",targetTitle);
	sourceText=jQuery('#' + id).text();
    jQuery('#popup').css("display", 'none');
    if (targetText == "HIDE") {
        jQuery('#' + id).attr('class', 'td hide');
        checkEquals(id, sourceText,sourceText);
        return;
    }
    if (targetText == "MODIFYALL") {
        if (PROPERTIES[parseInt(id.split('-')[1])]['type'] == "Time") {
            jQuery('#' + id).text(getDate(jQuery('#' + id).text()))
        }
        var targetText = prompt("Enter a new value", jQuery('#' + id).text());
        if (targetText != null || targetText == "") {
			jQuery('#' + id).text(targetText);
            checkEquals(id, jQuery('#' + id).text(), sourceText);
        }
        jQuery('#' + id).attr('class','td nogo');
        checkType(id);
        confirmExec(id);
        return;
    }
    if (targetText == "MODIFYTHIS") {
        if (PROPERTIES[parseInt(id.split('-')[1])]['type'] == "Time") {
            jQuery('#' + id).text(getDate(jQuery('#' + id).text()))
        }
        var targetText = prompt("Enter a new value", jQuery('#' + id).text());
        if (targetText != null || targetText == "") {

            jQuery('#' + id).text(targetText);

        }
        jQuery('#' + id).attr('class','td nogo');
        checkType(id);
        confirmExec(id);
        return;
    }
    if (targetText == "RESTORE") {
        jQuery('#' + id).text(jQuery('#' + id).attr('alt'));
        jQuery('#' + id).attr('class', 'td nogo');
        checkEquals(id, sourceText,sourceText);
        return;
    }
    if (targetText == "CREATE") {
        jQuery('#' + id).attr('class', 'td create');
        checkEquals(id, sourceText,sourceText);
        return;
    }
    
    if (targetText == "REQUERY"){
		console.log("requery start");
		requery=true;
		jQuery('#' + id).attr('value', '');
		jQuery('#' + id).attr('class','td nogo');
		confirmExec(id, true);
		return;
		
	}
	console.log(id,"|", targetText, "|",targetTitle);
	sourceText=jQuery('#' + id).text();
	console.log(sourceText,id);
    jQuery('#' + id).text(targetText);
    jQuery('#' + id).attr('class', 'td ok');
    jQuery('#' + id).attr('title', targetTitle);
    console.log(id,",", targetText,",",sourceText);
    checkEquals(id, targetText,sourceText);
    checkType(id);
    return;

}




function checkEquals(id, targetText = "", surceText="") {
    targetTitle = jQuery('#' + id).attr("title");
    targetClass = jQuery('#' + id).attr('class');
    targetValue = jQuery('#' + id).attr('value');
    for (row = 1; row < jQuery('.tr').length; row++) {
        for (column = 0; column < PROPERTIES.length; column++) {
            if (jQuery('#' + row + '-' + column).text() == sourceText) {
				jQuery('#' + row + '-' + column).text(targetText);
                jQuery('#' + row + '-' + column).attr('title', targetTitle);
                jQuery('#' + row + '-' + column).attr('class', targetClass);
                jQuery('#' + row + '-' + column).attr('value', targetValue);
            }
        }
    }
}


function checkType(id) {
	// Determinates if the value of a statement is correponding to the property type
    if (['td hide', 'td create'].indexOf(jQuery('#' + id).attr('class')) > -1) {
        return true;
    }
    if (jQuery('#' + id.split('-')[0] + '-0').attr('class') == 'td hide') {
        jQuery('#' + id).attr('class', 'td hide');
        return true;
    }
    column = id.split("-")[1];
    row = id.split("-")[0];
    text = jQuery('#' + id).text();
    type = PROPERTIES[column]['type'];
    check = false;
    if (LABELS.indexOf(PROPERTIES[column]['originalLabel']) > -1) {
        type = 'String';
    }
    if (PROPERTIES[column]['originalLabel'] == 'item') {
        type = 'WikibaseItem';
    }
    if (row == 0) {
        return false;
    }
    switch (type) {
        case 'WikibaseItem':
            regex = /^Q[0-9]*$/g
            if (regex.test(text) == true) {
                check = true;
            }
            break;
        case 'Time':
			if(text==""){
				check = true;
				break;
			}
            ISO = false;
            regex = /^[0-9|\+|Z|\/|-|T|:]*$/;
            if (regex.test(text) == true) {
                check = true;
            }
            regex = /^[0-9|\/|\.]*$/;
            if (regex.test(text) == false) {
                //console.log(text);
                regex = /\+[0-9]{4}-[0-9]{2}-[0-9]{2}T00:00:00Z\//g
                if (regex.test(text) == false) {
                    break;
                } else {
                    ISO = true;
                }
            }
            if (ISO) {
                textArr = [text.slice(1, 5)];
                if (text.slice(6, 8) != "00") {
                    textArr.unshift(text.slice(6, 8));
                };
                if (text.slice(9, 11) != "00") {
                    textArr.unshift(text.slice(9, 11));
                };
            } else {
                textArr = text.split(/\.|\//);
            }
            precision = textArr.length + 8;
            switch (precision) {
                case 9:
                    time = '+' + textArr[0] + '-00-00T00:00:00Z/09';
                    break;
                case 10:
                    if (textArr[0].length == 1) {
                        textArr[0] = '0' + textArr[0]
                    }
                    time = '+' + textArr[1] + '-' + textArr[0] + '-00T00:00:00Z/10';
                    break;
                case 11:
                    if (textArr[0].length == 1) {
                        textArr[0] = '0' + textArr[0];
                    }
                    if (textArr[1].length == 1) {
                        textArr[1] = '0' + textArr[1];
                    }
                    time = '+' + textArr[2] + '-' + textArr[1] + '-' + textArr[0] + 'T00:00:00Z/11';
                    break;
            }
            if(time.length != 24){
				check = false;
				break;
			}
            jQuery('#' + id).text(time);
            check = true;
            break;
        case 'String':
            regex = /^Q[0-9]*$/g
            if (regex.test(text) != true) {
                check = true;
            }
            break;
        case 'Url':
				check = true;
            break;
        case 'GlobeCoordinate':
			regex = /^[-|+]{0,1}[0-9]{1,3}\.[0-9]+[,|;|\/][-|+]{0,1}[0-9]{1,3}\.[0-9]+$/g;
			if (regex.test(text) == true){
				check = true;
				textArr=text.split(",")
				jQuery("#"+id).text("@"+textArr[0] +"/"+textArr[1])
				break;
				}
			regex=/^[-|+]{0,1}[0-9]{1,3}\.[0-9]+[,|;|\/][-|+]{0,1}[0-9]{1,3}\.[0-9]+\?z=[0-9]{1,2}$/g;
			if (regex.test(text) == true){
				check = true;
				textArr=text.split(/,|;|\?/g)
				jQuery("#"+id).text("@"+textArr[0] +"/"+textArr[1])
				break;
				}				
			regex=/^geo:[-|+]{0,1}[0-9]{1,3}\.[0-9]+[,|;|\/][-|+]{0,1}[0-9]{1,3}\.[0-9]+\?z=[0-9]{1,2}$/g;
			if (regex.test(text) == true){
				check = true;
				textArr=text.split(/geo:|,|;|\?/g)
				jQuery("#"+id).text("@"+textArr[1] +"/"+textArr[2])
				break;
				}
			regex=/^@[0-9]{1,3}\.[0-9]+\/[0-9]{1,3}\.[0-9]+$/g
			if (regex.test(text)==true){
				jQuery('#'+id).text(text);
				check=true;
				break;
			}
			check=false;
            break;
        case 'ExternalId':
				check = true
            break;
        case 'Monolingualtext':
				check = true
            break;
    }
    if (text == "") {
        check = true;
    };
    if (check === true) {
        jQuery('#' + id).attr('class', 'td ok');
    } else {
        jQuery('#' + id).attr('class', 'td nogo');

    }
    return check;
}


function getDate(dateStr) {
    var date = [];
    if (dateStr.slice(0, 1) == '+') {
        date[0] = dateStr.slice(9, 11);
        date[1] = dateStr.slice(6, 8);
        date[2] = dateStr.slice(1, 5);
        dateStr = date.join('.');
        dateStr = dateStr.replace(/00\./g, "");
    }
    return dateStr;
}

function saveState(){
	openTextarea(jQuery('#output').html());
}

function loadState(){
		csvdata=false;
		//jQuery('#output').html(inputCSV());
		jQuery('#output').html(jQuery('#output2 textarea').text());
		jQuery('div').each(function(){
			console.log(jQuery(this).text());
			regex=/^[0-9]+-[0-9]+$/g
			id=jQuery(this).attr('id')
			console.log(id);
			if(regex.test(id)){
				posArr=id.split('-');
				console.log(posArr);
				if (posArr[1]==0){
					csvArr[posArr[0]]=[];
				}
				
				csvArr[posArr[0]][posArr[1]]=jQuery(this).text();
			}
			})
		checkCells();
	}
