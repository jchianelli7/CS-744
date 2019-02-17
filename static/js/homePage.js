$(function () {
    !function isAdmin() {
        let cookie = document.cookie
        let cookieArr = cookie.split(";")
        for (let i in cookieArr) {
            let key = cookieArr[i].split("=")[0]
            if (key == "is_superuser") {
                if (cookieArr[i].split("=")[1] == 'True') {
                    $("#userStatus").text('Admin').css('margin-left',15+'%')
                } else {
                    $("#userStatus").text('Normal User')
                }
            }
        }
    }()

    $('#logout').on('click',function(){
        window.location.href='/homepage/logout/'
    })
})