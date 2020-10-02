function uploadConfirmation() {
  alert("Data Loaded!");
}

function displayData() {
  var dataset = document.getElementById("fileinput").value;
  var show = [];
  for (var i = 0; i < dataset.length; i++) {
    show.push("<span>" + dataset[i] + "</span>");
  }
}

//I found this function to use to turn the CSV into an array
//I did not write this function
function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ",";

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    // Delimiters.
    "(\\" +
      strDelimiter +
      "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      "\\r\\n]*))",
    "gi"
  );
  // Create an array to hold data. Give the array
  // a default empty first row.
  var arrData = [[]];
  // Create an array to hold individual pattern
  // matching groups.
  var arrMatches = null;
  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }
    var strMatchedValue;
    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  // Return the parsed data.
  return arrData;
}

//function to read the CSV file that a user uploads
function readSingleFile(evt) {
  var f = evt.target.files[0];
  //if there is a file that was uploaded
  if (f) {
    //creates a new file reader
    var r = new FileReader();
    r.onload = function (e) {
        //contents is of type string (not a valid JSON string)
        var contents = e.target.result;
        //this converts to a JSON object
        var csvtojson = CSVToArray(contents);
        //this filters out extra lines brought in from the CSV file
        var filteredcsvtojson = csvtojson.filter((e) => e.length !== 1);
        var newoutput = [];
        //-----------------------------------------------------------------------------
        // I chose to extract the values from the positions because I think the users
        // should be given a format to follow for submitting invocies.
        // This format would place the inputs in these positions always.
        // #Todo
        // In other iterations we could allow for flexibility on submission and
        // do more error handling and data validation, but I think a format is best
        //------------------------------------------------------------------------------
        //should always be main info heading
        var maininfoheading = csvtojson[0];
        console.log(maininfoheading.length);
        //should always be main info heading values
        var maininfoheadingvalues = csvtojson[1];
        //should always be line items heading and filter out extra empty excel cells
        var lineitemsheading = csvtojson[3].filter((e) => e !== "");
        //will be an array of objects after data validation is performed
        var lineitems_collection = [];
        var lineitems = [];
        // string to alert what items are missing
        // #Todo
        // In other iterations instead of an alert I might display on the page
        var missing = "you are missing ";
        // ismissing begins as false and if anything is missing will be set to true
        var ismissing = false;
        //this is the object created from all the user data
        var customobj = {};
        console.log(csvtojson);

        //-----------------------------------------------------------------------------
        //check main heading to see if the headings are present
        //-----------------------------------------------------------------------------
        // #Todo
        // In other iterations I would check the exact string to make sure they matched
        // and offer suggestions for spelling
        //------------------------------------------------------------------------------
        for (let i = 0; i < maininfoheading.length; i++) {
            if (maininfoheading[i] === "") {
                missing += " heading for main info on line " + i + "\n";
                //sets ismissing to true to flag that something is missing
                //so that an alert will be displayed to the user
                ismissing = true;
            }
            
        }
      
      //-----------------------------------------------------------------------------
      //check main heading values to see if values are present
      //if the PO number is missing then don't add. PO number is in position 13
      //-----------------------------------------------------------------------------
        for (let i = 0; i < maininfoheadingvalues.length; i++) {
          if (maininfoheadingvalues[13] === "") {
            continue;
          }
          else if(maininfoheadingvalues[i] === ""){
            missing += " values for heading on line " + i + "\n";
            //sets ismissing to true to flag that something is missing
            //so that an alert will be displayed to the user
            ismissing = true;
          }
          
        }
        //checks if these values are numbers 
        let check_num_11 = maininfoheadingvalues[11].match(/(\d+)/) !== null ? maininfoheadingvalues[11].match(/(\d+)/)[0]: false; 
        let check_num_12 = maininfoheadingvalues[12].match(/(\d+)/) !== null ? maininfoheadingvalues[12].match(/(\d+)/)[0]: false;
        if (!check_num_11){   
            missing += " shipping cost needs to be a number " + "\n";
            ismissing = true;
        } 
        else if(!check_num_12){
            missing += " sales tax needs to be a number " + "\n";
            ismissing = true;
        }
      
      //--------------------------------------------------------------------
      //check line items heading to see if headings are present
      //---------------------------------------------------------------------
      // #Todo
      // In other iterations I would check the exact string to make sure they matched
      // and offer suggestions for spelling
      //---------------------------------------------------------------------
        for (let i = 0; i < lineitemsheading.length; i++) {
            if(lineitemsheading === ""){
                missing += " heading for line items on line " + i + "\n";
                //sets ismissing to true to flag that something is missing
                //so that alert will be displayed to the user
                ismissing = true;
            }        
        }
      
      //--------------------------------------------------------------------------------
      //this function concats a string of errors for
      //line items. It also filters out empty strings from the line items
      //["product", "description", "SKU", "quantity", "price", "rebate", "total price"]
      //-------------------------------------------------------------------------------------
      // Line items start at position 4 in the array because of the way
      // the data will be brought in. If brought in correctly
      // then line items will always start at position 4
      //-------------------------------------------------------------------------------
      for (let i = 4; i < filteredcsvtojson.length; i++) {
        //this array stops at position 7 since there are only 7 possible line item inputs
        for (let j = 0; j < 7; j++) {
          //if something is missing then add it to missing items
          if (filteredcsvtojson[i][j] === "") {
            //concats a string of missing items
            missing += lineitemsheading[j] + ` in line item ${i + 1}, \n`;
            //sets ismissing to true to flag that something is missing
            //so that alert will be displayed to the user
            ismissing = true;
          }
        }
        //if excel added extra lines then this filters those out
        //it would also filter out empty values, but the check was placed
        //before this so that an alert would already be created
        var removed_empty_strings = csvtojson[i].filter((e) => e !== "");
        //if there is an empty array remove it
        if (removed_empty_strings.length === 0) {
          continue;
        }
        //pushes lines items into an array
        lineitems.push(removed_empty_strings);
      } //end loop over line items

      //if any items are missing they will display here
      //#Todo
      //in other iterations I might display values in a nice box on the page
      if (ismissing) {
        alert(missing);
      }

      //this loops over the line items and line items headings to
      //create an array of objects with keys being the headings and values
      //being the line items
      for (let i = 0; i < lineitems.length; i++) {
        var lineitemsobj = {};
        for (let j = 0; j < lineitems[i].length; j++) {
          if (lineitemsheading[i] === "undefined") {
            continue;
          }

          lineitemsobj[lineitemsheading[j]] = lineitems[i][j];
        }
        lineitems_collection.push(lineitemsobj);
      }

      //sets the key lineitems to the collection of line items
      customobj["lineitems"] = lineitems_collection;

      for (let i = 0; i < maininfoheading.length; i++) {
        customobj[maininfoheading[i]] = maininfoheadingvalues[i];
        newoutput.push("<tr><td>" + maininfoheading[i] + "</td></tr>");
      }

      //store in local storage for data persistence
      //not the best method, but swiftest for this exercise
      localStorage.setItem('invoice', JSON.stringify(customobj));

      newoutput = "<table>" + newoutput.join("") + "</table>";
      document.write(newoutput);
    };
    r.readAsText(f);
    // document.write(output);
    //if the document failed to load an alert is created
  } else {
    alert("Failed to load file");
  }
}
document.getElementById("fileinput").addEventListener("change", readSingleFile);

/*
billing_address: "2066 Rancho Hills Drive"
billing_address_city: "Chino Hills"
billing_address_postal_code: "91709"
billing_address_state: "CA"
comments: "An example product. It's featured!"
company: "Database Pros"
date: "10/01/2020"
discount: "10%"
email: "jmo@filemakerpros.com"
invoice_number: "INV000000103"
lineitems: (10) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
phone_mobile: "(909) 636-2314"
phone_work: "(909) 393-4664"
"po ": "232323523"
sales_tax: "$0.71 "
shipping_address: "2066 Rancho Hills Drive"
shipping_address_city: "Chino Hills"
shipping_address_postal_code: "91709"
shipping_address_state: "CA"
shipping_cost: "$124.56 "
web_site: "www.databasepros.com"
*/
//console.log(localStorage.getItem('invoice'));

let local_store_data = localStorage.getItem('invoice');
let local_store_parsed_data = JSON.parse(local_store_data)


let div = document.createElement('div');
let h2 = document.createElement('h2');
let par = document.createElement('p');

let body = document.querySelector('body');

for(var p in local_store_parsed_data){
    console.log(p);
    let new_div = document.createElement('div');
    let new_h2 = document.createElement('h2');
    new_h2.innerText = p + " " + local_store_parsed_data[p];
    new_div.appendChild(new_h2);
    body.appendChild(new_div);
}

h2.innerText = local_store_parsed_data["email"];

div.appendChild(h2);
body.appendChild(div);

div.className = "data";


//old data would live here that would be displayed to user 
let olddata = {
    'invoice_one': {},
    'invoice_two':{},
    'invoice_three': {}
}

