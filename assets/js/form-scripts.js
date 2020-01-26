(function () {
    var sendMailURL = 'mailer/index.php';
    // validate.extend(validate.validators.datetime, {
    //     parse: function (value, options) {
    //         return +moment.utc(value);
    //     },
    //     format: function (value, options) {
    //         var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
    //         return moment.utc(value).format(format);
    //     }
    // });

    // These are the constraints used to validate the form
    //Header Form Fields
    var fields = {

        "email": {
            // Email is required
            presence: true,
            // and must be an email (duh)
            email: true
        },

        "name": {
            // Email is required
            presence: true,
            length: {
                minimum: 3,
                maximum: 20
            },
            format: {
                // We don't allow anything that a-z and 0-9
                // pattern: "[a-zA-Z]+",
                pattern: "[a-zA-Z ]+",
                message: "can only be letters"
            }
        },

        "phone-number": {
            // You need to pick a username too
            presence: true,
            //     format: {
            //     // We don't allow anything that a-z and 0-9
            //     pattern: "[0-9]+",
            //     flags: "i",
            //     message: "can only be numbers"
            // }
        },

        "message": {
            // Zip is optional but if specified it must be a 5 digit long number
        },
        "contactform" : {
            presence: false
        }
    };

    var fields_2 = {
        "email": {
            // Email is required
            presence: true,
            // and must be an email (duh)
            email: true
        }
    }


    // Assign field constraints to forms by ID
    var form_fields = {
        'weekly-webinar': fields_2,
        'contact-form': fields,
        'pop-up-form' : fields_2
    };


    //All Done

    _.each(document.querySelectorAll("form"), function (form) {
        var fields = form_fields[form.getAttribute('id')];
        form.addEventListener("submit", function (ev) {
            ev.preventDefault();
            handleFormSubmit(form, fields);
        });
        var inputs = form.querySelectorAll("input, textarea, select");
        for (var i = 0; i < inputs.length; ++i) {
            inputs.item(i).addEventListener("change", function (ev) {
                var errors = validate(form, fields) || {};
                showErrorsForInput(this, errors[this.name])
            });
        }
    });

    function handleFormSubmit(form, input) {
        var errors = validate(form, input);
        // then we update the form to reflect the results
        showErrors(form, errors || {});
        if (!errors) {
            showSuccess(form);
        }
    }

    // Updates the inputs with the validation errors
    function showErrors(form, errors) {
        // We loop through all the inputs and show the errors for that input
        _.each(form.querySelectorAll("input[name], select[name]"), function (input) {
            // Since the errors can be null if no errors were found we need to handle
            // that
            showErrorsForInput(input, errors && errors[input.name]);
        });
    }

    // Shows the errors for a specific input
    function showErrorsForInput(input, errors) {
        // This is the root of the input
        try{
            var formGroup = closestParent(input.parentNode, "form-group")
                // Find where the error messages will be insert into
                , messages = formGroup.querySelector(".messages");
        }catch(e){}
        // First we remove any old messages and resets the classes
        resetFormGroup(formGroup);
        // If we have errors
        if (errors) {
            // we first mark the group has having errors
            formGroup.classList.add("has-error");
            // then we append all the errors
            _.each(errors, function (error) {
                addError(messages, error);
            });
        } else {
            // otherwise we simply mark it as success
            formGroup.classList.add("has-success");
        }
    }

    // Recusively finds the closest parent that has the specified class
    function closestParent(child, className) {
        if (!child || child == document) {
            return null;
        }
        if (child.classList.contains(className)) {
            return child;
        } else {
            return closestParent(child.parentNode, className);
        }
    }

    function resetFormGroup(formGroup) {
        try{
            // Remove the success and error classes
            formGroup.classList.remove("has-error");
            formGroup.classList.remove("has-success");
            // and remove any old messages
            _.each(formGroup.querySelectorAll(".help-block.error"), function (el) {
                el.parentNode.removeChild(el);
            });
        }catch(e){}
    }

    // Adds the specified error with the following markup
    // <p class="help-block error">[message]</p>
    function addError(messages, error) {
        var block = document.createElement("p");
        block.classList.add("help-block");
        block.classList.add("error");
        block.innerText = error;
        messages.appendChild(block);
    }

    function showSuccess(form) {
        var payload = $(form).serialize();
        $.ajax({
            type: "POST",
            // dataType: 'json',
            url: sendMailURL,
            data: payload,
            success: function (data) {
                if(form.id == 'weekly-webinar') {
                    // $(form).html(data).append('<div id="addEventDiv" style="margin-top: 20px; width: 100%;"><div class="title-wrap" id="calHeading"><h5>Add Event</h5></div><div class="btn-wrap"><button type="button" class="btn ss-btn-primary" id="addEvt">Google Calendar</button></div><!--Add buttons to initiate auth sequence and sign out--><div id="gAuthUser" style="display: none; text-align: center;"><p>Please click button below to add event to Google Calendar</p></div><div style="text-align: center;"><button id="authorize_button" class="btn-cal" style="display: none;">Authorize</button><!--<button id="signout_button" style="display: none;">Sign Out</button>--></div><div id="content" style="color:#0e980e;word-wrap:break-word;text-align:center;"></div></div>');
                    $(form).html(data).append('<div id="addEventDiv" style="display: block;"><div class="title-wrap" id="calHeading"><h5>Add Event!<br> To Your Calendar</h5></div><div class="new-cal"><div class="add-to-calendar class_theNextMoveGroup" id="id_theNextMoveGroup"><a class="icon-google btn ss-btn-primary btn-cal" target="_blank" href="https://calendar.google.com/calendar/r/eventedit?text=Top-8%20types%20of%20incentives%20the%20fortune%20100%20companies%20get&dates=20190725T190000Z/20190725T193000Z&details=https://join.freeconferencecall.com/chad868&location=https://join.freeconferencecall.com/chad868&sprop&sprop=name:"><span id="gcal"></span>Google Calendar</a></div></div></div>');
                }
                else if(form.id == 'manager-weekly-webinar') {
                    $(form).html(data).append('<div id="addEventDiv" style="display: block; margin: 0 auto;"><div class="title-wrap" id="calHeading"><h5>Add Event!<br> To Your Calendar</h5></div><div class="new-cal"><div class="add-to-calendar class_theNextMoveGroup" id="id_theNextMoveGroup"><a class="icon-google btn ss-btn-primary btn-cal" target="_blank" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=TOP-5 MISTAKES TO AVOID WHEN HIRING A CITY MANAGER&dates=20190802T190000Z/20190802T193000Z&details=https://join.freeconferencecall.com/chad868&location=https://join.freeconferencecall.com/chad868&trp=true"><span id="gcal"></span>Google Calendar</a></div></div></div>');
                }
                else {
                    $(form).html(data);
                }

                //console.log('Success', data)
            },
            error: function (data) {
                // alert('Some error occured, please try again.');
                console.error('Error', data)
            }
        });
    }

    $(document).ajaxStart(function(){
        $('.loader').show();
    }).ajaxStop(function(){
        $('.loader').hide();
    });
})();