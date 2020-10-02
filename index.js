function uploadConfirmation() {
  //does not execute if wrong file type
  if (error === true) {
    const button = document.querySelector("#id");
    button.disabled = true;
    return;
  }
  alert("Data Loaded!");
}

//removes from local storage if error
function cancel() {
  //removes the item from local storage
  if (window.localStorage) {
    window.localStorage.clear();
  }

  //reloads the page
  location.reload();
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
  //-----------------------------------------------------------------------------
  // this checks to see that the right file type is implemented
  var filename = evt.target.files[0].name;
  var filetype =
    filename.substring(filename.lastIndexOf(".") + 1, filename.length) ||
    filename;
  //if the wrong file type is uploaded will be set to true
  var error = false;
  if (filetype !== "csv") {
    alert("CSV files only");
    error = true;
    throw new Error("try a different file");
  }
  //end check for right file type
  //-------------------------------------------------------------------------------
  //if there is a file that was uploaded successfully
  var f = evt.target.files[0];

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
      //grand total container
      var grandtotalheader = csvtojson[15].filter((e) => e !== "");
      var grandtotal = csvtojson[16].filter((e) => e !== "")[0];
      //replaces dollar signs and commas to extract number
      const commasAndDollarSignsRegex = /\$|,/g 
      const bareGrandTotal = grandtotal.replace(commasAndDollarSignsRegex, '')
      var grandnewtotal = parseFloat(bareGrandTotal);
     

    //checks if these values are numbers
    //    let check_num_11 =
    //    maininfoheadingvalues[11].match(/(\d+)/) !== null
    //      ? maininfoheadingvalues[11].match(/(\d+)/)[0]
    //      : false;
    //  let check_num_12 =
    //    maininfoheadingvalues[12].match(/(\d+)/) !== null
    //      ? maininfoheadingvalues[12].match(/(\d+)/)[0]
    //      : false;
      
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
        } else if (maininfoheadingvalues[i] === "") {
          missing += " values for heading on line " + i + "\n";
          //sets ismissing to true to flag that something is missing
          //so that an alert will be displayed to the user
          ismissing = true;
        }
      }
      //checks if these values are numbers
      let check_num_11 =
        maininfoheadingvalues[11].match(/(\d+)/) !== null
          ? maininfoheadingvalues[11].match(/(\d+)/)[0]
          : false;
      let check_num_12 =
        maininfoheadingvalues[12].match(/(\d+)/) !== null
          ? maininfoheadingvalues[12].match(/(\d+)/)[0]
          : false;
      if (!check_num_11) {
        missing += " shipping cost needs to be a number " + "\n";
        ismissing = true;
      } else if (!check_num_12) {
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
        if (lineitemsheading === "") {
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
      // the last 3 items will also not be included because they are extra lines and include a grand total 
      //-------------------------------------------------------------------------------
      for (let i = 4; i < filteredcsvtojson.length - 3; i++) {
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
        const submitObject = document.querySelectorAll("input")[1];
        submitObject.disabled = true;
        var newbutton = document.createElement("button");
        newbutton.innerText = "click for missing values";
        newbutton.id = "missingvalues";
        newbutton.addEventListener("click", function () {
          var divel = document.createElement("div");
          divel.className = "missingvalues";
          var pel = document.createElement("p");
          pel.className = "missingvalues";
          pel.innerText = missing;
          divel.append(pel);
          body.append(divel);
          newbutton.disabled = true;
          var tryagainbutton = document.createElement("button");
          tryagainbutton.innerText = "refresh and try again";
          tryagainbutton.id = "tryagain";
          pel.prepend(tryagainbutton);
          tryagainbutton.addEventListener("click", function () {
            localStorage.clear();
            location.reload();
          });
        });
        body.append(newbutton);
      }
        //count for rebate items
        var rebateitemscount = 0;
        var rebatetotal = 0;
        var quantity = 0;
        var price = 0;
        //this loops over the line items and line items headings to
        //create an array of objects with keys being the headings and values
        //being the line items
        for (let i = 0; i < lineitems.length; i++) {
            var lineitemsobj = {};
            for(let j = 0; j < lineitems[i].length; j++) {
                lineitemsobj[lineitemsheading[j]] = lineitems[i][j];
            }
            //before adding to collection, check math
            lineitems_collection.push(lineitemsobj);
        } //end line item check

        for (let i = 0; i < maininfoheading.length; i++) {
            customobj[maininfoheading[i]] = maininfoheadingvalues[i];
        } //end adding heading info

        //sets the key lineitems to the collection of line items
        customobj["lineitems"] = lineitems_collection;
        //begins calculation of total
        var totalpriceofitems = 0;
        var eachtotal = 0;
        for(let i = 0; i < customobj["lineitems"].length; i++){
            if(customobj["lineitems"][i].rebate === "yes"){
                rebateitemscount += 1;
                price = customobj["lineitems"][i].price;
                price = price.replace(/\$|,/g, '');
                price = parseFloat(price);
                quantity = customobj["lineitems"][i].quantity;
                quantity = parseInt(quantity);
                rebatetotal += quantity * price;
            }
            eachtotal = customobj["lineitems"][i].totalprice;
            eachtotal = eachtotal.replace(/\$|,/g, '');
            eachtotal = parseFloat(eachtotal);
            totalpriceofitems += eachtotal;
        }
         //function to check the math of the line items
        // elegible rebate items (all marked yes)
        
        var shipping; 
        //-------------------------------------------------
        //turn into numbers and check math
        //-------------------------------------------------
        function checkmath() {
            shipping = maininfoheadingvalues[11];
            shipping = shipping.replace(/\$|,/g, '');
            shipping = parseFloat(shipping);
            var check = totalpriceofitems + shipping;
            if((grandnewtotal >= check - 1) && (grandnewtotal <= check + 1)){
                return;
            }else{
                var errmssg = document.createElement('h2');
                errmssg.innerText = "There were errors in the totals";
                var tot = document.createElement('h2');
                tot.innerText = "Your total " + grandtotal;
                var ourtotal = document.createElement('h2');
                ourtotal.innerText = "Our total " + check;
                body.appendChild(errmssg);
                body.appendChild(tot);
                body.appendChild(ourtotal);
            }
        }//end math check

        checkmath();
        //add grandtotal to object if checks passed
        customobj["grandtotallineitems"] = grandnewtotal;
        //add rebate item count and rebate item total
        customobj["numrebateitems"] = rebateitemscount;
        customobj["totalrebateback"] = rebatetotal;
        customobj["totalafterrebate"] = grandnewtotal - rebatetotal;

        console.log(customobj);
        //store in local storage for data persistence
        //not the best method, but swiftest for this exercise
        localStorage.setItem("invoice", JSON.stringify(customobj));
    };
    r.readAsText(f);
    //if the document failed to load an alert is created
  } else {
    alert("Failed to load file");
  }
}
document.getElementById("fileinput").addEventListener("change", readSingleFile);

/*--------------------------------------------------------------------
This is what the object looks like
//--------------------------------------------------------------------
billing_address: "2066 Rancho Hills Drive"
billing_address_city: "Chino Hills"
billing_address_postal_code: "91709"
billing_address_state: "CA"
comments: "An example product. It's featured!"
company: "Database Pros"
date: "10/01/2020"
discount: "10%"
email: "jmo@filemakerpros.com"
grandtotallineitems: "$8,503,803.95 "
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
//end object ---------------------------------------------------------------

//gets what's in local storage and parses it
let local_store_data = localStorage.getItem("invoice");
let local_store_parsed_data = JSON.parse(local_store_data);

let div = document.createElement("div");
let h2 = document.createElement("h2");
let par = document.createElement("p");
let body = document.querySelector("body");

//loops over the object to display to user
for (var p in local_store_parsed_data) {
  //if the local storage data is line items, loop over those
  if (p === "lineitems") {
    for (let i = 0; i < local_store_parsed_data[p].length; i++) {
      var hel = document.createElement("h2");
      var hel2 = document.createElement("h3");
      var hel3 = document.createElement("h3");
      var hel4 = document.createElement("h3");
      var hel5 = document.createElement("h3");
      var hel6 = document.createElement("h3");
      var hel7 = document.createElement("h3");
      var pel = document.createElement("p");
      hel.innerText = "Product: " + local_store_parsed_data[p][i].product;
      hel.className = "datael";
      pel.innerText =
        "Description: " + local_store_parsed_data[p][i].description;
      pel.className = "datael";
      hel2.innerText = "Price: " + local_store_parsed_data[p][i].price;
      hel2.className = "datael";
      hel3.innerText = "Quantity: " + local_store_parsed_data[p][i].quantity;
      hel3.className = "datael";
      hel4.innerText = "Rebate: " + local_store_parsed_data[p][i].rebate;
      hel4.className = "datael";
      hel5.innerText =
        "Total Price: " + local_store_parsed_data[p][i].totalprice;
      hel5.className = "datel";
      hel6.innerText = "SKU: " + local_store_parsed_data[p][i].SKU;
      hel6.className = "datael";
      div.appendChild(hel);
      div.appendChild(hel2);
      div.appendChild(hel3);
      div.appendChild(hel4);
      div.appendChild(hel5);
      div.appendChild(hel6);
      div.appendChild(hel7);
      div.appendChild(pel);
      div.className = "container";
      body.appendChild(div);
    }
}else if(p === "grandtotallineitems"){
    //if not values were missing and totals passed check then run this
    let g_total = document.createElement('h2');
    g_total.innerText = "Grand total " + local_store_parsed_data[p];
    div.appendChild(g_total);
}else if(p === "numrebateitems"){
    let new_h3 = document.createElement("h3");
    new_h3.className = "datael";
    new_h3.innerText = p + "\n" + local_store_parsed_data[p];
    div.appendChild(new_h3);

}else if(p === "totalrebateback"){
    let new_h3 = document.createElement("h3");
    new_h3.className = "datael";
    new_h3.innerText = p + "\n" + local_store_parsed_data[p];
    div.appendChild(new_h3);

}else if(p === "totalafterrebate"){
    let new_h3 = document.createElement("h3");
    new_h3.className = "datael";
    new_h3.innerText = p + "\n" + local_store_parsed_data[p];
    div.appendChild(new_h3);
} 
else {
    let new_h3 = document.createElement("h3");
    new_h3.className = "datael";
    new_h3.innerText = p + "\n" + local_store_parsed_data[p];
    div.appendChild(new_h3);
  }
}


//old data would live here that would be displayed to user
let olddata = {
  invoice_one: {},
  invoice_two: {},
  invoice_three: {},
};

