//mainURL = The URL used to retrive the info from
var mainURL;


window.onload = function() {

    //Checks to see if there is custom settings set or not
    if (localStorage.getItem('settings') == null) {

        //If there isn't custom settings, it will create temporary ones, then save it. You can change the default ones.
        tmpSettings = ["json/", "My Custom Store"];
        localStorage.setItem('settings', JSON.stringify(tmpSettings));

        //The URL will be set to be the same one as the temporary settings.
        mainURL = tmpSettings[0];

    } else {

        //If there is custom settings, then it will set the mainURL to be the one saved in the custom settings
        mainURL = JSON.parse(localStorage.getItem('settings'))[0];

    }

    //This will set the store name to be the same as the settings.
    document.getElementById("store").innerText = JSON.parse(localStorage.getItem('settings'))[1];

    //ajax will try and retrive the codes from the mainURL. The json file name has to be "codes.json".
    //If you want to change it, then just change "/codes.json";
    $.ajax({
        url: mainURL + '/codes.json',
        dataType: 'json',
        success: function(data) {
            //If ajax can successfully get the information, then it will reverse the data.
            //If you don't want the data to be reversed, then just remove "data.reverse()".
            data.reverse();

            //This will save the codes it got from the url to the localStorage. This is used in case it
            //can't reach the website.
            localStorage.setItem('codes', JSON.stringify(data));

            //This will save all the items and codes that it can get from the website.
            storeItems(data);

            //This will setup the buttons so you can see the codes buttons.
            setupButtons(data);
        },
        error: function(data) {

            //If ajax fails, then the codes will be loaded locally.
            local = JSON.parse(localStorage.getItem('codes'));

            if (local != null) {
                //This will setup the buttons so you can see the codes buttons.
                setupButtons(local);
            } else {
                document.getElementById("loading").style.display = "none";
                $("#failsafe").fadeIn(500);
            }
        }
    });
};

function storeItems(items) {
    //items = all the information from the codes file used to retrive and save the codes from online.

    //This function will run through each codes you have saved in your server and save it locally so
    //the program/website can work offline.
    items.forEach(function(item) {
        $.ajax({
            url: mainURL + '/' + item[1] + '.json',
            dataType: 'json',
            success: function(data) {
                //This will save each code type into it's own item.
                localStorage.setItem(item[1], JSON.stringify(data));
            },
            error: function(data) {
                //This shouldn't show up unless you blocked access to the other codes.
                alert('ERROR: Please take a screenshot and send it to the programmer in charge: ' + JSON.stringify(data));
            }
        });
    });
}

function setupButtons(buttons) {
    //buttons = Array with all the buttons information

    //This will run through each option in the "codes.json" file and add a button for each option.
    buttons.forEach(function(item) {
        document.getElementById("buttons").innerHTML = `<button onclick="getCodes(\'` + item[1] + `\', 'false', 'disable')" type="button" class="btn btn-info phone-nice nice-buttons">` + item[0] + `</button>` + document.getElementById("buttons").innerHTML;
    });

    //This will remove the loading screen at the beginning of the app/website.
    document.getElementById("loading").remove();

    //This will enable the main display.
    document.getElementById("main").style.display = "block";

};



function submitItem(name, id, codeType, typeOfItem) {
    //name = Custom Input Name, id = Custom Input ID, codeType = Custom Catagory
    //This is used for custom items. The if statement checks to make sure that both, 
    //the name and id isn't empty.
    if (name.length != 0 && id.length != 0) {
        //This creates a new array called local to store both, the saved information, and the new one.
        var local = [];

        //This checks to see if the Custom Catagory is empty or not.
        if (localStorage.getItem(codeType) != null) {
            local = (JSON.parse(localStorage.getItem(codeType)));
        }

        //This saves the new information into a variable called newitem so we can push it into the local one.
        var newitem = [name, id, local.length + 1];

        local.push(newitem);

        //This saves the new local array with both, the old and new information, and converts the
        //array into a string, as you can't save arrays with localStorage.
        localStorage.setItem(codeType, JSON.stringify(local));

        //This will call the load function to clear the page.
        load();

        //This will setup the new items with the Custom Catagory.
        setupItems(local, codeType, typeOfItem);
    }

};

function getCodes(codeType, local, state) {
    //codeType = The codes it should recive, local = wether it's local or not (true or false),
    //state = Whether to show the Custom Input Fields or not ("allow", or nothing);

    //This will display all the necessary stuff needed for the codes.
    showCodeSections();

    //This will enable the loading screen to show up while loading the information.
    load();

    //If the local property is true, which is used for customs.
    if (local == "ture") {

        //This will change the Custom submit button onclick attribute to the catogory selected for custom.
        document.getElementById("customButton").setAttribute("onclick", `submitItem(document.getElementById('customName').value,document.getElementById('customId').value, '` + codeType + `', 'custom')`)

        //This will check to see if the Custom catagory is empty.
        if (localStorage.getItem(codeType) != null) {
            //If it's not empty, it will setup all the custom items.
            setupItems(JSON.parse(localStorage.getItem(codeType)), codeType, 'custom');
        } else {
            //If it's empty, then it will tell the use to create an item.
            document.getElementById("appendTo").style.display = "none";
            $("#appendTo").fadeIn(500);
            document.getElementById("appendTo").innerHTML = "<h4>Create a new custom item!</h4>";
        }

    } else if (local == "false") {
        //If loacl isn't true, then it will load the information from the codes it retrived in the
        //storeItems() function.
        var local = [];

        local = JSON.parse(localStorage.getItem(codeType));
        setupItems(local);

    } else {
        //If someone setup something incorrectly, then this message will appear.
        alert('Whoops! Looks like something went wrong. Try asking the one in charge to fix it!');
    }

    //If state is allow, then the Custom Input Fields will show up.
    inputToggle(state);
};

function showCodeSections() {
    //This displays everything necessary for the codes to show up.
    document.getElementById("appendTo").style.display = "block";
    $(".br-tag").fadeIn(500);
    $("#search").fadeIn(500);
    $("#settings_section").fadeOut(500);
    $(".container-fluid").fadeOut(500);
}

function inputToggle(state) {
    //This checks whether to show the custom input or not.
    if (state == "allow") {
        $("#customInputState").fadeIn(500);
    } else {
        $("#customInputState").fadeOut(500);
    }
}

function load() {
    //This enables the loading screen.
    document.getElementById("appendTo").innerHTML = "<h2 class=\"load\">Loading...</h2>";
}

function setupItems(items, special, typeOfItem) {
    //items = array that should be setup,
    //special = whether the item is custom or not ("custom", or nothing).

    //This clears the loading screen.
    document.getElementById("appendTo").innerHTML = "";

    //i = checks for how many times it's been looped for.
    var i = 0;

    //compareFinalNumber = checks to see if i is on the last loop.;
    var compareFinalNumber = 0;

    //count = Each loop of three numbers adds one to this.
    var count = 0;

    //tmpItems = Each item gets stored here until count goes up by one.
    var tmpItems = [];

    //finalArrayNumber = used to see if compareFinalNumber is equal to the finalArrayNumber.
    var finalArrayNumber = items.length - 1;

    //This loops through each item and adds it to the appendTo div.
    items.forEach(function(item, index) {
        /*
            I'm giving up on on doing this another way. I'm probably gonna do a much worse way,
            so don't use this as an example. (This comment was added on a live stream.)
        */
        if (i == 2) {
            //If the items been looped through 3 times, it will add them to the display.
            count++;
            tmpItems.push(item);
            document.getElementById("appendTo").innerHTML = document.getElementById("appendTo").innerHTML +
                `
                        <div class="container-fluid" style="display:none;">
                            <div class="row phone" id="` + count + `">
                                
                            </div>
                        </div>
                        <br>
                    `;

            //This will push the items into the display
            appendItems(tmpItems, count, special, typeOfItem);

            //This will clear the loop variable and reset it to 0
            i = 0;

            //This will clear the tmpItems array
            tmpItems = [];

        } else if (compareFinalNumber == finalArrayNumber) {
            //If this is the final item of the array, it will push it with whatever else is in the tmpItems.
            count++;
            tmpItems.push(item);
            document.getElementById("appendTo").innerHTML = document.getElementById("appendTo").innerHTML +
                `
                        <div class="container-fluid" style="display:none;">
                            <div class="row phone" id="` + count + `">
                                
                            </div>
                        </div>
                        <br>
                    `;

            //This will push the items into the display
            appendItems(tmpItems, count, special, typeOfItem);

            //This will clear the loop variable and reset it to 0
            i = 0;

            //This will clear the tmpItems array
            tmpItems = [];


        } else {
            //If the item is neither the 3rd one in the array nor is the final one, it will be pushed into the tmpArray.
            tmpItems.push(item);
            i++;
        }
        compareFinalNumber++;
    });

    //This will fadeIn the items so it doesn't look so sudden.
    $(".container-fluid").fadeIn(500);


    //This will enable the search function to work.
    $("#search").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".search").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

}

function appendItems(tmp, count, special, typeOfItem) {

    console.log(typeOfItem);
    //For each tmp item, it will make a card for it and push it into the div
    tmp.forEach(function(tmpItem) {

        if (typeOfItem == "custom") {
            //If the type of the card is custom, then it will enable a delete button.
            var appendTemplate = `
                    <div class="col-md-4 phone-nice">
                        <div class="card search">
                            <div class="card-body">
                                <h3>` + tmpItem[0] + `</h3>
                                <hr class="hr-line">
                                <h3 class="id-text">` + tmpItem[1] + `</h3>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-danger" onclick="deleteLocalItem(` + tmpItem[2] + `, \'` + special + `\')">Delete Custom Item</button>
                            </div>
                        </div>
                    </div>
                `
        } else {
            //If the item doesn't have a type, it will be a default item
            var appendTemplate = `
                    <div class="col-md-4 phone-nice">
                        <div class="card search">
                            <div class="card-body">
                                <h3>` + tmpItem[0] + `</h3>
                                <hr class="hr-line">
                                <h3 class="id-text">` + tmpItem[1] + `</h3>
                            </div>
                        </div>
                    </div>
                `
        }

        //This will push the item into the new div created in the setupItems function
        document.getElementById(count).innerHTML = document.getElementById(count).innerHTML + appendTemplate;

    });
};

function deleteLocalItem(id, codeType) {
    //id = the custom item id.
    //codeType = the type of custom the item is in.

    //2 new variables are made to store the items that isn't deleted.
    var local = [];

    var newlocal = [];

    //local will be the custom array that is stored.

    local = (JSON.parse(localStorage.getItem(codeType)));

    //This will check for each item in the local.
    local.forEach(function(item) {
        //If the item's id isn't equal to the one being deleted, then it will be saved to the newlocal array.
        if (item[2] != id) {
            var tmp = [];
            tmp = [item[0], item[1], newlocal.length + 1]
            newlocal.push(tmp);
        }
    });

    //This will update the custom catagory with the newlocal array.
    localStorage.setItem(codeType, JSON.stringify(newlocal));

    //This will enable the loading screen.
    load();

    //This will setup the newlocal array.
    setupItems(JSON.parse(localStorage.getItem(codeType)), codeType, 'custom');

}

function openSettings() {

    //This will hide everything.
    $("#appendTo").fadeOut(500);
    $("#customInputState").fadeOut(500);
    $("#search").fadeOut(500);
    $(".br-tag").fadeOut(500);

    //This will enable the settings
    $("#settings_section").fadeIn(500);

    //This will retrive the settings saved.
    var settings = JSON.parse(localStorage.getItem('settings'));

    //This will autofill the inputs with the saved settings
    document.getElementById("mainURL").value = settings[0];

    document.getElementById("storeName").value = settings[1];

}

function saveSettings(mainURLInput, storeName) {
    //mainURLInput = The main url it will use to retrive the codes.
    //storeName = The name of the store that will show up on the top of the app.

    //This will create a new array with the mainurl and the storename.
    var settings = [mainURLInput, storeName];

    //This will update the current mainURL variable with the new mainURLInput.
    mainURL = mainURLInput;

    //This will save the new custom settings.
    localStorage.setItem('settings', JSON.stringify(settings));

    //This will show a success message.
    document.getElementById("success_setting").style.display = "block";

}

function defaultSettings() {
    //This will restore everything to the default settings. You can change the defaults by editing this.
    var settings = ['json/', 'Custom Store'];

    localStorage.setItem('settings', JSON.stringify(settings));

    document.getElementById("msg").innerText = "Settings restored to default successfully!";

    document.getElementById("success").style.display = "block";

    location.reload(true);
}