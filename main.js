"use strict";
$(function () {  
    $("#datetime").datetimepicker({  
        format: 'YYYY-MM-DD',  
        locale: moment.locale('zh-cn')  
    });
    Date.prototype.Format = function(fmt)   
    { //author: meizz   
    var o = {   
        "M+" : this.getMonth()+1,                 //月份   
        "d+" : this.getDate(),                    //日   
        "h+" : this.getHours(),                   //小时   
        "m+" : this.getMinutes(),                 //分   
        "s+" : this.getSeconds(),                 //秒   
        "q+" : Math.floor((this.getMonth()+3)/3), //季度   
        "S"  : this.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(fmt))   
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
    for(var k in o)   
        if(new RegExp("("+ k +")").test(fmt))   
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
    return fmt;   
    }
    var currentDay = new Date().Format("yyyy-MM-dd");
    $("#input_title").val(currentDay);

    /******************* config environment *******************/

    //test net for develop, remove the comment to use test net
    // var dappContactAddress = "n1upTDAHBkapEDKPdjDPXFGhNVjMAsrBjZA";
    // var nebulas = require("nebulas"), Account = Account, neb = new nebulas.Neb();
    // neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

    //main net for deploy, comment out this when develop
    var dappContactAddress = "n1hFxmxUFNgCnQzzz5TV4oVcCtSi7jF1PN7";
    var nebulas = require("nebulas"), Account = Account, neb = new nebulas.Neb();
    neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

    /******************* config environment end *******************/

    var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
    var nebPay = new NebPay();
    var serialNumber;
    $("#search").click(function () {
        if (!$("#datetime").val()) {
            alert('搜索日期不能为空');
            return;
        }
        // $('#content').text("");
        var from = dappContactAddress;
        var value = "0";
        var nonce = "0";
        var gas_price = "1000000";
        var gas_limit = "20000000";
        var callFunction = "get";
        var callArgs = "[\"" + $("#datetime").val() + "\"]";
        //console.log("callFunction:" + callFunction + " callArgs:" + callArgs);
        var contract = {
            "function": callFunction,
            "args": callArgs
        };
        neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
            var result = resp.result;   
            if (result === 'null') {
                $('.search-results').text("今天还没有人记录，来当第一名吧");
                return;
            }
            result = JSON.parse(result);
            console.log(result);
            $(".search-results").css("display", "initial");
            $(".new-memory").css("display", "none");
            $("#itemList").empty();
            var html = '';
            var itemList = result.itemList;
            for(var i = 0, iLen = itemList.length; i < iLen; i++) {
                html += '<li>' +
                        '<p class="item-content">'+ itemList[i].content +'</p>' +
                        '<p class="item-author">作者：'+ itemList[i].author +'</p>' +
                        '</li>';
            }
            $('#itemList').append(html);
        }).catch(function (err) {
            console.log("error :" + err.message);
        })
    });
    $('#post').click(function () {
        if (!$("#input_title").val() || !$("#input_content").val()) {
            alert('时间或者内容不能为空');
            return;
        }
        var to = dappContactAddress;
        var value = "0";
        var callFunction = "save";
        var callArgs = "[\"" + $("#input_title").val() + "\",\"" + $("#input_content").val() + "\"]";
        console.log(callArgs);
        serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: function (resp) {
                console.log("thecallback is " + resp)
            }
        });
    });
    $("#add").click(function () {
        $(".search-results").css("display", "none");
        $(".new-memory").css("display", "initial");
    });
});