$(function () {
    function getQuestion() {
        let originCookie = document.cookie
        let cookieArr = originCookie.split(";")
        for (let i in cookieArr) {
            let key = cookieArr[i].split("=")[0]
            if (key==" question"){
                $("#question").val(cookieArr[i].split("=")[1])
            }
        }
    }

    getQuestion()
    $("#cleanAnswer").on("click", function (e) {
        e.preventDefault()
        $("#Answer").val("")
    })
    // $("#answerQ").on("click", function (e) {
    //   e.preventDefault()
    //   if ($("#Answer").val().length == 0) {
    //     $(this).trigger(M.toast({html: 'Invalid Answer'}))
    //   }
    // })
})
