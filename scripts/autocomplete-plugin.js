(function($) {
    $.fn.autocomplete = function(data, options) {

        options = $.extend({
            type: "without arrow",
            favorites: false
        }, options);

        var make = function(){
            var input = $(this);

            input.parent().append("<ul class='autocomplete__option-list'></ul>");
            var list = input.parent().find(".autocomplete__option-list");

            if (options.type == "with arrow") {
                list.addClass("option-list_with-arrow");
            } else {
                list.addClass("option-list_without-arrow");
            }

            list.on( 'mousewheel DOMMouseScroll', function (e) {
                var e0 = e.originalEvent;
                var delta = e0.wheelDelta || -e0.detail;

                this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
                e.preventDefault();
            });

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

            var found;
            var moreCount;
            var prevKey;
            var currentListElem;
            var numberOfVariants;
            var isInputDone = false;
            var currentScroll = 0;
            var emptyNow = true;
            if (options.type == "with arrow") {
                var emptyListHeight = 27;
                var originalHeight = list.height();
            }

            if (options.favorites) {
                if (options.type == "with arrow") {
                    for (var k = 0; k < favoritesArr.length; k++) {
                        list.append("<li class='autocomplete__list-item'>" + favoritesArr[k].City + "</li>");
                    }
                    list.children(":last").addClass("list-item_last-favorite");
                } else {
                    list.append("<p class='autocomplete__list-hint list-hint_top'>Популярые города</p>");
                    for (var j = 0; j < favoritesArr.length; j++) {
                        list.append("<li class='autocomplete__list-item'>" + favoritesArr[j].City + "</li>");
                    }
                }
            }

            function isEmpty(el) {
                return !(el.find("p").length)
            }

            function capitalize(s) {
                return s[0].toUpperCase() + s.slice(1);
            }

            input.focus(function () {
                var key = $(this).val();

                $(this).removeClass("autocomplete-input_invalid");
                $(this).next(".autocomplete__invalid-text").remove();

                if ($(this).val() != "") {
                    $(this).select();
                }

                if (options.type == "with arrow") {
                    if (isEmpty(list)) {
                        numberOfVariants = data.length;
                        for (var i = 0; i < numberOfVariants; i++) {
                            list.append("<li class='autocomplete__list-item'>" + data[i].City + "</li>");
                        }
                    }

                    list.show();
                    if (currentScroll) {
                        list.scrollTop(currentScroll);
                    }

                    if (list.height() != originalHeight) {
                        list.height(originalHeight);
                    }

                    if (!currentListElem) {
                        currentListElem = list.children(":first");
                        currentListElem.addClass("option-list_current");
                    }
                } else {
                    if (options.favorites && !isInputDone) {
                        list.show();
                    }

                    if ($(this).val() != "" && !isInputDone) {
                        list.show();
                    }

                    if (isInputDone && key != prevKey) {
                        isInputDone = false;
                    }
                }
            });

            input.blur(function () {
                if (!isInputDone) {
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
                                for (var j = 0; j < data.length; j++) {
                                    list.append("<li class='autocomplete__list-item'>" + data[j].City + "</li>");
                                }
                            }
                            break;

                        case 27: //escape
                            list.hide();
                            break;

                        case 8: //backspace
                            isInputDone = false;
                            prevKey = input.val();
                            break;
                    }
                }

                if (event.type == "keyup") {
                    var key = $(this).val();
                    if (key && key != prevKey && !isInputDone) {
                        key = capitalize(key);
                        prevKey = key;
                        found = JSON.search(data, '//*[starts-with(City, "' + key + '")]');
                        list.show();

                        if (found.length) {
                            if (!isEmpty(list)) {
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
                            if (!isEmpty(list)) {
                                list.empty();
                            }
                            if (options.type == "with arrow") {
                                list.height(emptyListHeight);
                            }
                            list.append("<p class='option-list_empty'>Не найдено</p>");
                        }

                    } else if (key == "") {
                        if (options.type == "with arrow") {
                            if (isEmpty(list)) {
                                list.empty();
                                list.height(originalHeight);
                                for (var j = 0; j < data.length; j++) {
                                    list.append("<li class='autocomplete__list-item'>" + data[j].City + "</li>");
                                }
                                currentListElem = list.children(":first");
                                currentListElem.addClass("option-list_current");
                            }
                        } else {
                            isInputDone = false;
                            prevKey = key;
                            list.hide();
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
            });

            list.on('mousedown', 'li', function () {
                isInputDone = true;
                prevKey = $(this)[0].textContent;
                input.val(prevKey);
                list.hide();
                if (options.type == "with arrow") {
                    currentScroll = $(this).position().top;
                }
            });

        };

        return this.each(make);

    };
})(jQuery);