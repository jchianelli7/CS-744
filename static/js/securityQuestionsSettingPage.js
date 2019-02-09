$(function () {
  //clean the text area when click the clean button
  $("#cleanSetting").on("click",function (e) {
    e.preventDefault()
    $("input").val('')
  })

  let fillUp=false;
  //submit the info for login
  $("#settingQ").on("click",function (e) {
    e.preventDefault()
    fillUp=true;
    $(":input").each(function () {
      if ($("input").val().length==""){
        fillUp=false
      }
      if (fillUp==false){
        $(this).trigger(M.toast({html: 'Invalid Setting'}))
      }else {
        $.ajax({
          type:"post",
          url:"need to fill in url here",
          data:$("#securitySettingBox").serialize(),
          success:function () {
            //  need to be implemented
          },
          error:function () {
            //  need to be implemented
          }
        })
      }
    })
    // alert($(":input").length.val())

  })
})