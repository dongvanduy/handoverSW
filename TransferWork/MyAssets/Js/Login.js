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
        login();
    }
});
$(function () {
    //$('#cardId').val('V0907769');
    //#('#password').val('120402');
    //login();
});