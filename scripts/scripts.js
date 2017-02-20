"use strict";

$(document).ready(function() {
    var cityArray;
    var found;
    var moreCount;
    var prevKey;
    var list = $("#variants");
    var input = $("#my_input");
    var prevFocusedListElem;
    var numberOfVariants;

    function isEmpty( el ){
        return !$.trim(el.html())
    }

    function capitalize(s)
    {
        return s[0].toUpperCase() + s.slice(1);
    }

    $.ajax({
        url: "./kladr.json",
        async: false,
        dataType: 'json',
        success: function(data) {
            cityArray = data;
        }
    });

    $("#my_input:text").focus(function() {
        if ($(this).val() != "") {
            $(this).select();
        }
    });

    input.keyup(function(){
        var key = $(this).val();
        if (key && key != prevKey) {
            key = capitalize(key);
            prevKey = key;
            found = JSON.search(cityArray, '//*[starts-with(City, "'+ key +'")]');
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
            prevKey = key;
            list.hide();
        }

    });

    list.on('mouseenter', 'li', function () {
        if (prevFocusedListElem) {
            prevFocusedListElem.removeClass("current");
        }
        $(this).addClass("current");
        prevFocusedListElem = $(this);
    });

    list.on('click', 'li', function () {
        var new_value = $(this)[0].textContent;
        input.val(new_value);
        list.hide();
    });
    if (prevFocusedListElem) {
        $(document).keydown(function (event) {
            switch (event.which) {
                case 38: //up
                    break;
                case 40: //down
                    prevFocusedListElem.next().addClass("current");
                    prevFocusedListElem.removeClass("current");
                    prevFocusedListElem = $(".current");
                    break
            }
        });

    }

});