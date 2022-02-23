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

    <input ... id="login-credentials-form-password" name="password-c4f1d5fb-5d16-4419-ae49-59c5da5c9fec" type="password" ...>

- Open the file `skimmer.js <https://github.com/nergalex/f5-magecart/blob/master/skimmer.js>`_
- The first 3 lines describe elements to grab user data.

.. code-block:: javascript

    window["data_leak_label_email"] = ["input[id*='wsi-login-credentials-form-email']", "input[name*='email']", "input[type*='email']"]
    window["data_leak_label_password"] = ["input[id*='wsi-login-credentials-form-password']", "input[name*='password']"]
    window["data_leak_label_birth_date"] = ["input[id*='wsi-login-credentials-form-birthdate']", "input[name*='birthDate']"]

Deployment guide
*****************************************






