var jQuery_formValidator_initConfig;
(function($) {

$.formValidator =
{
	//各种校验方式支持的控件类型
	sustainType : function(id,setting)
	{
		var elem = $("#"+id).get(0);
		var srcTag = elem.tagName;
		var stype = elem.type;
		switch(setting.validatetype)
		{
			case "InitValidator":
				return true;
			case "InputValidator":
				if (srcTag == "INPUT" || srcTag == "TEXTAREA" || srcTag == "SELECT"){
					return true;
				}else{
					return false;
				}
			case "CompareValidator":
				if (srcTag == "INPUT" || srcTag == "TEXTAREA")
				{
					if (stype == "checkbox" || stype == "radio"){
						return false;
					}else{
						return true;
					}
				}
				return false;
			case "AjaxValidator":
				if (stype == "text" || stype == "textarea" || stype == "file" || stype == "password" || stype == "select-one"){
					return true;
				}else{
					return false;
				}
			case "RegexValidator":
				if (srcTag == "INPUT" || srcTag == "TEXTAREA")
				{
					if (stype == "checkbox" || stype == "radio"){
						return false;
					}else{
						return true;
					}
				}
				return false;
			case "FunctionValidator":
			    return true;
		}
	},

	initConfig : function(controlOptions)
	{
		var settings =
		{
			debug:false,
			validatorgroup : "1",
			alertmessage:false,
			validobjectids:"",
			forcevalid:false,
			onsuccess: function() {return true;},
			onerror:function() {},
			submitonce:false,
			formid:"",
			autotip: false,
			tidymode:false,
			errorfocus:true,
		};
		controlOptions = controlOptions || {};
		$.extend(settings, controlOptions);
		//如果是精简模式，发生错误的时候，第一个错误的控件就不获得焦点
		if(settings.tidymode){settings.errorfocus=false};
		if(settings.formid!=""){
			$("#"+settings.formid).submit(function(){
				resultText = $.formValidator.pageIsValid("1");
				return resultText ;
			}) ;
		};
		if (jQuery_formValidator_initConfig == null ){jQuery_formValidator_initConfig = new Array();}
		jQuery_formValidator_initConfig.push( settings );
	},

	//如果validator对象对应的element对象的validator属性追加要进行的校验。
	appendValid : function(id, setting )
	{
		//如果是各种校验不支持的类型，就不追加到。返回-1表示没有追加成功
		if(!$.formValidator.sustainType(id,setting)) return -1;
		var srcjo = $("#"+id).get(0);
		//重新初始化
		if (setting.validatetype=="InitValidator" || srcjo.settings == undefined ){srcjo.settings = new Array();}
		var len = srcjo.settings.push( setting );
		srcjo.settings[len - 1].index = len - 1;
		return len - 1;
	},

	//如果validator对象对应的element对象的validator属性追加要进行的校验。
	getInitConfig : function( validatorgroup )
	{
		if(jQuery_formValidator_initConfig!=null)
		{
		    for(i=0;i<jQuery_formValidator_initConfig.length;i++)
		    {
		        if(validatorgroup==jQuery_formValidator_initConfig[i].validatorgroup)
				{
					return jQuery_formValidator_initConfig[i];
				}
		    }
		}
		return null;
	},

	//触发每个控件上的各种校验
	triggerValidate : function(returnObj)
	{
		switch(returnObj.setting.validatetype)
		{
			case "InputValidator":
				$.formValidator.inputValid(returnObj);
				break;
			case "CompareValidator":
				$.formValidator.compareValid(returnObj);
				break;
			case "AjaxValidator":
				$.formValidator.ajaxValid(returnObj);
				break;
			case "RegexValidator":
				$.formValidator.regexValid(returnObj);
				break;
			case "FunctionValidator":
				$.formValidator.functionValid(returnObj);
				break;
		}
	},

	//设置显示信息
	setTipState : function(elem,showclass,showmsg)
	{
		var setting0 = elem.settings[0];
		var initConfig = $.formValidator.getInitConfig(setting0.validatorgroup);
	    var tip = $("#"+setting0.tipid);
		if(showmsg==null || showmsg=="")
		{
			tip.hide();
		}
		else
		{
			if(initConfig.tidymode)
			{
				//显示和保存提示信息
				$("#fv_content").html(showmsg);
				elem.Tooltip = showmsg;
				if(showclass!="onError"){tip.hide();}
			}
			tip.removeClass();
			tip.addClass( showclass );
			tip.html( showmsg );
		}
	},

	resetTipState : function(validatorgroup)
	{
		var initConfig = $.formValidator.getInitConfig(validatorgroup);
		$(initConfig.validobjectids).each(function(){
			$.formValidator.setTipState(this,"onShow",this.settings[0].onshow);
		});
	},

	//设置错误的显示信息
	setFailState : function(tipid,showmsg)
	{
	    var tip = $("#"+tipid);
	    tip.removeClass();
	    tip.addClass("onError");
	    tip.html(showmsg);
	},

	//根据单个对象,正确:正确提示,错误:错误提示
	showMessage : function(returnObj)
	{
	    var id = returnObj.id;
		var elem = $("#"+id).get(0);
		var isvalid = returnObj.isvalid;
		var setting = returnObj.setting;//正确:setting[0],错误:对应的setting[i]
		var showmsg = "",showclass = "";
		var settings = $("#"+id).get(0).settings;
		var intiConfig = $.formValidator.getInitConfig(settings[0].validatorgroup);
		if (!isvalid)
		{
			showclass = "onError";
			if(setting.validatetype=="AjaxValidator")
			{
				if(setting.lastValid=="")
				{
				    showclass = "onLoad";
				    showmsg = setting.onwait;
				}
				else
				{
				    showmsg = setting.onerror;
				}
			}
			else
			{
				showmsg = (returnObj.errormsg==""? setting.onerror : returnObj.errormsg);

			}
			if(intiConfig.alertmessage)
			{
				var elem = $("#"+id).get(0);
				if(elem.validoldvalue!=$(elem).val()){alert(showmsg);}
			}
			else
			{
				$.formValidator.setTipState(elem,showclass,showmsg);
			}
		}
		else
		{
			//验证成功后,如果没有设置成功提示信息,则给出默认提示,否则给出自定义提示;允许为空,值为空的提示
			showmsg = $.formValidator.isEmpty(id) ? setting.onempty : setting.oncorrect;
			$.formValidator.setTipState(elem,"onCorrect",showmsg);
		}
		return showmsg;
	},

	showAjaxMessage : function(returnObj)
	{
		var setting = returnObj.setting;
		var elem = $("#"+returnObj.id).get(0);
		if(elem.validoldvalue!=$(elem).val())
		{
			$.formValidator.ajaxValid(returnObj);
		}
		else
		{
			if(setting.isvalid!=undefined && !setting.isvalid){
				elem.lastshowclass = "onError";
				elem.lastshowmsg = setting.onerror;
			}
			$.formValidator.setTipState(elem,elem.lastshowclass,elem.lastshowmsg);
		}
	},

	//获取指定字符串的长度
    getLength : function(id)
    {
        var srcjo = $("#"+id);
		var elem = srcjo.get(0);
        sType = elem.type;
        var len = 0;
        switch(sType)
		{
			case "text":
			case "hidden":
			case "password":
			case "textarea":
			case "file":
		        var val = srcjo.val();
				var initConfig = $.formValidator.getInitConfig(elem.settings[0].validatorgroup);
				if (initConfig.wideword)
				{
					for (var i = 0; i < val.length; i++)
					{
						if (val.charCodeAt(i) >= 0x4e00 && val.charCodeAt(i) <= 0x9fa5){
							len += 2;
						}else {
							len++;
						}
					}
				}
				else{
					len = val.length;
				}
		        break;
			case "checkbox":
			case "radio":
				len = $("input[type='"+sType+"'][name='"+srcjo.attr("name")+"']:checked").length;
				break;
		    case "select-one":
		        len = elem.options ? elem.options.selectedIndex : -1;
				break;
			case "select-multiple":
				len = $("select[name="+elem.name+"] option:selected").length;
				break;
	    }
		return len;
    },

	//结合empty这个属性，判断仅仅是否为空的校验情况。
    isEmpty : function(id)
    {
        if($("#"+id).get(0).settings[0].empty && $.formValidator.getLength(id)==0){
            return true;
        }else{
            return false;
		}
    },

	//对外调用：判断单个表单元素是否验证通过，不带回调函数
    isOneValid : function(id)
    {
	    return $.formValidator.oneIsValid(id,1).isvalid;
    },

	//验证单个是否验证通过,正确返回settings[0],错误返回对应的settings[i]
	oneIsValid : function (id,index)
	{
		var returnObj = new Object();
		returnObj.id = id;
		returnObj.ajax = -1;
		returnObj.errormsg = "";       //自定义错误信息
		var elem = $("#"+id).get(0);
	    var settings = elem.settings;
	    var settingslen = settings.length;
		//只有一个formValidator的时候不检验
		if (settingslen==1){settings[0].bind=false;}
		if(!settings[0].bind){return null;}
		for ( var i = 0 ; i < settingslen ; i ++ )
		{
			if(i==0){
				if($.formValidator.isEmpty(id)){
					returnObj.isvalid = true;
					returnObj.setting = settings[0];
					break;
				}
				continue;
			}
			returnObj.setting = settings[i];
			if(settings[i].validatetype!="AjaxValidator") {
				$.formValidator.triggerValidate(returnObj);
			}else{
				returnObj.ajax = i;
			}
			if(!settings[i].isvalid) {
				returnObj.isvalid = false;
				returnObj.setting = settings[i];
				break;
			}else{
				returnObj.isvalid = true;
				returnObj.setting = settings[0];
				if(settings[i].validatetype=="AjaxValidator") break;
			}
		}
		return returnObj;
	},

	//验证所有需要验证的对象，并返回是否验证成功。
	pageIsValid : function (validatorgroup)
	{
	    if(validatorgroup == null || validatorgroup == undefined){validatorgroup = "1"};
		var isvalid = true;
		var thefirstid = "",thefirsterrmsg;
		var returnObj,setting;
		var error_tip = "^";

		var initConfig = $.formValidator.getInitConfig(validatorgroup);
		var jqObjs = $(initConfig.validobjectids);
		jqObjs.each(function(i,elem)
		{
			if(elem.settings[0].bind){
				returnObj = $.formValidator.oneIsValid(elem.id,1);
				if(returnObj)
				{
					var tipid = elem.settings[0].tipid;
					//校验失败,获取第一个发生错误的信息和ID
					if (!returnObj.isvalid) {
						isvalid = false;
						if (thefirstid == ""){
							thefirstid = returnObj.id;
							thefirsterrmsg = (returnObj.errormsg==""?returnObj.setting.onerror:returnObj.errormsg)
						}
					}
					//为了解决使用同个TIP提示问题:后面的成功或失败都不覆盖前面的失败
					if (!initConfig.alertmessage){
						if (error_tip.indexOf("^" + tipid + "^") == -1) {
							if (!returnObj.isvalid) {
								error_tip = error_tip + tipid + "^";
							}
							$.formValidator.showMessage(returnObj);
						}
					}
				}
			}
		});
		//成功或失败后，进行回调函数的处理，以及成功后的灰掉提交按钮的功能
		if(isvalid)
		{
            isvalid = initConfig.onsuccess();
			if(initConfig.submitonce){$(":submit").attr("disabled",true);}
		}
		else
		{
			var obj = $("#"+thefirstid).get(0);
			initConfig.onerror(thefirsterrmsg,obj);
			if(thefirstid!="" && initConfig.errorfocus){$("#"+thefirstid).focus();}
		}
		return !initConfig.debug && isvalid;
	},

	//ajax校验
	ajaxValid : function(returnObj)
	{
		var id = returnObj.id;
	    var srcjo = $("#"+id);
		var elem = srcjo.get(0);
		var settings = elem.settings;
		var setting = settings[returnObj.ajax];
		var ls_url = setting.url;
	    if (srcjo.size() == 0 && settings[0].empty) {
			returnObj.setting = settings[0];
			returnObj.isvalid = true;
			$.formValidator.showMessage(returnObj);
			setting.isvalid = true;
			return;
		}
		if(setting.addidvalue)
		{
			var parm = "clientid="+id+"&"+id+"="+encodeURIComponent(srcjo.val());
			ls_url = ls_url + (ls_url.indexOf("?")>0?("&"+ parm) : ("?"+parm));
		}
		$.ajax(
		{
			mode : "abort",
			type : setting.type,
			url : ls_url,
			cache : setting.cache,
			data : setting.data,
			async : setting.async,
			dataType : setting.datatype,
			success : function(data){
			    if(setting.success(data))
			    {
			        $.formValidator.setTipState(elem,"onCorrect",settings[0].oncorrect);
			        setting.isvalid = true;
			    }
			    else
			    {
			        $.formValidator.setTipState(elem,"onError",setting.onerror);
			        setting.isvalid = false;
			    }
			},
			complete : function(){
				if(setting.buttons && setting.buttons.length > 0){setting.buttons.attr({"disabled":false})};
				setting.complete;
			},
			beforeSend : function(xhr){
				//再服务器没有返回数据之前，先回调提交按钮
				if(setting.buttons && setting.buttons.length > 0){setting.buttons.attr({"disabled":true})};
				var isvalid = setting.beforesend(xhr);
				if(isvalid)
				{
					setting.isvalid = false;		//如果前面ajax请求成功了，再次请求之前先当作错误处理
					$.formValidator.setTipState(elem,"onLoad",settings[returnObj.ajax].onwait);
				}
				setting.lastValid = "-1";
				return isvalid;
			},
			error : function(){
			    $.formValidator.setTipState(elem,"onError",setting.onerror);
			    setting.isvalid = false;
				setting.error();
			},
			processData : setting.processdata
		});
	},

	//对正则表达式进行校验（目前只针对input和textarea）
	regexValid : function(returnObj)
	{
		var id = returnObj.id;
		var setting = returnObj.setting;
		var srcTag = $("#"+id).get(0).tagName;
		var elem = $("#"+id).get(0);
		//如果有输入正则表达式，就进行表达式校验
		if(elem.settings[0].empty && elem.value==""){
			setting.isvalid = true;
		}
		else
		{
			var regexpress = setting.regexp;
			if(setting.datatype=="enum"){regexpress = eval("regexEnum."+regexpress);}
			if(regexpress==undefined || regexpress==""){
				setting.isvalid = false;
				return;
			}
			setting.isvalid = (new RegExp(regexpress, setting.param)).test($("#"+id).val());
		}
	},

	//函数校验。返回true/false表示校验是否成功;返回字符串表示错误信息，校验失败;如果没有返回值表示处理函数，校验成功
	functionValid : function(returnObj)
	{
		var id = returnObj.id;
		var setting = returnObj.setting;
	    var srcjo = $("#"+id);
		var lb_ret = setting.fun(srcjo.val(),srcjo.get(0));
		if(lb_ret != undefined)
		{
			if(typeof lb_ret == "string"){
				setting.isvalid = false;
				returnObj.errormsg = lb_ret;
			}else{
				setting.isvalid = lb_ret;
			}
		}
	},

	//对input和select类型控件进行校验
	inputValid : function(returnObj)
	{
		var id = returnObj.id;
		var setting = returnObj.setting;
		var srcjo = $("#"+id);
		var elem = srcjo.get(0);
		var val = srcjo.val();
		var sType = elem.type;
		var len = $.formValidator.getLength(id);
		var empty = setting.empty,emptyerror = false;
		switch(sType)
		{
			case "text":
			case "hidden":
			case "password":
			case "textarea":
			case "file":
				if (setting.type == "size") {
					empty = setting.empty;
					if(!empty.leftempty){
						emptyerror = (val.replace(/^[ \s]+/, '').length != val.length);
					}
					if(!emptyerror && !empty.rightempty){
						emptyerror = (val.replace(/[ \s]+$/, '').length != val.length);
					}
					if(emptyerror && empty.emptyerror){returnObj.errormsg= empty.emptyerror}
				}
			case "checkbox":
			case "select-one":
			case "select-multiple":
			case "radio":
				var lb_go_on = false;
				if(sType=="select-one" || sType=="select-multiple"){setting.type = "size";}
				var type = setting.type;
				if (type == "size") {		//获得输入的字符长度，并进行校验
					if(!emptyerror){lb_go_on = true}
					if(lb_go_on){val = len}
				}
				else if (type =="date" || type =="datetime")
				{
					var isok = false;
					if(type=="date"){lb_go_on = isDate(val)};
					if(type=="datetime"){lb_go_on = isDate(val)};
					if(lb_go_on){val = new Date(val);setting.min=new Date(setting.min);setting.max=new Date(setting.max);};
				}else{
					stype = (typeof setting.min);
					if(stype =="number")
					{
						val = (new Number(val)).valueOf();
						if(!isNaN(val)){lb_go_on = true;}
					}
					if(stype =="string"){lb_go_on = true;}
				}
				setting.isvalid = false;
				if(lb_go_on)
				{
					if(val < setting.min || val > setting.max){
						if(val < setting.min && setting.onerrormin){
							returnObj.errormsg= setting.onerrormin;
						}
						if(val > setting.min && setting.onerrormax){
							returnObj.errormsg= setting.onerrormax;
						}
					}
					else{
						setting.isvalid = true;
					}
				}
				break;
		}
	},

	compareValid : function(returnObj)
	{
		var id = returnObj.id;
		var setting = returnObj.setting;
		var srcjo = $("#"+id);
	    var desjo = $("#"+setting.desid );
		var ls_datatype = setting.datatype;
	    setting.isvalid = false;
		curvalue = srcjo.val();
		ls_data = desjo.val();
		if(ls_datatype=="number")
        {
            if(!isNaN(curvalue) && !isNaN(ls_data)){
				curvalue = parseFloat(curvalue);
                ls_data = parseFloat(ls_data);
			}
			else{
			    return;
			}
        }
		if(ls_datatype=="date" || ls_datatype=="datetime")
		{
			var isok = false;
			if(ls_datatype=="date"){isok = (isDate(curvalue) && isDate(ls_data))};
			if(ls_datatype=="datetime"){isok = (isDateTime(curvalue) && isDateTime(ls_data))};
			if(isok){
				curvalue = new Date(curvalue);
				ls_data = new Date(ls_data)
			}
			else{
				return;
			}
		}

	    switch(setting.operateor)
	    {
	        case "=":
	            if(curvalue == ls_data){setting.isvalid = true;}
	            break;
	        case "!=":
	            if(curvalue != ls_data){setting.isvalid = true;}
	            break;
	        case ">":
	            if(curvalue > ls_data){setting.isvalid = true;}
	            break;
	        case ">=":
	            if(curvalue >= ls_data){setting.isvalid = true;}
	            break;
	        case "<":
	            if(curvalue < ls_data){setting.isvalid = true;}
	            break;
	        case "<=":
	            if(curvalue <= ls_data){setting.isvalid = true;}
	            break;
	    }
	},

	localTooltip : function(e)
	{
		e = e || window.event;
		var mouseX = e.pageX || (e.clientX ? e.clientX + document.body.scrollLeft : 0);
		var mouseY = e.pageY || (e.clientY ? e.clientY + document.body.scrollTop : 0);
		$("#fvtt").css({"top":(mouseY+2)+"px","left":(mouseX-40)+"px"});
	}
};

//每个校验控件必须初始化的
$.fn.formValidator = function(cs)
{
	var setting =
	{
		validatorgroup : "1",
		empty :false,
		submitonce : false,
		automodify : false,
		onshow :"请输入内容",
		onfocus: "请输入内容",
		oncorrect: "输入正确",
		onempty: "输入内容为空",
		defaultvalue : null,
		bind : true,
		validatetype : "InitValidator",
		tipcss :
		{
			"left" : "10px",
			"top" : "1px",
			"height" : "20px",
			"width":"250px"
		},
		triggerevent:"blur",
		forcevalid : false
	};

	//获取该校验组的全局配置信息
	cs = cs || {};
	if(cs.validatorgroup == undefined){cs.validatorgroup = "1"};
	var initConfig = $.formValidator.getInitConfig(cs.validatorgroup);

	//如果为精简模式，tipcss要重新设置初始值
	if(initConfig.tidymode){setting.tipcss = {"left" : "2px","width":"22px","height":"22px","display":"none"}};

	//先合并整个配置(深度拷贝)
	$.extend(true,setting, cs);

	return this.each(function(e)
	{
		var jqobj = $(this);
		var setting_temp = {};
		$.extend(true,setting_temp, setting);
		var tip = setting_temp.tipid ? setting_temp.tipid : this.id+"Tip";
		//自动形成TIP
		if(initConfig.autotip)
		{
			//获取层的ID、相对定位控件的ID和坐标
			if($("body [id="+tip+"]").length==0)
			{
				aftertip = setting_temp.relativeid ? setting_temp.relativeid : this.id;
				var obj = getTopLeft(aftertip);
				var y = obj.top;
				var x = getElementWidth(aftertip) + obj.left;
				$("<div class='formValidateTip'></div>").appendTo($("body")).css({left: x+"px", top: y+"px"}).prepend($('<div id="'+tip+'"></div>').css(setting_temp.tipcss));
			}
			if(initConfig.tidymode){jqobj.showTooltips()};
		}

		//每个控件都要保存这个配置信息
		setting.tipid = tip;
		$.formValidator.appendValid(this.id,setting);

		//保存控件ID
		var validobjectids = initConfig.validobjectids;
		if(validobjectids.indexOf("#"+this.id+" ")==-1){
			initConfig.validobjectids = (validobjectids=="" ? "#"+this.id : validobjectids + ",#" + this.id);
		}

		//初始化显示信息
		if(!initConfig.alertmessage){
			$.formValidator.setTipState(this,"onShow",setting.onshow);
		}

		var srcTag = this.tagName.toLowerCase();
		var stype = this.type;
		var defaultval = setting.defaultvalue;
		//处理默认值
		if(defaultval){
			jqobj.val(defaultval);
		}

		if(srcTag == "input" || srcTag=="textarea")
		{

			//注册获得焦点的事件。改变提示对象的文字和样式，保存原值
			jqobj.focus(function()
			{
				if(!initConfig.alertmessage){
					//保存原来的状态
					var tipjq = $("#"+tip);
					this.lastshowclass = tipjq.attr("class");
					this.lastshowmsg = tipjq.html();
					$.formValidator.setTipState(this,"onFocus",setting.onfocus);
				}
				if (stype == "password" || stype == "text" || stype == "textarea" || stype == "file") {
					this.validoldvalue = jqobj.val();
				}
			});
			//注册失去焦点的事件。进行校验，改变提示对象的文字和样式；出错就提示处理
			jqobj.bind(setting.triggerevent, function(){
				var settings = this.settings;
				var returnObj = $.formValidator.oneIsValid(this.id,1);
				if(returnObj==null){return;}
				if(returnObj.ajax >= 0)
				{
					$.formValidator.showAjaxMessage(returnObj);
				}
				else
				{
					var showmsg = $.formValidator.showMessage(returnObj);
					if(!returnObj.isvalid)
					{
						//自动修正错误
						var auto = setting.automodify && (this.type=="text" || this.type=="textarea" || this.type=="file");
						if(auto && !initConfig.alertmessage)
						{
							alert(showmsg);
							$.formValidator.setTipState(this,"onShow",setting.onshow);
						}
						else
						{
							if(initConfig.forcevalid || setting.forcevalid){
								alert(showmsg);this.focus();
							}
						}
					}
				}
			});



		}
		else if (srcTag == "select")
		{
			//获得焦点
			jqobj.bind("focus", function(){
				if(!initConfig.alertmessage){
					$.formValidator.setTipState(this,"onFocus",setting.onfocus);
				}
			});
			//失去焦点
			jqobj.bind("blur",function(){jqobj.trigger("change")});
			//选择项目后触发
			jqobj.bind("change",function()
			{
				var returnObj = $.formValidator.oneIsValid(this.id,1);
				if(returnObj==null){return;}
				if ( returnObj.ajax >= 0){
					$.formValidator.showAjaxMessage(returnObj);
				}else{
					$.formValidator.showMessage(returnObj);
				}
			});
		}
	});
};

$.fn.inputValidator = function(controlOptions)
{
	var settings =
	{
		isvalid : false,
		min : 0,
		max : 99999999999999,
		type : "size",
		onerror:"输入错误",
		validatetype:"InputValidator",
		empty:{leftempty:true,rightempty:true,leftemptyerror:null,rightemptyerror:null},
		wideword:true
	};
	controlOptions = controlOptions || {};
	$.extend(true, settings, controlOptions);
	return this.each(function(){
		$.formValidator.appendValid(this.id,settings);
	});
};

$.fn.compareValidator = function(controlOptions)
{
	var settings =
	{
		isvalid : false,
		desid : "",
		operateor :"=",
		onerror:"输入错误",
		validatetype:"CompareValidator"
	};
	controlOptions = controlOptions || {};
	$.extend(true, settings, controlOptions);
	return this.each(function(){
		$.formValidator.appendValid(this.id,settings);
	});
};

$.fn.regexValidator = function(controlOptions)
{
	var settings =
	{
		isvalid : false,
		regexp : "",
		param : "i",
		datatype : "string",
		onerror:"输入的格式不正确",
		validatetype:"RegexValidator"
	};
	controlOptions = controlOptions || {};
	$.extend(true, settings, controlOptions);
	return this.each(function(){
		$.formValidator.appendValid(this.id,settings);
	});
};

$.fn.functionValidator = function(controlOptions)
{
	var settings =
	{
		isvalid : true,
		fun : function(){this.isvalid = true;},
		validatetype:"FunctionValidator",
		onerror:"输入错误"
	};
	controlOptions = controlOptions || {};
	$.extend(true, settings, controlOptions);
	return this.each(function(){
		$.formValidator.appendValid(this.id,settings);
	});
};

$.fn.ajaxValidator = function(controlOptions)
{
	var settings =
	{
		isvalid : false,
		lastValid : "",
		type : "GET",
		url : "",
		addidvalue : true,
		datatype : "html",
		data : "",
		async : true,
		cache : false,
		beforesend : function(){return true;},
		success : function(){return true;},
		complete : function(){},
		processdata : false,
		error : function(){},
		buttons : null,
		onerror:"服务器校验没有通过",
		onwait:"正在等待服务器返回数据",
		validatetype:"AjaxValidator"
	};
	controlOptions = controlOptions || {};
	$.extend(true, settings, controlOptions);
	return this.each(function()
	{
		$.formValidator.appendValid(this.id,settings);
	});
};

$.fn.defaultPassed = function(onshow)
{
	return this.each(function()
	{
		var settings = this.settings;
		for ( var i = 1 ; i < settings.length ; i ++ )
		{
			settings[i].isvalid = true;
			if(!$.formValidator.getInitConfig(settings[0].validatorgroup).alertmessage){
				var ls_style = onshow ? "onShow" : "onCorrect";
				$.formValidator.setTipState(this,ls_style,settings[0].oncorrect);
			}
		}
	});
};

$.fn.unFormValidator = function(unbind)
{
	return this.each(function()
	{
		this.settings[0].bind = !unbind;
		if(unbind){
			$("#"+this.settings[0].tipid).hide();
		}else{
			$("#"+this.settings[0].tipid).show();
		}
	});
};

$.fn.showTooltips = function()
{
	if($("body [id=fvtt]").length==0){
		fvtt = $("<div id='fvtt' style='position:absolute;z-index:56002'></div>");
		$("body").append(fvtt);
		fvtt.before("<iframe src='about:blank' class='fv_iframe' scrolling='no' frameborder='0'></iframe>");

	}
	return this.each(function()
	{
		jqobj = $(this);
		s = $("<span class='top' id=fv_content style='display:block'></span>");
		b = $("<b class='bottom' style='display:block' />");
		this.tooltip = $("<span class='fv_tooltip' style='display:block'></span>").append(s).append(b).css({"filter":"alpha(opacity:95)","KHTMLOpacity":"0.95","MozOpacity":"0.95","opacity":"0.95"});
		//注册事件
		jqobj.mouseover(function(e){
			$("#fvtt").append(this.tooltip);
			$("#fv_content").html(this.Tooltip);
			$.formValidator.localTooltip(e);
		});
		jqobj.mouseout(function(){
			$("#fvtt").empty();
		});
		jqobj.mousemove(function(e){
			$("#fv_content").html(this.Tooltip);
			$.formValidator.localTooltip(e);
		});
	});
}

})(jQuery);

function getElementWidth(objectId) {
	x = document.getElementById(objectId);
	return x.offsetWidth;
}

function getTopLeft(objectId) {
	obj = new Object();
	o = document.getElementById(objectId);
	oLeft = o.offsetLeft;
	oTop = o.offsetTop;
	while(o.offsetParent!=null) {
		oParent = o.offsetParent;
		oLeft += oParent.offsetLeft;
		oTop += oParent.offsetTop;
		o = oParent;
	}
	obj.top = oTop;
	obj.left = oLeft;
	return obj;
}



$(document).ready(function(){
	$.formValidator.initConfig({formid:"regform",onsuccess:function(){
		return true;} ,onerror:function(){alert("校验没有通过，具体错误请看错误提示");}});

	$.formValidator.initConfig({formid:"regform",validatorgroup:"2" ,onsuccess:function(){
		return true;} ,onerror:function(){alert("校验没有通过，具体错误请看错误提示");}});

	$.formValidator.initConfig({formid:"regform",validatorgroup:"3" ,onsuccess:function(){
		return true;} ,onerror:function(){alert("校验没有通过，具体错误请看错误提示");}});

	$.formValidator.initConfig({formid:"regform",validatorgroup:"4" ,onsuccess:function(){
		return true;} ,onerror:function(){alert("校验没有通过，具体错误请看错误提示");}});

	// 第一校验组：同一校验组
	$("#travelAgencyName").formValidator({tipid:"travelAgencyNameText",validatorgroup:"1",onshow:"请输入被保险企业名称",oncorrect:"企业名称正确"}).inputValidator({min:2,max:100,onerror:"请确定输入的字符数在两个到一百个之间"});
	$("#contactName").formValidator({tipid:"contactNameText",validatorgroup:"1",onshow:"请输入联系人",oncorrect:"联系人输入正确"}).inputValidator({min:2,max:30,onerror:"请确定输入的字符数在两个到三十个之间"});
	$("#contactAddress").formValidator({tipid:"contactAddressText",validatorgroup:"1",onshow:"请输入联系人详细地址",oncorrect:"通讯地址输入正确"}).inputValidator({min:2,max:100,onerror:"请确定输入的字符数在两个到一百个之间"});
	$("#contactCellPhone").formValidator({tipid:"contactCellPhoneText",validatorgroup:"1",onshow:"请输入企业联系人电话",onfocus:"手机号码必须为十一位",oncorrect:"谢谢您的合作"}).inputValidator({min:11,max:11,onerror:"手机号码必须是11位的,请确认"});
	$("#password").formValidator({tipid:"passwordText",validatorgroup:"1",onshow:"请输入密码",onfocus:"密码不能为空",oncorrect:"密码合法"}).inputValidator({min:6,max:12,empty:{leftempty:false,rightempty:false,emptyerror:"密码两边不能有空符号"},onerror:"密码不能为空且长度必须在6到12个字符之间,请确认"});
	$("#confirmPassword").formValidator({tipid:"confirmPasswordText",validatorgroup:"1",onshow:"请输入重复密码",onfocus:"两次密码必须一致哦",oncorrect:"密码一致"}).inputValidator({min:6,max:12,empty:{leftempty:false,rightempty:false,emptyerror:"重复密码两边不能有空符号"},onerror:"请重新确认密码"}).compareValidator({desid:"password",operateor:"=",onerror:"2次密码不一致,请确认"});
	$("#contactTelephone").formValidator({tipid:"contactTelephoneText",validatorgroup:"1",onshow:"请输入联系人固定电话/如无固定电话，请填写移动电话联系方式",onfocus:"例如：010-88888888或省略区号88888888或13*********",oncorrect:"谢谢您的合作，联系人电话格式正确"}).regexValidator({regexp:"telAndMob2",datatype:"enum",onerror:"联系人电话格式不正确"});
	$("#s_province").formValidator({tipid:"unitText",validatorgroup:"1",onshow:"选择地区，输入被保险人的详细地址"}).inputValidator({min:1, onerror:"地区不允许为空"}) ;
	$("#s_city").formValidator({tipid:"unitText",validatorgroup:"1",onshow:"选择地区，输入被保险人的详细地址"}).inputValidator({min:1, onerror:"地区不允许为空"}) ;
	$("#s_county").formValidator({tipid:"unitText",validatorgroup:"1",onshow:"选择地区，输入被保险人的详细地址"}).inputValidator({min:1, onerror:"地区不允许为空"}) ;
	$("#contactEmail").formValidator({tipid:"contactEmailText",validatorgroup:"1",onshow:"请输入企业联系人邮箱",onfocus:"请注意你输入的邮箱格式，例如:example@sina.com",oncorrect:"谢谢您的合作，你的邮箱格式正确"}).regexValidator({regexp:"email2",datatype:"enum",onerror:"邮箱格式不正确"}) ;
	$("#contactPostCode").formValidator({tipid:"contactPostCodeText",validatorgroup:"1",onshow:"请输入验证码",onfocus:"4位数字组成的哦",oncorrect:"谢谢您的合作，您的邮编正确"}).regexValidator({regexp:"zipcode2",datatype:"enum",onerror:"邮编格式不正确"});
	$("#postCode").formValidator({tipid:"postCodeText",validatorgroup:"1",onshow:"请输入邮编",onfocus:"6位数字组成的哦",oncorrect:"谢谢您的合作，你的邮编正确"}).regexValidator({regexp:"zipcode2",datatype:"enum",onerror:"邮编格式不正确"});
	$("#registeredAddress").formValidator({tipid:"registeredAddressText",validatorgroup:"1",onshow:"不需要重复填写省/市/区",oncorrect:"谢谢您的合作"}).inputValidator({min:1, onerror:"地区不允许为空"}).functionValidator({fun:checkU});
	$("#businessScope").formValidator({tipid:"businessScopeText",validatorgroup:"1",onshow:"请输入经营范围",oncorrect:"输入正确"}).inputValidator({min:0,max:20,onerror:"请确定输入的字符数在两个到二十个之间"});

	// 第二校验组：
	$("#organizationCodeSF").formValidator({tipid:"organizationCodeSFText",validatorgroup:"2",onshow:"请输入身份证代码",oncorrect:"身份证代码输入正确"}).inputValidator({min:18,max:18,onerror:"请确定输入的字符数是十八个字符"});
	$("#organizationSFLicence").formValidator({tipid:"organizationLicenceSFText",validatorgroup:"2",onshow:"请上传个人身份证扫描件",onfocus:"请上传身份证扫描件！",oncorrect:"谢谢您的合作"}).inputValidator({min:1,onerror:"请上传身份证扫描件"}) ;

	// 第三校验组：
	$("#organizationCode").formValidator({tipid:"organizationCodeText",validatorgroup:"3",onshow:"请填写投保人组织机构代码",oncorrect:"组织机构代码输入正确"}).inputValidator({min:9,max:18,onerror:"请确定输入的字符数是九到十八个字符"});
	$("#organizationLicence").formValidator({tipid:"organizationCodelicenceText",validatorgroup:"3",onshow:"请上传加章的组织机构代码证影印件",oncorrect:"组织机构代码输入正确"}).inputValidator({min:1,onerror:"请上传加章的组织机构代码证影印件"});
	$("#businessLicence").formValidator({tipid:"businessLicenceText",validatorgroup:"3",onshow:"请上传加章的个营业执照影印件",oncorrect:"组织机构代码输入正确"}).inputValidator({min:9,max:18,onerror:"请上传加章的个营业执照影印件"});

	// 第四校验组：
	$("#businessCode").formValidator({tipid:"businessCodeText",validatorgroup:"4",onshow:"请输入投保人营业执照号码",onfocus:"请输入投保人营业执照号码",oncorrect:"谢谢您的合作，你的营业执照号码格式正确"}).inputValidator({min:1,onerror:"营业执照号码格式不正确"}) ;

});

function checkU() {
	var pr=$("#s_province").val();
	var ci=$("#s_city").val();
	var co=$("#s_county").val();
	var pco=pr+ci+co;

	var rg=$("#registeredAddress").trimTextAll();

	if (rg.indexOf(pco)!=-1) {
		return false;
	}else {
		return true;
	}

}

var regexEnum ={}

$.fn.trimTextAll = function() {

	if ($(this).val()) {
		$(this).val($.trim($(this).val()).replace(/\s{2,}/g, ' '));
	}
	return $(this).val();
};




var resultText = false ;
$(document).ready(function(){
//            loadChinaUnitBeNull();
	//输入营业执照号自动填入用户名
	$("#businessCode").bind('blur',function(){
		$("#loginName").val($("#businessCode").val()) ;
	});

	//输入身份证号自动填入用户名
	$("#organizationCodeSF").bind('blur',function(){
		$("#loginName").val($("#organizationCodeSF").val()) ;
	});

	//当注册事业单位时,输入组织机构代码自动填入用户名
	$("#organizationCode").bind('blur',function(){

		var orgNature = $("input:[name='orgNature']:checked").val();
		if(orgNature == 2){
			$("#loginName").val($("#organizationCode").val()) ;
		}
	});

	$("#tij").click(function () {
			resultText = jQuery.formValidator.pageIsValid("1");
			if (resultText) {
				var orgNature = $("input:[name='orgNature']:checked").val();
				var pageResult;
				if(orgNature == 1){
					pageResult = jQuery.formValidator.pageIsValid("4");
				}
				if(orgNature == 2){
					pageResult = jQuery.formValidator.pageIsValid("3");
				}
				if(orgNature == 7){
					pageResult = jQuery.formValidator.pageIsValid("2");
				}
			} else {
				$(this).attr("disabled", false);
			}
	});
});
function openDoc1(){
	window.open('doc/f.doc');
}