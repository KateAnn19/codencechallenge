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

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
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

function readSingleFile(evt) {
  var f = evt.target.files[0];

  if (f) {
    var r = new FileReader();
    //   console.log(r)
    r.onload = function (e) {
      //contents is of type string (not a valid JSON string)
      var contents = e.target.result;
      //this converts to a JSON object
      var csvtojson = CSVToArray(contents);
      var filteredcsvtojson = csvtojson.filter((e) => e.length !== 1);
      //this prettifys the csvjson object
      var prettyjson = JSON.stringify(csvtojson, null, 4);
      var newoutput = [];
      var customobj = {};
      var maininfoheading = csvtojson[0];
      var maininfoheadingvalues = csvtojson[1];
      var lineitemsheading = csvtojson[3].filter((e) => e !== "");
      var lineitems_collection = [];
      var lineitems = [];
      var missing = "you are missing ";
      var ismissing = false;


      console.log(filteredcsvtojson);

      //this filters out the empty strings from the line items
      //["product", "description", "SKU", "quantity", "price", "rebate", "total price"]
      for (let i = 4; i < filteredcsvtojson.length; i++) {
        for (let j = 0; j < 7; j++) {
          if (filteredcsvtojson[i][j] === "") {
             
            missing += lineitemsheading[j] + ` in line item ${i + 1}, \n`;
            
            ismissing = true;
          }
        }

        var removed = csvtojson[i].filter((e) => e !== "");
        if (removed.length === 0) {
          continue;
        }

        lineitems.push(removed);
      }
      if (ismissing) {
        console.log(missing);
         //alert(missing);
       }

      for (let i = 0; i < lineitems.length; i++) {
        if (ismissing) {
         // console.log(missing);
          //alert(missing);
        }
        var lineitemsobj = {};
        for (let j = 0; j < lineitems[i].length; j++) {
          if (lineitemsheading[i] === "undefined") {
            continue;
          }

          lineitemsobj[lineitemsheading[j]] = lineitems[i][j];
        }
        lineitems_collection.push(lineitemsobj);
      }

      for (let i = 0; i < maininfoheading.length; i++) {
        customobj[maininfoheading[i]] = maininfoheadingvalues[i];

        newoutput.push("<tr><td>" + maininfoheading[i] + "</td></tr>");
      }

      customobj["lineitems"] = lineitems_collection;

      console.log(customobj);

      newoutput = "<table>" + newoutput.join("") + "</table>";
      document.write(newoutput);
      //r.readAsText(f);

      //   var lines = contents.split("\n"),
      //     output = [];
      //   for (var i = 0; i < lines.length; i++) {
      //     output.push(
      //       "<tr><td>" + lines[i].split(",").join("</td><td>") + "</td></tr>"
      //     );
      //   }

      //   output = "<table>" + output.join("") + "</table>";
      //   document.write(output);
    };
    r.readAsText(f);
    // document.write(output);
  } else {
    alert("Failed to load file");
  }
}
document.getElementById("fileinput").addEventListener("change", readSingleFile);
