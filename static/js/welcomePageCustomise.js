$(function () {
    //clean the text area when click the clean button
    $("#cleanText").on("click", function () {
        $("input").val('')
    })

    //submit the info for login
    $("#login").on("click", function (e) {
        e.preventDefault()
        if ($("#username").val().length < 6 || $("#password").val().length < 6) {
            $(this).trigger(M.toast({html: 'Invalid user name or password'}))
        } else {
            let username = $("#username").val()
            let password = $("#password").val()
            let loginInfo = {"username": username, "password": password}
            $.ajax({
                type: "post",
                url: "/login/login/",
                data: JSON.stringify(loginInfo),
                success: function (msg) {
                    if (msg != "") {
                        let error = msg.toString().split('"')[3]
                        $(this).trigger(M.toast({html: error}))
                    } else {
                        window.location.href = "/login/userConfirmPage/"
                    }
                }
            })
        }
    })
})
