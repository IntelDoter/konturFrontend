"use strict";

$(document).ready(function() {
    var list = $("#variants");
    var input = $("#my_input");

    var cityArray;
    var found;
    var moreCount;
    var prevKey;
    var prevFocusedListElem;
    var numberOfVariants;
    var nextElem;
    var isInputDone = false;

    function isEmpty(el) {
        return !$.trim(el.html())
    }

    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
    }

    function isDone() {
        if (isInputDone) {

        }
    }

    $.ajax({
        url: "./kladr.json",
        async: false,
        dataType: 'json',
        success: function (data) {
            cityArray = data;
        }
    });

    $("#my_input:text").focus(function () {
        if ($(this).val() != "") {
            $(this).select();
        }
    });

    input.on("keyup keydown", function(event) {
        if (event.type == "keydown") {
            switch (event.keyCode) {
                case 38: //up
                    event.preventDefault();
                    if (prevFocusedListElem.prev().is("li")) {
                        prevFocusedListElem.prev().addClass("current");
                        prevFocusedListElem.removeClass("current");
                        prevFocusedListElem = $(".current");
                    } else {
                        nextElem = prevFocusedListElem.parent().children(":last");
                        nextElem.addClass("current");
                        prevFocusedListElem.removeClass("current");
                        prevFocusedListElem = $(".current");
                    }
                    break;
                case 40: //down
                    event.preventDefault();
                    if (prevFocusedListElem.next().is("li")) {
                        prevFocusedListElem.next().addClass("current");
                        prevFocusedListElem.removeClass("current");
                        prevFocusedListElem = $(".current");
                    } else {
                        nextElem = prevFocusedListElem.parent().children(":first");
                        nextElem.addClass("current");
                        prevFocusedListElem.removeClass("current");
                        prevFocusedListElem = $(".current");
                    }
                    break;
                case 13: //enter
                    list.hide();
                    input.val(prevFocusedListElem[0].textContent);
                    isInputDone = true;
                    break;
            }
        }

            if (event.type == "keyup") {
                var key = $(this).val();
                if (key && key != prevKey) {
                    key = capitalize(key);
                    prevKey = key;
                    found = JSON.search(cityArray, '//*[starts-with(City, "' + key + '")]');
                    list.show();

                    if (found.length) {
                        if (!isEmpty(list)) {
                            list.empty();
                        }
                        if (found.length > 5) {
                            numberOfVariants = 5;
                        } else {
                            numberOfVariants = found.length
                        }
                        for (var i = 0; i < numberOfVariants; i++) {
                            list.append("<li>" + found[i].City + "</li>");
                        }
                        list.children(":first").addClass("current");
                        prevFocusedListElem = list.children(":first");
                        if (found.length > numberOfVariants) {
                            list.append("<p class='list_hint'>Показано " + numberOfVariants + " из " + found.length + " вариантов. Уточните запрос, чтобы увидеть остальные</p>")
                        }
                        moreCount = found.length - 4;

                    } else {
                        if (!isEmpty(list)) {
                            list.empty();
                        }
                        list.append("<li class='empty_search'>Не найдено</li>");

                    }

                } else if (key == "") {
                    isInputDone = false;
                    prevKey = key;
                    list.hide();
                }
            }
    });

    list.on('mouseenter', 'li', function () {
        if (prevFocusedListElem) {
            prevFocusedListElem.removeClass("current");
        }
        $(this).addClass("current");
        prevFocusedListElem = $(this);
    });

    list.on('mousedown', 'li', function (event) {
        isInputDone = true;
        var new_value = $(this)[0].textContent;
        input.val(new_value);
        list.hide();
    });

    input.focus(function () {
        if ($(this).val() != "" && !isInputDone) {
            list.show();
        } else if ($(this).val() == "") {
            isInputDone = false;
        }
    });

    input.blur(function () {
        list.hide();

    });


});