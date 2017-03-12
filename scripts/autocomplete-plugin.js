(function($) {
    $.fn.autocomplete = function(data, options) {

        options = $.extend({
            type: "without arrow",
            favorites: false
        }, options);

        var make = function(){
            var input = $(this);

            input.after("<ul class='autocomplete__option-list'></ul>");
            var list = input.next(".autocomplete__option-list");

            if (options.type == "with arrow") {
                input.after("<img class='autocomplete__icon' src='./img/arrow-down.svg' width='6px' height='6px' />");
                list.addClass("option-list_with-arrow");
            } else {
                list.addClass("option-list_without-arrow");
            }

            var found = [];
            var moreCount;
            var prevKey;
            var currentListElem;
            var numberOfVariants;
            var numberInDataArr;
            var isInputDone = false;
            var empty = true;
            var isInputStarted = false;
            var currentScroll = 0;

            if (options.type == "with arrow") {
                var listItemHeight = 27;
                var originalHeight = list.height();
            }

            function isEmpty() {
                return !$.trim(list.html())
            }

            function capitalize(s) {
                return s[0].toUpperCase() + s.slice(1);
            }

            if (options.favorites) {
                var favoritesArr = [
                    {
                        "Id": 4980,
                        "City": "Екатеринбург"
                    },
                    {
                        "Id": 4948,
                        "City": "Саратов"
                    },
                    {
                        "Id": 2428,
                        "City": "Астрахань"
                    }
                ]
            }

            list.on( 'mousewheel DOMMouseScroll', function (e) {
                var e0 = e.originalEvent;
                var delta = e0.wheelDelta || -e0.detail;

                this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
                e.preventDefault();
            });

            input.focus(function () {
                if ($(this).val() != "") {
                    $(this).select();
                }

                if ($(this).hasClass("autocomplete-input_invalid")) {
                    $(this).removeClass("autocomplete-input_invalid");
                    $(this).next(".autocomplete__invalid-text").remove();
                }

                if (options.type == "with arrow") {

                    if (empty || isInputDone) {
                        list.empty();
                        if (options.favorites) {
                            for (var k = 0; k < favoritesArr.length; k++) {
                                list.append("<li class='autocomplete__list-item'>" + favoritesArr[k].City + "</li>");
                            }
                            list.append("<div class='autocomplete__option-list-separator'></div>");
                        }

                        for (var i = 0; i < data.length; i++) {
                            list.append("<li class='autocomplete__list-item'>" + data[i].City + "</li>");
                        }
                    }

                    if (numberInDataArr) {
                        if (options.favorites) {
                            numberInDataArr += options.favorites.length + 1;
                            currentScroll = listItemHeight * numberInDataArr - listItemHeight * options.favorites.length;
                        } else {
                            currentScroll = listItemHeight * numberInDataArr;
                        }
                        list.scrollTop(currentScroll);
                        list.children().eq(numberInDataArr).addClass("option-list_current");
                    }

                    list.show();
                    if (currentScroll) {
                        list.scrollTop(currentScroll);
                    }

                    if (list.height() != originalHeight) {
                        list.height(originalHeight);
                    }

                } else {

                    if (options.favorites && isEmpty()) {
                        list.append("<p class='autocomplete__list-hint list-hint_top'>Популярные города</p>");
                        for (var j = 0; j < favoritesArr.length; j++) {
                            list.append("<li class='autocomplete__list-item'>" + favoritesArr[j].City + "</li>");
                        }
                    }

                    if ((options.favorites || $(this).val() != "") && !isInputDone) {
                        list.show();
                    }

                }
            });

            input.blur(function () {
                if (found.length == 1) {
                    isInputDone = true;
                    prevKey = found[0].City;
                    input.val(prevKey);
                    found = [];
                } else if (!isInputDone) {
                    $(this).addClass("autocomplete-input_invalid");
                    $(this).after("<div class='autocomplete__invalid-text'>Выберите значение из списка</div>");
                }
                list.hide();
            });

            input.on("keyup keydown", function(event) {
                if (event.type == "keydown") {
                    switch (event.keyCode) {
                        case 38: //up
                            event.preventDefault();
                            if (currentListElem.prev().is("li")) {
                                currentListElem.removeClass("option-list_current");
                                currentListElem.prev().addClass("option-list_current");
                                currentListElem = currentListElem.prev();

                                if (currentListElem.position().top < 0) {
                                    currentScroll += Math.ceil(currentListElem.position().top);
                                    list.scrollTop(currentScroll);
                                    currentScroll = list.scrollTop();
                                }

                            }
                            break;

                        case 40: //down
                            event.preventDefault();
                            if (currentListElem.next().is("li")) {
                                currentListElem.removeClass("option-list_current");
                                currentListElem.next().addClass("option-list_current");
                                currentListElem = currentListElem.next();

                                if (currentListElem.position().top + currentListElem.height() > list.height()) {
                                    currentScroll += Math.ceil(currentListElem.position().top + currentListElem.height() - list.height());
                                    list.scrollTop(currentScroll);
                                    currentScroll = list.scrollTop();
                                }

                            }
                            break;

                        case 13: //enter
                            event.preventDefault();
                            list.hide();
                            prevKey = currentListElem[0].textContent;
                            input.val(prevKey);
                            isInputDone = true;
                            input.blur();
                            if (options.type == "with arrow") {
                                for (var i = 0; i < data.length; i++) {
                                    if (data[i].City == prevKey) {
                                        numberInDataArr = i;
                                        break;
                                    }
                                }
                            }
                            break;

                        case 27: //escape
                            list.hide();
                            break;

                        case 8: //backspace
                            prevKey = input.val();
                            break;
                    }
                }

                if (event.type == "keyup") {
                    var key = $(this).val();

                    if (event.keyCode == 8) {
                        isInputDone = false;

                        if (options.type == "with arrow") {
                            if (currentListElem) {
                                currentListElem.removeClass("option-list_current");
                            }
                            currentScroll = 0;
                            list.scrollTop(currentScroll);
                        }

                        if (key == "") {
                            empty = true;
                        }
                    }

                    if (key != "" && key != prevKey && !isInputDone) {

                        if (empty) {
                            empty = false;
                        }

                        if (!isInputStarted) {
                            isInputStarted = true;
                        }

                        key = capitalize(key);
                        prevKey = key;
                        found = JSON.search(data, '//*[starts-with(City, "' + key + '")]');
                        list.show();

                        if (found.length) {
                            if (!isEmpty()) {
                                list.empty();
                            }
                            numberOfVariants = found.length;

                            if (options.type == "without arrow") {
                                if (found.length > 5) {
                                    numberOfVariants = 5;
                                }

                                for (var i = 0; i < numberOfVariants; i++) {
                                    list.append("<li class='autocomplete__list-item'>" + found[i].City + "</li>");
                                }
                            }

                            if (options.type == "with arrow") {
                                for (var i = 0; i < numberOfVariants; i++) {
                                    list.append("<li class='autocomplete__list-item'>" + found[i].City + "</li>");
                                }

                                if (numberOfVariants * list.children().eq(0).height() < originalHeight) {
                                    list.height(Math.ceil(numberOfVariants * list.children().eq(0).height()))
                                } else if (list.height() != originalHeight) {
                                    list.height(originalHeight);
                                }
                                currentScroll = 0;
                                list.scrollTop(currentScroll);
                            }

                            list.children(":first").addClass("option-list_current");
                            currentListElem = list.children(":first");

                            if (found.length > numberOfVariants && options.type == "without arrow") {
                                list.append("<p class='autocomplete__list-hint'>Показано " + numberOfVariants + " из " + found.length + " вариантов. Уточните запрос, чтобы увидеть остальные</p>")
                            }
                            moreCount = found.length - 4;

                        } else {
                            if (!isEmpty()) {
                                list.empty();
                            }
                            if (options.type == "with arrow") {
                                list.height(listItemHeight);
                            }
                            list.append("<p class='option-list_empty'>Не найдено</p>");
                        }

                    } else if (key == "") {

                        if (options.type == "with arrow") {
                            if (isInputStarted) {
                                list.empty();
                                list.height(originalHeight);
                                for (var j = 0; j < data.length; j++) {
                                    list.append("<li class='autocomplete__list-item'>" + data[j].City + "</li>");
                                }

                                isInputStarted = false;
                            }
                        } else {

                            if (options.favorites) {
                                if (isInputStarted) {
                                    list.empty();
                                    list.append("<p class='autocomplete__list-hint list-hint_top'>Популярные города</p>");
                                    for (var j = 0; j < favoritesArr.length; j++) {
                                        list.append("<li class='autocomplete__list-item'>" + favoritesArr[j].City + "</li>");
                                    }

                                    isInputStarted = false;
                                }
                            } else {
                                isInputDone = false;
                                prevKey = key;
                                list.hide();
                            }

                        }
                    }

                }
            });

            list.on('mouseenter', 'li', function () {
                if (currentListElem) {
                    currentListElem.removeClass("option-list_current");
                }
                $(this).addClass("option-list_current");
                currentListElem = $(this);
                if (options.type == "with arrow") {
                    currentScroll = list.scrollTop();
                }
            });

            list.on('mousedown', 'li', function () {
                isInputDone = true;
                prevKey = $(this)[0].textContent;
                input.val(prevKey);
                list.hide();
                if (options.type == "with arrow") {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].City == prevKey) {
                            numberInDataArr = i;
                            break;
                        }
                    }
                }
            });

        };

        return this.each(make);

    };
})(jQuery);