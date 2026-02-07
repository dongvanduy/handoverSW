function login() {
    document.getElementById("LoginForm").classList.remove("was-validated");

    let cardIdInp = document.getElementById('cardId');
    let passwordInp = document.getElementById('password');
    let RememberCb = document.getElementById('rememberMe');

    // Check Input Null
    let checkValue = true;
    if (cardIdInp.value == "") {
        cardIdInp.value = "";
        cardIdInp.classList.add("is-invalid");
        document.getElementById("cardIDFeedback").innerHTML = "Please enter your Card ID!";
        checkValue = false;
    }
    if (passwordInp.value == "") {
        passwordInp.value = "";
        passwordInp.classList.add("is-invalid");
        document.getElementById("passwordFeedback").innerHTML = "Please enter your Password!";
        checkValue = false;
    }
    if (!checkValue)
        return;

    //Get data
    const Getdata = {
        CardID: cardIdInp.value,
        Password: passwordInp.value,
        RememberLogin: RememberCb.checked
    }
    // Send data to sever
    $.ajax({
        type: "POST",
        url: "/Login/Login",
        data: JSON.stringify(Getdata),
        contentType: "application/json",
        datatype: "json/text",
        success: function (respons) {
            console.log(respons.Status);
            if (respons.Status == "No Card ID") {
                cardIdInp.classList.add("is-invalid");
                document.getElementById("cardIDFeedback").innerHTML = "Card ID are not correct!"
                passwordInp.classList.remove("is-invalid");
            }
            else if (respons.Status == "Password Wrong") {
                cardIdInp.classList.remove("is-invalid");
                cardIdInp.classList.add("is-valid");
                passwordInp.value = "";
                passwordInp.classList.add("is-invalid");
                document.getElementById("passwordFeedback").innerHTML = "Password are not correct!"
            }
            else { // success
                cardIdInp.classList.remove("is-invalid");
                passwordInp.classList.remove("is-invalid");
                cardIdInp.classList.add("is-valid");
                passwordInp.classList.add("is-valid");
                window.location.href = respons.href;
            }
        },
        error: function () {
            alert("Couldn’t retrieve the HTML document because of server - configuration problems.Contact site administrator.");
        }
    });
}
document.addEventListener("keypress", function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        event.preventDefault();
        if ($('#RegisterModal').hasClass('show')) {
            registerUser();
        } else {
            login();
        }
    }
});
$(function () {
    //$('#cardId').val('V0907769');
    //#('#password').val('120402');
    //login();
});

function registerUser() {
    const cardIdInp = document.getElementById('registerCardId');
    const vnNameInp = document.getElementById('registerVnName');
    const enNameInp = document.getElementById('registerEnName');
    const departmentInp = document.getElementById('registerDepartment');
    const passwordInp = document.getElementById('registerPassword');
    const confirmInp = document.getElementById('registerConfirmPassword');

    const inputs = [cardIdInp, vnNameInp, departmentInp, passwordInp, confirmInp];
    inputs.forEach(input => {
        input.classList.remove("is-invalid");
    });

    let valid = true;
    if (cardIdInp.value.trim() === "") {
        cardIdInp.classList.add("is-invalid");
        document.getElementById("registerCardIdFeedback").innerHTML = "Please enter your Card ID.";
        valid = false;
    }
    if (vnNameInp.value.trim() === "") {
        vnNameInp.classList.add("is-invalid");
        document.getElementById("registerVnNameFeedback").innerHTML = "Please enter your Vietnamese name.";
        valid = false;
    }
    if (departmentInp.value.trim() === "") {
        departmentInp.classList.add("is-invalid");
        document.getElementById("registerDepartmentFeedback").innerHTML = "Please choose your department.";
        valid = false;
    }
    if (passwordInp.value.trim() === "") {
        passwordInp.classList.add("is-invalid");
        document.getElementById("registerPasswordFeedback").innerHTML = "Please enter your password.";
        valid = false;
    }
    if (confirmInp.value.trim() === "") {
        confirmInp.classList.add("is-invalid");
        document.getElementById("registerConfirmPasswordFeedback").innerHTML = "Please confirm your password.";
        valid = false;
    }
    if (!valid) {
        return;
    }

    if (passwordInp.value !== confirmInp.value) {
        confirmInp.classList.add("is-invalid");
        document.getElementById("registerConfirmPasswordFeedback").innerHTML = "Password confirmation does not match.";
        return;
    }

    const data = {
        CardID: cardIdInp.value.trim(),
        VnName: vnNameInp.value.trim(),
        EnName: enNameInp.value.trim(),
        Department: departmentInp.value.trim(),
        Password: passwordInp.value,
        ConfirmPassword: confirmInp.value
    };

    $.ajax({
        type: "POST",
        url: "/Login/Register",
        data: JSON.stringify(data),
        contentType: "application/json",
        datatype: "json/text",
        success: function (respons) {
            if (respons.Status === "Success") {
                $('#RegisterModal').modal('hide');
                cardIdInp.value = "";
                vnNameInp.value = "";
                enNameInp.value = "";
                departmentInp.value = "";
                passwordInp.value = "";
                confirmInp.value = "";
                alert("Register success. Please login.");
                return;
            }

            if (respons.Status === "Card ID Exists") {
                cardIdInp.classList.add("is-invalid");
                document.getElementById("registerCardIdFeedback").innerHTML = "Card ID already exists.";
                return;
            }
            if (respons.Status === "Confirm Password Wrong") {
                confirmInp.classList.add("is-invalid");
                document.getElementById("registerConfirmPasswordFeedback").innerHTML = "Password confirmation does not match.";
                return;
            }
            alert("Register failed. Please double check the information.");
        },
        error: function () {
            alert("Couldn’t register because of server configuration problems. Contact site administrator.");
        }
    });
}
