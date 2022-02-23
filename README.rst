Formjacking Attack
##############################################################

.. image:: ./_pictures/UFO_mamy.png
   :align: center
   :width: 800
   :alt: All layers

.. contents:: Contents
    :local:

Configuration guide
*****************************************
- Open the file `Python <./>`_



Local environment
=========================================
- Install `Python <https://www.python.org/>`_
- Install `PyCharm <https://www.jetbrains.com/pycharm/>`_ community edition
- Open PyCharm
    - Create a new project ``Get from VCS`` and copy paste `this github repository URI <https://github.com/nergalex/f5-bot-selenium.git>`_
    - Attach a `Python interpreter <https://www.jetbrains.com/help/pycharm/configuring-python-interpreter.html>`_
- Download `here <https://sites.google.com/chromium.org/driver/>`_ same Chrome driver as your Chrome browser ``chrome://settings/help``
- OPTION: for other browser, follow `this guide <https://selenium-python.readthedocs.io/installation.html#installation>`_
- Copy downloaded ``chromedriver(.exe)`` file in ``./_files/chromedriver.exe`` of your project
- For MacOS only, allow ``chromedriver`` as described `here <https://stackoverflow.com/questions/60362018/macos-catalinav-10-15-3-error-chromedriver-cannot-be-opened-because-the-de>`_:

.. code-block:: bash

    xattr -d com.apple.quarantine chromedriver

- Open file ``requirements.txt``
- Click on  ``Install requirements``

.. image:: ./_pictures/Install_requirements.png
   :align: center
   :width: 300
   :alt: setUp

- Choose **ONLY** those packages ton install: ``selenium``, ``requests``

.. image:: ./_pictures/no_install_2captcha.png
   :align: center
   :width: 300
   :alt: setUp

- Install *2captcha-python* package: at the bottom left of the window, open a Terminal

.. code-block:: bash

    PC: pip3.exe install 2captcha-python==1.1.0
    Mac: pip3 install 2captcha-python==1.1.0

_________________________________________

Remote environment
=========================================
- Deploy the blueprint ``Advanced WAF Demo v16 + LCC, ML, Device ID+ and IBD`` / version of 30/09/2021 and after
- Start the deployment ``Advanced WAF Demo v16 + LCC, ML, Device ID+ and IBD``
- Get Hackazon URI: ``Components`` >> ``BIG-IP`` >> ``Details`` >> ``Access methods`` >> ``IBD Demo with Hackazon as backend`` >> ``External``
- Get Hackazon user credential (login and passowrd) : ``Components`` >> ``LAMP-server`` >> ``Documentation`` >> ``Access methods`` >> ``Description`` >> <login>/<password>
- Open the e-mail received from Cloud Services and connect to IBD portal

_________________________________________

Test 1 - Human
=========================================
*Task*

    - Open a web browser
    - Paste *Hackazon URI* and append PATH ``/user/login``
    - Try to login using the user credential and solving the CAPTCHA

*Result*

    - You have been redirected to ``/account``

*Clean*

    - Logout

_________________________________________

Google recaptcha API key
=========================================
A Google Recaptcha account has been already created.
A ``site key`` and a ``secret key`` was added in Application's code.

*Task*

    - Use `2captcha user guide <https://2captcha.com/2captcha-api#solving_recaptchav2_new>`_ to find the ``site key``
    - You do not need to read after step 3

*Note*

    - For trainer: statistics are available `here <https://www.google.com/recaptcha/admin/site/479852569>`_

______________________________________________________

Test 2 - bot - bypass CAPTCHA, viva 2CATPCHA!
======================================================
*Task*

- In PyCharm, open ``website11.py``
- Click on ``Structure``

.. image:: ./_pictures/Structure.png
   :align: center
   :width: 300
   :alt: setUp

- Open ``setUp`` function

.. image:: ./_pictures/Structure_setUp.png
   :align: center
   :width: 300
   :alt: setUp


- Set global variables
    - Note: CAPTCHA_API_KEY is 2CAPTCHA API key and **NOT** the the Google recaptcha site-key

.. code-block:: bash

        URI = "https://{{your_hackazon_uri}}/user/login"
        LOGIN_USER = "test_user"
        LOGIN_PASSWORD = "123456"
        CAPTCHA_API_KEY = "{{ask_your_trainer}}"

- For Mac user, set local variable

.. code-block:: bash

        PATH = "./_files/chromedriver"

- Click on the left column, as described in the picture below, to suspend the script during his future execution

.. image:: ./_pictures/suspend.png
   :align: center
   :width: 500
   :alt: setUp

- Go to the end of the file and click on the green triangle

.. image:: ./_pictures/run_test.png
   :align: center
   :width: 300
   :alt: setUp

- Choose debug mode

.. image:: ./_pictures/run_test_debug.png
   :align: center
   :width: 300
   :alt: debug

- The script launch a Web browser controlled by Selenium
- Just for your understanding, when the script is suspended, locate the element in the Web browser's dev tool windows >> Elements tab
- Execute next action by clinking on "go to cursor"

.. image:: ./_pictures/debug_continue.png
   :align: center
   :width: 400
   :alt: go to cursor

- When element ``solveGRecaptcha`` function is suspended, check that ``site_key`` variable as the same value as the one you found in the previous exercise
- When element ``loginbtn`` is suspended, add a Filter on transaction to catch it: ``Chrome`` >> ``DevTool`` >> ``Network`` >> filter ``method:POST``
- "Go to cursor" and then see the POST request: note the ``g-recaptcha-response`` info in the form request

*Result*

- Bot succeed to login and he is redirected to ``/account``

*Clean*

    - In PyCharm, stop the script by clicking on the stop button i.e. a red square
_________________________________________

Configure Integrated Bot Defense
=========================================

More details in Integrated Bot Defense `admin guide <https://f5cloudservices.zendesk.com/hc/en-us/categories/1500000490201-Integrated-Bot-Defense>`_

*Task*

    - View detected human and bot transaction in ``Cloud Services`` >> ``IBD`` >> ``Dashboard``
    - Get BIG-IP credential: ``UDF`` >>` `Components`` >> ``BIG-IP`` >> ``Details`` >> ``Credentials``
    - Connect to BIG-IP: ``UDF`` >>` `Components`` >> ``BIG-IP`` >> ``Access`` >> ``TMUI``
    - Open IBD iApp: ``iApps`` >>` `App Services`` >> ``Hackazon_IBD`` >> ``Reconfigure``
    - Set parameters:
        - Entry points | JS Injection Paths in specific Webpages only: ``/user/login``
        - Endpoints | Paths to be Routed to Shape >>
            - Host ``HOST_of_your_hackazon_URI``
            - Endpoint ``/user/login``
            - Method ``POST``
            - Mitigation Action ``block``
        - Block Data:

.. code-block:: html

    <h1 class='page-title'>Demo | Blocked by Shape | Demo</h1>

- Click on ``Finished`` to reconfigure
- Connect to BIG-IP using SSH: ``UDF`` >>` `Components`` >> ``BIG-IP`` >> ``Access`` >> ``Web shell``
- Drop all connection:

.. code-block:: bash

    tmsh del sys conn all
    tmsh show sys conn cs-server-addr 10.1.10.52

_____________________________________________

Test 3 - bot - mitigated
=============================================
*Task*

    - In PyCharm, run a test in debug mode, as done in step *Test 2*
    - When element ``loginbtn`` is suspended, add a Filter on transaction to catch it: ``Chrome`` >> ``DevTool`` >> ``Network`` >> filter ``method:POST``
    - Click on ``preserve log``
    - "Go to cursor" and then see the POST request: note all the parameters, in the form, used to forward signal data to IBD
    - Run a test again in **NO** debug mode:

.. image:: ./_pictures/run_test_without_debug.png
   :align: center
   :width: 400
   :alt: debug

*Results*

    - See page ``Demo | Blocked by Shape | Demo``
    - View mitigated bot transaction in ``Cloud Services`` >> ``IBD`` >> ``Dashboard``
    - Filter on ``Application`` >> ``hackazon-ibd``

Cross-Origin Resource Sharing (CORS)
************************************
A web site could have an authentication API endpoint hosted in another domain.
In this case, web browser make a "preflight" request to the server hosting the cross-origin resource, in order to check that the server will permit the actual request.
In that preflight, the browser sends headers that indicate the HTTP method and headers that will be used in the actual request.

To handle this use case:

- Attach IBD to 2 VS:

    1. VS of the landing web site
    2. VS of the authentication API endpoint web site

- Collect IBD header names in a same domain transaction
- Update the iRule ``iRule_CORS.tcl`` with header names and iapp_name (i.e. Application Service name)

Reference:

- `CORS <https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS>`_
- `Access-Control-Allow-Headers <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers>`_

Cross-Origin Communication
************************************
A web site could delegate its authentication mechanism to a 3rd party.
In the rendered web page, an iframe - managed by the 3rd party hosted in another domain - display a CAPTCHA.

Normally, scripts on different pages are allowed to access each other if and only if the pages they originate from share the same protocol, port number, and host (also known as the "same-origin policy").
In a Cross-Origin use case, the `window.postMessage() <https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage>`_ method safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it.

The objective to handle this use case is to:

    1. Add a listener `EventTarget.addEventListener() <https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener>`_ on the 3rd party page, that will get useful info on CAPTCHA and send back info to the source caller using `window.postMessage() <https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage>`_
    2. On the main page, Add a listener `EventTarget.addEventListener() <https://developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener>`_ to catch the response back and write it in the page, for example in the 3rd party's iframe attribute
    3. On the main page, call the listener to do action using `window.postMessage() <https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage>`_

Configuration for step 1:

- Create a profiles >> Content >> HTML >> rule ``captcha-delivery_postMessage``

    - Match settings >> Match Tag Name: body
    - Action settings >> HTML to Append: ``<script> {{ copy paste ./files/iframe_cors_bypass-listener.js }} </script>``

- Create a profiles >> Content >> HTML ``captcha-delivery``

    - Content settings: ``text/html text/xhtml``
    - HTML rules: ``captcha-delivery_postMessage``

- Create a VS to listen on 3rd party domain and attach HTML profile ``captcha-delivery``

Configuration for step 2 and 3: view ``website7.py`` as an example

As you can see, bot configuration is splitted in 2 (Selenium and a reverse-proxy).
If you want to have a all in one solution, use `Hackium <https://github.com/jsoverson/hackium>`_






