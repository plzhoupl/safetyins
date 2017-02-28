$(function(){
    $(".about-all .left-nav li").click(function(){
        $(this).siblings('li').removeClass('active');
        $(this).addClass('active');
        var preid=$(this).attr("id");
        $("[id="+preid+"-box]").addClass('us-box active');
        $("[id="+preid+"-box]").siblings('div').removeClass('active');
    });
})

$(function () {
    $(".register").mouseover(function () {
        $(".hot-call").css("display","block");
    });
    $(".register").mouseleave(function () {
        $(".hot-call").css("display","none");
    });
});

var btn=document.getElementById("cl");
btn.onclick=function(){
    var show=document.getElementById("iconbar");
    if(show.style.display=="block"){
        show.style.display="none";
    }else
    {
        show.style.display="block";
    }
}

function yzm(){
    var arr = ['0','1','2','3','4','5','6','7','8','9'];
    var str = '';
    for(var i = 0 ; i < 4 ; i ++ )
        str += ''+arr[Math.floor(Math.random() * arr.length)];
    return str;
}


